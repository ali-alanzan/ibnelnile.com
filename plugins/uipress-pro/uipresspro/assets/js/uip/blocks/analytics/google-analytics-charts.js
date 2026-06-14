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
     * Watches changes to chart settings and updates analytics
     *
     * @since 3.2.0
     */
    returnChartSettings: {
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
  mounted() {
    document.addEventListener('uipress/app/daterange/change', this.handleDateChange);
  },
  beforeUnmount() {
    document.removeEventListener('uipress/app/daterange/change', this.handleDateChange);
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
     * Returns whether the date is set by a global date
     *
     * @returns {boolean}
     * @since 3.2.0
     */
    hasGlobalDate() {
      const status = this.hasNestedPath(this.groupDate, 'start');
      return status ? true : false;
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

      if (this.hasGlobalDate) {
        startDate = new Date(Date.parse(this.groupDate.start));
        endDate = new Date(Date.parse(this.groupDate.end));
      } else {
        endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        startDate = new Date();
        startDate.setDate(startDate.getDate() - this.returnRange);
      }

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
     * Processes data returned from successful API call
     *
     * @since 3.2.13
     */
    processResponse() {
      const data = this.currentRequest;
      const dataType = this.returnChartType;

      // Extract and process chart data
      const { chartData, chartComparisonData } = this.extractAndProcessChartData(data, dataType);

      // Set chart data and labels
      this.setChartDataAndLabels(data, chartData, chartComparisonData, dataType);

      // Set totals and percentage change
      this.setTotalsAndPercentageChange(data, dataType);

      // Format totals
      this.formatTotals(dataType, data);
    },

    /**
     * Extract and process chart data and comparison data.
     *
     * @param {Object} data - The data object containing timeline and report data.
     * @param {string} dataType - The type of data being processed.
     * @returns {Object} - An object containing processed chart data and chart comparison data.
     * @since 3.2.13
     */
    extractAndProcessChartData(data, dataType) {
      let chartData = [];
      let chartComparisonData = [];

      for (let [index, value] of data.timeline.report.data.entries()) {
        chartData.push(this.calculateActualValue(value, dataType));
        chartComparisonData.push(this.calculateComparisonValue(data, index, dataType));
      }

      return { chartData, chartComparisonData };
    },

    /**
     * Calculate the actual value for chart data.
     *
     * @param {Object} value - The data object containing values for a specific data type.
     * @param {string} dataType - The type of data being processed.
     * @returns {number|string} - The calculated actual value.
     * @since 3.2.13
     */
    calculateActualValue(value, dataType) {
      if (dataType === 'userEngagementDuration') {
        return this.calculateEngagementDuration(value[dataType], value.totalUsers);
      }
      return value[dataType];
    },

    /**
     * Calculate the comparison value for chart data.
     *
     * @param {Object} data - The data object containing timeline and report data.
     * @param {number} index - The index of the current data entry.
     * @param {string} dataType - The type of data being processed.
     * @returns {number|string} - The calculated comparison value.
     * @since 3.2.13
     */
    calculateComparisonValue(data, index, dataType) {
      const comparisonData = data.timeline.report_comparison.data[index];
      if (comparisonData && dataType in comparisonData) {
        if (dataType === 'userEngagementDuration') {
          return this.calculateEngagementDuration(comparisonData[dataType], comparisonData.totalUsers);
        }
        return comparisonData[dataType];
      }
      return '0';
    },

    /**
     * Calculate user engagement duration.
     *
     * @param {number} totalTime - The total time of user engagement.
     * @param {number} totalUsers - The total number of users.
     * @returns {number} - The calculated engagement duration.
     * @since 3.2.13
     */
    calculateEngagementDuration(totalTime, totalUsers) {
      return totalTime !== 0 || totalUsers !== 0 ? (totalTime / totalUsers).toFixed(2) : 0;
    },

    /**
     * Set chart data and labels.
     *
     * @param {Object} data - The data object containing timeline and report data.
     * @param {Array} chartData - The processed chart data.
     * @param {Array} chartComparisonData - The processed chart comparison data.
     * @param {string} dataType - The type of data being processed.
     * @since 3.2.13
     */
    setChartDataAndLabels(data, chartData, chartComparisonData, dataType) {
      this.chartData.colors.main = this.returnLineColor;
      this.chartData.colors.comp = this.returnCompLineColor;
      this.chartData.title = this.returnName;
      this.chartData.type = this.returnChartStyle;
      this.chartData.data.main = chartData;
      this.chartData.data.comparison = chartComparisonData;
      this.chartData.labels.main = data.timeline.report.dates;
      this.chartData.labels.comparison = data.timeline.report_comparison.dates;
      this.chartData.custom = this.returnChartSettings;
    },

    /**
     * Set totals and percentage change for the chart data.
     *
     * @param {Object} data - The data object containing timeline and report data.
     * @param {string} dataType - The type of data being processed.
     * @since 3.2.13
     */
    setTotalsAndPercentageChange(data, dataType) {
      this.total = data.timeline.report.totals[dataType];
      this.percentChange = data.timeline.report.totals_change[dataType];

      if (dataType in data.timeline.report_comparison.totals) {
        this.comparisonTotal = data.timeline.report_comparison.totals[dataType];
      } else {
        this.comparisonTotal = 'NA';
      }
    },

    /**
     * Format total values based on the data type.
     *
     * @param {string} dataType - The type of data being processed.
     * @param {Object} data - The data object containing timeline and report data.
     * @since 3.2.13
     */
    formatTotals(dataType, data) {
      if (this.total !== '') {
        this.total = new Intl.NumberFormat(this.uipApp.data.options.locale).format(this.total);
      }
      if (this.comparisonTotal !== '' && this.comparisonTotal !== 'NA') {
        this.comparisonTotal = new Intl.NumberFormat(this.uipApp.data.options.locale).format(this.comparisonTotal);
      }

      if (dataType === 'engagementRate') {
        this.total = (this.total / data.timeline.report.dates.length).toFixed(2) + '%';
        this.comparisonTotal = (this.comparisonTotal / data.timeline.report_comparison.dates.length).toFixed(2) + '%';
      } else if (dataType === 'purchaserConversionRate') {
        this.total += '%';
        this.comparisonTotal += '%';
      } else if (dataType === 'userEngagementDuration') {
        this.total = this.secondsToTime(data.timeline.report.totals[dataType] / data.timeline.report.totals.totalUsers);
        this.comparisonTotal = this.secondsToTime(data.timeline.report_comparison.totals[dataType] / data.timeline.report_comparison.totals.totalUsers);
      }
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
      const remainingSeconds = parseFloat((seconds % 60).toFixed(2))
        .toString()
        .padStart(2, '0');

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
          
          <div class="uip-flex uip-flex-column uip-row-gap-xs uip-chart-totals">
          
            <div class="uip-flex uip-flex-between uip-gap-xxs uip-flex-center">
              <div class="uip-text-xl uip-text-bold">{{returnTotal}}</div>
              <div class="uip-text-s uip-background-orange-wash uip-border-round uip-padding-xxxs uip-padding-left-xs uip-padding-right-xs uip-post-type-label uip-flex uip-gap-xxs uip-flex-center uip-text-bold uip-tag-label">
                <span v-if="percentChange > 0" class="uip-icon">arrow_upward</span>
                <span v-if="percentChange < 0" class="uip-icon">arrow_downward</span>
                <span>{{percentChange}}%</span>
              </div>
            </div>
            
            <div class="uip-text-muted uip-margin-bottom-xs">vs. {{returnComparisonTotal}} {{strings.lastPeriod}}</div>
            
          </div>  
          
          
          <uip-chart v-if="!hideChart && rendered" :chartData="returnChartData" class="uip-chart-canvas"/>
          
          <div class="uip-flex uip-flex-row uip-flex-between" v-if="!hideChart">
            <div class="uip-text-s uip-text-muted uip-chart-label">{{chartData.labels.main[0]}}</div>
            <div class="uip-text-s uip-text-muted uip-chart-label">{{chartData.labels.main[chartData.labels.main.length - 1]}}</div>
          </div>
          
        </div>
        
	</div>`,
};
