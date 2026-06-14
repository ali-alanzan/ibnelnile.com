const { __, _x, _n, _nx } = wp.i18n;
import * as mapbox from '../../../libs/mapbox.js';
import Countries from '../../../libs/country_data.min.js';
mapboxgl.accessToken = 'pk.eyJ1IjoibWFya2FzaHRvbiIsImEiOiJjbGRrZGYyc2IwamRuM3ZsZ2JudXdwMjRtIn0.V_oXBXMGBUBty-fZY0VXfg';

export default {
  props: {
    display: String,
    name: String,
    block: Object,
  },

  data() {
    return {
      loading: true,
      error: false,
      map: false,
      apiLoaded: false,
      errorMessage: '',
      total: 0,
      comparisonTotal: 0,
      percentChange: 0,
      fetchingQuery: false,
      requestFromGroupDate: false,
      currentRequest: false,
      startDate: '',
      endDate: '',
      currentData: [],
      groupDate: {},
      chartData: {
        data: {
          main: [],
          comparison: [],
        },
        labels: {
          main: [],
          comparisons: [],
        },
        title: '',
        colors: {
          main: this.returnLineColor,
          comp: this.returnCompLineColor,
        },
      },
      strings: {
        lastPeriod: __('last period', 'uipress-pro'),
        selectDataMetric: __("Please select a chart metric in this block's options to show chart data.", 'uipress-pro'),
        changeAccount: __('Switch account', 'uipress-pro'),
        count: __('Count', 'uipress-pro'),
        change: __('Change', 'uipress-pro'),
        current: __('Current', 'uipress-pro'),
        previous: __('Previous', 'uipress-pro'),
        users: __('users', 'uipress-pro'),
      },
    };
  },
  inject: ['uiTemplate'],
  watch: {
    /**
     * Watches for data changes and builds the map when required
     *
     * @type {Object}
     */
    currentData: {
      handler() {
        this.buildMap();
      },
      immediate: true,
      deep: true,
    },
    /**
     * Watches changes to chart data type and updates analytics
     *
     * @since 3.2.0
     */
    'block.settings.block.options.chartDataType': {
      handler(newValue, oldvalue) {
        this.getAnalytics();
      },
      deep: true,
    },

    /**
     * Watches changes to analytics api and fetches analytics
     *
     * @since 3.2.0
     */
    'uipApp.woocommerce': {
      handler(newValue, oldValue) {
        if (!newValue.ready) return;
        this.getAnalytics();
      },
      deep: true,
      immediate: true,
    },

    /**
     * Watches changes to the analytics account and refreshes
     *
     * @since 3.2.0
     */
    'uiTemplate.globalSettings.options.analytics.saveAccountToUser': {
      handler(newVal, oldVal) {
        this.refreshAnalytics();
      },
    },
  },
  mounted() {
    document.addEventListener('uipress/app/daterange/change', this.handleDateChange);
  },
  beforeUnmount() {
    document.removeEventListener('uipress/app/daterange/change', this.handleDateChange);
    if (!this.map) return;
    this.map.remove();
    this.map = false;
  },
  computed: {
    /**
     * Returns table data
     *
     * @since 3.2.0
     */
    returnTableData() {
      return this.isObject(this.currentData) ? this.currentData : {};
    },

    /**
     * Returns path to mapbox css
     *
     * @since 3.2.0
     */
    returnMappCss() {
      return uipProPath + 'assets/css/libs/mapbox.css';
    },
    /**
     * Returns total for chart metric
     *
     * @since 3.2.0
     */
    returnTotal() {
      return this.total;
    },

    /**
     * Returns comparison total for chart metric
     *
     * @since 3.2.0
     */
    returnComparisonTotal() {
      return this.comparisonTotal;
    },

    /**
     * Returns chart data
     *
     * @since 3.2.0
     */
    returnChartData() {
      return this.chartData;
    },

    /**
     * Returns name for chart
     *
     * @since 3.2.0
     */
    returnName() {
      let chartname = this.get_block_option(this.block, 'block', 'chartName', true);
      if (!chartname) return '';

      chartname = this.isObject(chartname) ? chartname.string : chartname;
      return chartname;
    },

    /**
     * Return chart type
     *
     * @since 3.2.0
     */
    returnChartType() {
      return this.get_block_option(this.block, 'block', 'chartDataType');
    },

    /**
     * Return chart settings
     *
     * @since 3.2.0
     */
    returnChartSettings() {
      return this.get_block_option(this.block, 'block', 'chartOptions');
    },

    /**
     * Return style for chart
     *
     * @since 3.2.0
     */
    returnChartStyle() {
      let chartDataType = this.get_block_option(this.block, 'block', 'chartStyle');
      if (!chartDataType) return 'line';

      chartDataType = this.isObject(chartDataType) ? chartDataType.value : 'line';
      return chartDataType;
    },

    /**
     * Returns line colour for chart
     *
     * @since 3.2.0
     */
    returnLineColor() {
      let color = this.get_block_option(this.block, 'block', 'chartColour');
      if (!color) return '';

      color = this.isObject(color) ? color.value : color;
      return color;
    },

    /**
     * Returns comparison line colour
     *
     * @since 3.2.0
     */
    returnCompLineColor() {
      let color = this.get_block_option(this.block, 'block', 'chartCompColour');
      if (!color) return '';

      color = this.isObject(color) ? color.value : color;
      return color;
    },

    /**
     * Return whether the chart is hidden
     *
     * @since 3.2.0
     */
    hideChart() {
      let hideChart = this.get_block_option(this.block, 'block', 'hideChart');
      if (!hideChart) return '';

      hideChart = this.isObject(hideChart) ? hideChart.value : hideChart;
      return hideChart;
    },

    /**
     * Returns whether the chart has a account switcher
     *
     * @since 3.2.0
     */
    inlineAccountSwitch() {
      let accountSwitch = this.get_block_option(this.block, 'block', 'inlineAccountSwitch');
      if (!accountSwitch) return true;

      accountSwitch = this.isObject(accountSwitch) ? accountSwitch.value : accountSwitch;
      return accountSwitch;
    },

    /**
     * Returns user set date range
     *
     * @since 3.2.0
     */
    returnRange() {
      let range = this.get_block_option(this.block, 'block', 'dateRange');
      if (!range) return 14;
      range = isNaN(range) ? 14 : range;
      range = range > 60 ? 60 : range;
      return range;
    },

    /**
     * Returns whether the date is set by a global date
     *
     * @returns {boolean}
     * @since 3.2.0
     */
    hasGlobalDate() {
      return this.hasNestedPath(this.groupDate, 'start') ? true : false;
    },

    /**
     * Check if the API is ready.
     *
     * @returns {boolean} - Whether the API is ready or not.
     * @since 3.2.0
     */
    isApiReady() {
      return this.hasNestedPath(this.uipApp, 'woocommerce', 'ready');
    },

    /**
     * Returns the theme for the map
     *
     * @since 3.2.0
     */
    darkMapTheme() {
      let darkMode = this.get_block_option(this.block, 'block', 'darkMode');
      if (!darkMode) return false;

      darkMode = this.isObject(darkMode) ? darkMode.value : false;
      return darkMode;
    },
  },
  methods: {
    /**
     * Handles date change events
     *
     * @param {object} evt - date change event
     * @since 3.2.0
     */
    handleDateChange(evt) {
      if (!evt.detail.IDS) return;
      if (!Array.isArray(evt.detail.IDS)) return;
      if (!evt.detail.IDS.includes(this.block.uid)) return;

      this.groupDate.start = evt.detail.groupDate.start;
      this.groupDate.end = evt.detail.groupDate.end;
      this.getAnalytics();
    },

    /**
     * Returns correct symbol
     *
     * @param {string} total
     * @since 3.2.0
     */
    returnSymbolTotal(total) {
      if (this.returnChartType == 'total_revenue') {
        if (this.currentRequest.data.currency_pos == 'left') {
          return this.currentRequest.data.currency + total;
        }
        if (this.currentRequest.data.currency_pos == 'left_space') {
          return this.currentRequest.data.currency + ' ' + total;
        }
        if (this.currentRequest.data.currency_pos == 'right') {
          return total + this.currentRequest.data.currency;
        }
        if (this.currentRequest.data.currency_pos == 'right_space') {
          return total + ' ' + this.currentRequest.data.currency;
        }
      }
      return total;
    },

    /**
     * Main function for fetching analytics data.
     *
     * @since 3.2.0
     */
    async getAnalytics() {
      this.resetErrorState();
      this.apiLoaded = this.isApiReady;

      if (!this.apiLoaded) return;

      this.loading = true;

      const { startDate, endDate } = this.calculateDateRange();

      const response = await this.fetchAnalyticsData(startDate, endDate);

      if (response.error) {
        this.handleApiError(response);
      } else {
        this.currentRequest = response;
        this.processResponse(response);
      }
      this.loading = false;
    },

    /**
     * Reset error state variables.
     *
     * @since 3.2.0
     */
    resetErrorState() {
      this.error = false;
      this.errorMessage = '';
    },

    /**
     * Calculate the date range for fetching analytics data.
     *
     * @returns {Object} - An object containing the start and end dates.
     * @since 3.2.0
     */
    calculateDateRange() {
      let startDate, endDate;

      if (this.hasGlobalDate) {
        startDate = new Date(Date.parse(this.groupDate.start));
        endDate = new Date(Date.parse(this.groupDate.end));
      } else {
        endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        startDate = new Date();
        startDate.setDate(startDate.getDate() - this.returnRange);
      }

      this.startDate = startDate;
      this.endDate = endDate;

      return { startDate, endDate };
    },

    /**
     * Fetch analytics data from the API.
     *
     * @param {Date} startDate - The start date for fetching data.
     * @param {Date} endDate - The end date for fetching data.
     * @returns {Object} - The API response.
     * @since 3.2.0
     */
    async fetchAnalyticsData(startDate, endDate) {
      return await this.uipApp.woocommerce.api('get', startDate, endDate);
    },

    /**
     * Handle API errors and update state variables accordingly.
     *
     * @param {Object} error - The error object.
     * @since 3.2.0
     */
    handleApiError(error) {
      this.error = true;
      this.errorMessage = error.message;
    },

    /**
     * Handles data response
     *
     * @since 3.2.0
     */
    processResponse() {
      let data = this.currentRequest;
      let dataType = this.returnChartType;

      if (!dataType) return;

      data.data.map_data = this.calculateMapPercentages(data.data.map_data);

      this.currentData = data.data.map_data;
    },

    /**
     * Calculates order totals for map data
     *
     * @param {object} data
     * @since 3.2.05
     */
    calculateMapPercentages(data) {
      let total = 0;
      const mapType = this.returnChartType;

      for (let countryCode in data) {
        let values = data[countryCode][mapType];
        total += values.total;
      }

      for (let countryCode in data) {
        let value = data[countryCode][mapType].total;
        let percentTotal = value !== 0 && total !== 0 ? ((value / total) * 100).toFixed(2) : 0;
        data[countryCode][mapType].percent_total = percentTotal;
      }
      return data;
    },

    /**
     * Removes the analytic account
     *
     * @since 3.2.0
     */
    async removeAnalyticsAccount() {
      this.uipApp.woocommerce.ready = false;
      //Send request to API
      await this.uipApp.woocommerce.api('removeAccount');
      //The API call was successful

      await this.uipApp.woocommerce.api('refresh');
      //The API call was successful
      this.uipApp.woocommerce.ready = true;
      this.getAnalytics();
    },

    /**
     * Refreshes analytics
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async refreshAnalytics() {
      this.uipApp.woocommerce.ready = false;
      //Send request to API
      const response = await this.uipApp.woocommerce.api('refresh');
      //The API call was successful
      if (response) {
        this.uipApp.woocommerce.ready = true;
        this.getAnalytics();
      }
    },

    /**
     * Returns a formatted date.
     *
     * @param {Date} date - The date to format.
     * @returns {string} - The formatted date string in "YYYY/MM/DD" format.
     * @since 3.2.0
     */
    returnFormattedDate(date) {
      if (!date) return '';

      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');

      return `${year}/${month}/${day}`;
    },

    /**
     * Returns the current error message
     *
     * @since 3.2.0
     */
    returnErrrorMessage() {
      try {
        JSON.parse(this.errorMessage);
      } catch (error) {
        return this.errorMessage;
      }

      if (this.isObject(JSON.parse(this.errorMessage))) {
        let messs = JSON.parse(this.errorMessage);
        return `
              <h5 style="margin:0">${messs.status}</h5>
              <p style="margin-bottom:0;">${messs.message}</p>
            `;
      }

      return this.errorMessage;
    },

    /**
     * Builds mapbox with wc data
     *
     * @since 3.2.0
     */
    async buildMap() {
      await this.$nextTick();

      // Remove map if it already exists
      if (this.map) {
        this.map.remove();
        this.map = false;
      }

      let theme = 'mapbox://styles/markashton/cldkdgzpx008t01rvfdmhtwet';
      if (this.darkMapTheme || this.uipApp.data.userPrefs.darkTheme) {
        theme = 'mapbox://styles/markashton/cldklav6v009701rv47a1q7pa';
      }

      // No container rendered yet so abort
      if (!this.$refs.mapcontainer) return;

      const map = new mapboxgl.Map({
        container: 'uip-wc-map' + this.block.uid,
        style: theme,
        zoom: 1,
        center: [-10, 14],
      });

      this.map = map;

      // Add zoom and rotation controls to the map.
      map.addControl(new mapboxgl.NavigationControl());

      let codes = Countries;

      // add markers to map
      for (const countrykey in this.returnTableData) {
        //Find the country from the list
        let countryDetails = codes.find((obj) => {
          return obj.alpha2.toLowerCase() === countrykey.toLowerCase();
        });

        //Couldn't find the country details so skip this one.
        if (typeof countryDetails === 'undefined') {
          continue;
        }

        // Create the tooltip
        const toolTip = this.createToolTip(this.returnTableData[countrykey], countryDetails);

        // make a marker for each feature and add it to the map
        new mapboxgl.Marker(toolTip.el)
          .setLngLat([countryDetails.longitude, countryDetails.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }) // add popups
              .setHTML(toolTip.inner)
          )
          .addTo(map);
      }
    },

    /**
     * Creates a tooltip for the country data item
     *
     * @param {object} country - the current country
     * @since 3.2.0
     */
    createToolTip(countrystats, countryDetails) {
      const country = countrystats[this.returnChartType];
      // create a HTML element for each feature
      const el = document.createElement('div');
      el.className = 'marker uip-w-10 uip-ratio-1-1 uip-background-primary-wash uip-border-circle uip-border-primary';

      let width = country.percent_total * 3;
      el.style.width = width + 'px';

      let arrow = country.change < 0 ? 'arrow_downward' : '';
      arrow = country.change > 0 ? 'arrow_upward' : arrow;

      let inner = `
          <div class="uip-background-default uip-boder uip-shadow uip-border-round">
            <div class="uip-background-default">
              <div class="uip-padding-xs uip-padding-top-xxs uip-padding-bottom-xxs uip-border-bottom uip-body-font uip-text-left uip-overflow-hidden uip-flex uip-flex-row uip-gap-xs uip-flex-between uip-flex-center">
              
                <div class="uip-text-bold uip-text-emphasis">
                  ${countryDetails.country}
                </div>
                
                <div class="uip-text-s uip-background-orange-wash uip-border-round uip-padding-xxxs uip-post-type-label uip-flex uip-gap-xxs uip-flex-center uip-text-bold uip-tag-label uip-text-normal">
                  <span class="uip-icon">${arrow}</span>
                  <span>${country.change}%</span>
                </div>
                
              </div>
              
              <div class="uip-padding-xs uip-flex uip-flex-column uip-row-gap-xxs">
                <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-between uip-min-w-130">
                  <div class="uip-text-bold uip-text-primary uip-no-wrap" >${this.returnSymbolTotal(country.total) + ' ' + country.label}</div>
                  <div class="uip-text-s uip-text-muted">${this.strings.current}</div>
                </div>
                <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-between uip-min-w-130">
                  <div class="uip-text-bold uip-text-orange uip-no-wrap">${this.returnSymbolTotal(country.total_comp) + ' ' + country.label}</div>
                  <div class="uip-text-s uip-text-muted">${this.strings.previous}</div>
                </div>
              </div>
            </div>
          </div>`;

      return { el, inner };
    },
  },
  template: `
  <div class="uip-flex uip-flex-column uip-w-300">
    
      <component is="style">
        @import '{{returnMappCss}}';
        .mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right{
         display:none; 
        }
        .marker {
          border-radius: 50%;
          cursor: pointer;
          animation: pulse-outline 2.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) -.4s infinite;
          transition: outline 5s ease, opacity .2s ease;
        }
        @keyframes pulse-outline {
          0% {
            outline: 0px solid var(--uip-color-primary-lighter);
          }
          100% {
           outline: 12px solid transparent;
          }
        }
        .mapboxgl-popup {
          max-width: 200px;
        }
        .mapboxgl-popup-content {
          padding:0;
          box-shadow:none;
          border-radius:4px;
        }
        .mapboxgl-popup-close-button {
          top:5px; 
          display:none;
        }
        .uip-dark-mode .mapboxgl-ctrl-top-right{
         filter: invert(1); 
        }
        .mapboxgl-popup-anchor-top .mapboxgl-popup-tip{
          border-bottom-color: var(--uip-color-base-0); 
        }
        .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip{
          border-top-color: var(--uip-color-base-0); 
        }
        .mapboxgl-popup-anchor-left .mapboxgl-popup-tip{
          border-right-color: var(--uip-color-base-0); 
        }
        .mapboxgl-popup-anchor-right .mapboxgl-popup-tip{
          border-left-color: var(--uip-color-base-0); 
        }
        .mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip{
          border-bottom-color: var(--uip-color-base-0); 
        }
        .mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip{
          border-bottom-color: var(--uip-color-base-0); 
        }
        .mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip{
          border-top-color: var(--uip-color-base-0); 
        }
        .mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip{
          border-top-color: var(--uip-color-base-0); 
        }
        
      </component>
      
      
      <!-- Header -->
      <div class="uip-flex uip-flex-between">
      
        <!--Chart title-->
        <div class="uip-margin-bottom-xxs uip-text-normal uip-chart-title">{{returnName}}</div>
        
      </div>
      
      <div class="uip-text-s uip-text-muted uip-margin-bottom-s uip-margin-bottom-s uip-dates">{{returnFormattedDate(startDate)}} - {{returnFormattedDate(endDate)}}</div>
      
      <div v-if="loading" class="uip-padding-m uip-flex uip-flex-center uip-flex-middle  uip-w-100p uip-ratio-16-10 uip-border-box"><loading-chart></loading-chart></div>
      
      <div v-else-if="error && errorMessage" class="uip-padding-xs uip-border-round uip-background-orange-wash uip-text-bold uip-margin-bottom-s uip-scale-in-top uip-max-w-100p" v-html="returnErrrorMessage()"></div>
      
      <div v-else-if="!returnChartType" class="uip-padding-xxs uip-border-round uip-background-green-wash uip-text-green uip-text-bold uip-margin-bottom-s uip-scale-in-top uip-max-w-200">{{strings.selectDataMetric}}</div>
      
        
      <div v-else class="uip-position-relative uip-h-100p uip-w-100p" 
      :class="{'uip-dark-mode' : darkMapTheme || uipApp.data.userPrefs.darkTheme}">
        <div ref="mapcontainer" :id="'uip-wc-map'+block.uid" class="uip-wc-map uip-w-100p uip-h-200"></div>
      </div>
      
     
      
  </div>`,
};
