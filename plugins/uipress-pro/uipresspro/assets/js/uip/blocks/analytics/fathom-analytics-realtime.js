const { __, _x, _n, _nx } = wp.i18n;

const defineAsyncComponent = window.uipress.defineAsyncComponent;
const uipVersion = window.uipress.proVersion;

export default {
  components: {
    ConnectFathom: defineAsyncComponent(() => import(`./fathom-connect-account.min.js?ver=${uipVersion}`)),
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
      showFathomConnection: false,
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
          comparison: [],
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
        usersActive: __('Users active', 'uipress-lite'),
        page: __('Page', 'uipress-lite'),
        active: __('Active', 'uipress-lite'),
      },
    };
  },
  inject: ['uiTemplate'],
  watch: {
    'block.settings.block.options.chartDataType': {
      handler(newValue, oldvalue) {
        this.processResponse();
      },
      deep: true,
    },
    'uipApp.fathomAnalytics.ready': {
      handler(newValue, oldValue) {
        this.getAnalytics();
      },
      deep: true,
    },
    'uiTemplate.globalSettings.options.analytics.saveAccountToUser': {
      handler(newVal, oldVal) {
        this.refreshAnalytics();
      },
    },
    returnRange: {
      handler(newVal, oldVal) {
        this.getAnalytics();
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
     * Returns chart settings
     *
     * @since 3.2.0
     */
    returnChartSettings() {
      return this.get_block_option(this.block, 'block', 'chartOptions');
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
      return this.hasNestedPath(this.uipApp, 'fathomAnalytics', 'ready');
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
      this.showFathomConnection = false;
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
      return await this.uipApp.fathomAnalytics.api('get', startDate, endDate);
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
        this.showFathomConnection = true;
      }
    },

    /**
     * Process response from analytics request
     *
     * @since 3.2.0
     */
    processResponse() {
      let data = this.currentRequest;
      this.total = data.realtime.total;
      this.tableData = data.realtime.content;
      console.log(this.tableData);
    },

    /**
     * Removes fathom analytics account
     *
     * @since 3.2.0
     */
    async removeAnalyticsAccount() {
      this.uipApp.fathomAnalytics.ready = false;
      //Send request to API
      await this.uipApp.fathomAnalytics.api('removeAccount');

      await this.uipApp.fathomAnalytics.api('refresh');
      //The API call was successful
      this.uipApp.fathomAnalytics.ready = true;
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
      this.uipApp.fathomAnalytics.ready = false;
      //Send request to API
      const response = await this.uipApp.fathomAnalytics.api('refresh');
      //The API call was successful
      if (response) {
        this.uipApp.fathomAnalytics.ready = true;
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
  
        <div class="uip-flex uip-flex-between">
        
          <div class="uip-margin-bottom-xxs uip-text-normal uip-chart-title">{{returnName}}</div>
          
          <dropdown pos="bottom right" v-if="!inlineAccountSwitch && !showFathomConnection">
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
        
        <div class="uip-margin-bottom-xxs"><ConnectFathom v-if="showFathomConnection" :success="refreshAnalytics"/></div>
        
        <div v-if="loading" class="uip-padding-m uip-flex uip-flex-center uip-flex-middle uip-w-100p uip-ratio-16-10 uip-border-box"><loading-chart></loading-chart></div>
        
        <div v-else-if="error && errorMessage" class="uip-padding-xs uip-border-round uip-background-orange-wash uip-text-bold uip-margin-bottom-s uip-scale-in-top uip-max-w-100p" v-html="returnErrrorMessage()"></div>
        
        
        <div v-else class="uip-flex uip-flex-column uip-row-gap-xs uip-w-100p">
        
          <div class="uip-flex uip-flex-between uip-gap-xxs uip-flex-center">
            <div class="uip-text-xl uip-text-bold">{{returnTotal}}</div>
          </div>
          
          
          <table class="uip-w-100p uip-table">
            <thead>
              <tr class="">
                <th class="uip-text-muted uip-text-weight-normal uip-padding-bottom-xxs uip-text-left">{{strings.page}}</th>
                <th class="uip-text-right uip-text-muted uip-text-weight-normal uip-padding-bottom-xxs">{{strings.active}}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in tableData">
              
                <td class="uip-text-bold uip-padding-bottom-xxs">
                  <a :href="item.hostname + item.pathname" target="_BLANK" class="uip-link-default uip-no-underline">{{item.pathname}}</a>
                </td>
                <td class="uip-text-right uip-padding-bottom-xxs">{{item.total}}</td>
                
              </tr>
            </tbody>
          </table>
          
        </div>
        
  </div>`,
};
