const { __, _x, _n, _nx } = wp.i18n;
const defineAsyncComponent = window.uipress.defineAsyncComponent;
const uipVersion = window.uipress.proVersion;

export default {
  components: {
    ConnectMatomo: defineAsyncComponent(() => import(`./matomo-connect-account.min.js?ver=${uipVersion}`)),
  },

  props: {
    display: String,
    name: String,
    block: Object,
  },

  data() {
    return {
      loading: true,
      rendered: true,
      error: false,
      apiLoaded: false,
      errorMessage: '',
      total: 0,
      comparisonTotal: 0,
      percentChange: 0,
      fetchingQuery: false,
      showMatomoConnection: false,
      requestFromGroupDate: false,
      currentRequest: false,
      startDate: '',
      endDate: '',
      currentData: [],
      groupDate: {},
      chartData: {
        labels: {
          main: [],
          comparisons: [],
        },
      },
      strings: {
        lastPeriod: __('last period', 'uipress-pro'),
        selectDataMetric: __("Please select a chart metric in this block's options to show chart data.", 'uipress-pro'),
        changeAccount: __('Switch account', 'uipress-pro'),
        count: __('Count', 'uipress-pro'),
        change: __('Change', 'uipress-pro'),
      },
    };
  },
  inject: ['uiTemplate'],
  watch: {
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
    'uipApp.matomoAnalytics': {
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
  },
  computed: {
    /**
     * Returns table data for table
     *
     * @since 3.2.0
     */
    returnTableData() {
      return this.currentData;
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
      return this.hasNestedPath(this.uipApp, 'matomoAnalytics', 'ready');
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
      this.showMatomoConnection = false;
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
      return await this.uipApp.matomoAnalytics.api('get', startDate, endDate);
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

      if (error.type === 'no_account') {
        this.showMatomoConnection = true;
      }
    },

    /**
     * Processes data returned from successful API call
     *
     * @since 3.2.13
     */
    processResponse() {
      let data = this.currentRequest;
      let dataType = this.returnChartType;
      this.matomoPath = this.currentRequest.matomoPath;

      if (!dataType) {
        return;
      }
      let processedData = [];

      for (let [index, dataPoint] of data.reports[dataType].entries()) {
        dataPoint.change = dataPoint.nb_visits * 100;

        let comparisonData = data.reports_comparison[dataType][index];
        if (comparisonData) {
          let compValue = comparisonData.nb_visits;
          let actualValue = dataPoint.nb_visits;
          if (compValue != 0 && actualValue != 0) {
            dataPoint.change = ((actualValue / compValue) * 100).toFixed(2);
          }
        }

        processedData.push(dataPoint);
      }

      this.currentData = processedData;
    },

    /**
     * Removes the analytic account
     *
     * @since 3.2.0
     */
    async removeAnalyticsAccount() {
      this.uipApp.matomoAnalytics.ready = false;
      //Send request to API
      await this.uipApp.matomoAnalytics.api('removeAccount');
      //The API call was successful

      await this.uipApp.matomoAnalytics.api('refresh');
      //The API call was successful
      this.uipApp.matomoAnalytics.ready = true;
      this.getAnalytics();
    },

    /**
     * Convert seconds into a human-readable format (minutes and seconds).
     *
     * @param {number} seconds - The time in seconds to convert.
     * @returns {string} - The time formatted as a string in the format "Xm Ys".
     * @since 3.2.0
     */
    secondsToTime(seconds) {
      if (isNaN(seconds) || seconds < 0) {
        return '0m 0s';
      }

      const minutes = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
      const remainingSeconds = (seconds % 60).toString().padStart(2, '0');

      return `${minutes}m ${remainingSeconds}s`;
    },
    /**
     * Refreshes analytics
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async refreshAnalytics() {
      this.uipApp.matomoAnalytics.ready = false;
      //Send request to API
      const response = await this.uipApp.matomoAnalytics.api('refresh');
      //The API call was successful
      if (response) {
        this.uipApp.matomoAnalytics.ready = true;
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
  },
  template: `
  
  <div class="uip-flex uip-flex-column uip-text-normal">
  
      <!-- Header -->
      <div class="uip-flex uip-flex-between">
      
        <!--Chart title-->
        <div class="uip-margin-bottom-xxs uip-text-normal uip-chart-title">{{returnName}}</div>
        
        <!-- Account switcher-->
        <dropdown pos="bottom right" v-if="!inlineAccountSwitch && !showMatomoConnection">
          <template v-slot:trigger>
            <div class="uip-icon uip-link-muted uip-text-l">more_horiz</div>
          </template>
          <template v-slot:content>
            <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center uip-padding-xxxs uip-link-muted" @click="removeAnalyticsAccount()">
              <div class="uip-icon">sync</div>\
              <div class="uip-padding-xxs">{{strings.changeAccount}}</div>
            </div>
          </template>
        </dropdown>  
        
      </div>
    
      <div class="uip-text-s uip-text-muted uip-margin-bottom-s uip-margin-bottom-s uip-dates">{{returnFormattedDate(startDate)}} - {{returnFormattedDate(endDate)}}</div>
      <div class="uip-margin-bottom-xxs" v-if="showMatomoConnection"><ConnectMatomo :success="refreshAnalytics"/></div>
      <div v-if="loading" class="uip-padding-m uip-flex uip-flex-center uip-flex-middle uip-min-w-200 uip-w-100p uip-ratio-16-10 uip-border-box"><loading-chart/></div>
      <div v-else-if="error && errorMessage" class="uip-padding-xs uip-border-round uip-background-orange-wash uip-text-bold uip-margin-bottom-s uip-scale-in-top uip-max-w-100p" v-html="returnErrrorMessage()"></div>
      <div v-else-if="!returnChartType" class="uip-padding-xxs uip-border-round uip-background-green-wash uip-text-green uip-text-bold uip-margin-bottom-s uip-scale-in-top uip-max-w-200">{{strings.selectDataMetric}}</div>
      
      <table v-else class="uip-min-w-250 uip-w-100p uip-table">
        <thead>
          <tr class="">
            <th class="uip-padding-bottom-xxs"></th>
            <th class="uip-text-muted uip-text-weight-normal uip-text-right uip-padding-bottom-xxs">{{strings.count}}</th>
            <th class="uip-text-right uip-text-muted uip-text-weight-normal uip-padding-bottom-xxs">{{strings.change}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in currentData">
            <td class="uip-text-bold uip-padding-bottom-xxs uip-flex uip-gap-xs uip-flex-center">
              <img v-if="item.logo" :src="matomoPath + item.logo" class="uip-h-12 uip-border-rounder">
              <span>{{item.label}}</span>
            </td>
            <td class="uip-text-right uip-padding-bottom-xxs">{{item.nb_visits}}</td>
            <td class="uip-text-right uip-padding-bottom-xxs">
              <div class="uip-text-s uip-background-orange-wash uip-border-round uip-padding-xxxs uip-post-type-label uip-flex uip-gap-xxs uip-flex-center uip-text-bold uip-tag-label uip-inline-flex">
                <span v-if="item.change > 0" class="uip-icon uip-text-green">arrow_upward</span>
                <span v-if="item.change < 0" class="uip-icon uip-text-danger">arrow_downward</span>
                <span class="uip-percentage-value">{{item.change}}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      
  </div>
     `,
};
