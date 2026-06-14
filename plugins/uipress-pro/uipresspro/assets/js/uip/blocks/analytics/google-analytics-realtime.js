const { __, _x, _n, _nx } = wp.i18n;
const defineAsyncComponent = window.uipress.defineAsyncComponent;
const uipVersion = window.uipress.proVersion;

export default {
  components: {
    ConnectGoogle: defineAsyncComponent(() => import(`./google-connect-account.min.js?ver=${uipVersion}`)),
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
      showGoogleConnection: false,
      requestFromGroupDate: false,
      currentRequest: false,
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
      groupDate: {},
      strings: {
        lastPeriod: __('last period', 'uipress-pro'),
        selectDataMetric: __("Please select a chart metric in this block's options to show chart data.", 'uipress-pro'),
        changeAccount: __('Switch account', 'uipress-pro'),
        minutesAgo: __('minutes ago', 'uipress-pro'),
        thirtyMinutesAgo: __('Thirty minutes ago', 'uipress-pro'),
        now: __('Now', 'uipress-pro'),
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
    'uipApp.googleAnalytics': {
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
  computed: {
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
     * Check if the API is ready.
     *
     * @returns {boolean} - Whether the API is ready or not.
     * @since 3.2.0
     */
    isApiReady() {
      return this.hasNestedPath(this.uipApp, 'googleAnalytics', 'ready');
    },
  },

  mounted() {
    // Mount an interval for live data
    setInterval(this.getAnalytics, 60000);
  },
  methods: {
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
      this.showGoogleConnection = false;
    },

    /**
     * Calculate the date range for fetching analytics data.
     *
     * @returns {Object} - An object containing the start and end dates.
     * @since 3.2.0
     */
    calculateDateRange() {
      let startDate, endDate;

      endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - this.returnRange);

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
      return await this.uipApp.googleAnalytics.api('get', startDate, endDate);
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
        this.showGoogleConnection = true;
      }
    },

    /**
     * Processes data returned from successful API call.
     *
     * @since 3.2.13
     */
    processResponse() {
      const data = this.currentRequest;
      const dataType = this.returnChartType;
      const activeNow = data.active_now.report;

      const { labels, dataset } = this.generateLabelsAndDataset(dataType, activeNow);

      this.setChartData(labels, dataset, dataType);
      this.total = activeNow.totals[dataType];
    },

    /**
     * Generate labels and dataset for the chart.
     *
     * @param {string} dataType - The type of data being processed.
     * @param {Object} activeNow - The active now report data.
     * @returns {Object} - An object containing labels and dataset arrays.
     * @since 3.2.13
     */
    generateLabelsAndDataset(dataType, activeNow) {
      let labels = [];
      let dataset = [];

      for (let i = 0; i <= 29; i++) {
        labels.push(`${i} ${this.strings.minutesAgo}`);

        const search = i.toString().padStart(2, '0');
        const val = activeNow.data.find((x) => x.minutesAgo === search);

        dataset.push(val ? val[dataType] : 0);
      }

      return {
        labels: labels.reverse(),
        dataset: dataset.reverse(),
      };
    },

    /**
     * Set chart data properties.
     *
     * @param {Array} labels - The labels for the chart.
     * @param {Array} dataset - The dataset for the chart.
     * @param {string} dataType - The type of data being processed.
     * @since 3.2.13
     */
    setChartData(labels, dataset, dataType) {
      if (this.returnChartSettings) {
        this.chartData.custom = this.returnChartSettings;
      }

      this.chartData.colors.main = this.returnLineColor;
      this.chartData.title = this.returnName;
      this.chartData.type = 'bar';
      this.chartData.data.main = dataset;
      this.chartData.labels.main = labels;
    },

    /**
     * Removes the analytic account
     *
     * @since 3.2.0
     */
    async removeAnalyticsAccount() {
      this.uipApp.googleAnalytics.ready = false;
      //Send request to API
      await this.uipApp.googleAnalytics.api('removeAccount');
      //The API call was successful

      await this.uipApp.googleAnalytics.api('refresh');
      //The API call was successful
      this.uipApp.googleAnalytics.ready = true;
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
      this.uipApp.googleAnalytics.ready = false;
      //Send request to API
      const response = await this.uipApp.googleAnalytics.api('refresh');
      //The API call was successful
      if (response) {
        this.uipApp.googleAnalytics.ready = true;
        this.getAnalytics();
      }
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
  <div class="uip-flex uip-flex-column uip-text-normal uip-w-200">
  
        <!-- Header -->
        <div class="uip-flex uip-flex-between">
        
          <!--Chart title-->
          <div class="uip-margin-bottom-xxs uip-text-normal uip-chart-title">{{returnName}}</div>
          
          <!-- Account switcher-->
          <dropdown pos="bottom right" v-if="!inlineAccountSwitch && !showGoogleConnection">
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
        
        <div class="uip-margin-bottom-xxs"><ConnectGoogle v-if="showGoogleConnection" :success="refreshAnalytics"/></div>
        
        <div v-if="loading" class="uip-padding-m uip-flex uip-flex-center uip-flex-middle uip-w-100p uip-ratio-16-10 uip-border-box"><loading-chart></loading-chart></div>
        
        <div v-else-if="error && errorMessage" class="uip-padding-xs uip-border-round uip-background-orange-wash uip-text-bold uip-margin-bottom-s uip-scale-in-top uip-max-w-100p" v-html="returnErrrorMessage()"></div>
        
        <div v-else-if="!returnChartType" class="uip-padding-xxs uip-border-round uip-background-green-wash uip-text-green uip-text-bold uip-margin-bottom-s uip-scale-in-top uip-max-w-200">{{strings.selectDataMetric}}</div>
        
        <!--Chart data-->
        <div v-else class="uip-flex uip-flex-column uip-row-gap-xs uip-w-100p">
        
          <div class="uip-flex uip-flex-between uip-gap-xxs uip-flex-center uip-margin-bottom-xs">
          
            <div class="uip-text-xl uip-text-bold">{{returnTotal}}</div>
            
            <div class="uip-text-s uip-background-orange-wash uip-border-round uip-padding-xxxs uip-padding-left-xs uip-padding-right-xs uip-post-type-label uip-flex uip-gap-xxs uip-flex-center uip-text-bold uip-tag-label">live</div>
            
          </div>
          
          <uip-chart v-if="!hideChart && rendered" :chartData="returnChartData" class="uip-chart-canvas"/>
          
          <div class="uip-flex uip-flex-row uip-flex-between" v-if="!hideChart">
            <div class="uip-text-s uip-text-muted uip-chart-label">{{strings.thirtyMinutesAgo}}</div>
            <div class="uip-text-s uip-text-muted uip-chart-label">{{strings.now}}</div>
          </div>
          
        </div>
        
  </div>`,
};
