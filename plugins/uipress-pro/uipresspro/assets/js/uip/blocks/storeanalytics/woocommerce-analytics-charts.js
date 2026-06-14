const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
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
        },
      };
    },
    watch: {
      'block.settings.block.options.chartDataType': {
        handler(newValue, oldvalue) {
          if (this.currentRequest) {
            this.processResponse();
          }
        },
      },
      'uipApp.woocommerce.ready': {
        handler(newValue, oldValue) {
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
    },
    mounted() {
      document.addEventListener('uipress/app/daterange/change', this.handleDateChange);
    },
    beforeUnmount() {
      document.removeEventListener('uipress/app/daterange/change', this.handleDateChange);
    },
    computed: {
      /**
       * Returns total
       *
       * @since 3.2.0
       */
      returnTotal() {
        if (this.returnChartType == 'total_revenue') {
          if (this.currentRequest.currency_pos == 'left') {
            return this.currentRequest.currency + this.total;
          }
          if (this.currentRequest.currency_pos == 'left_space') {
            return this.currentRequest.currency + ' ' + this.total;
          }
          if (this.currentRequest.currency_pos == 'right') {
            return this.total + this.currentRequest.currency;
          }
          if (this.currentRequest.currency_pos == 'right_space') {
            return this.total + ' ' + this.currentRequest.currency;
          }
        }
        return this.total;
      },

      /**
       * Returns chart settings
       *
       * @since 3.2.0
       */
      returnChartSettings() {
        return this.get_block_option(this.block, 'block', 'chartOptions');
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
       * Process response of commerce orders
       *
       * @since 3.2.0
       */
      async getAnalytics() {
        //Reset Vars
        this.loading = true;
        this.error = false;
        this.errorMessage = '';

        //Api is not ready yet. We will catch with attached watch
        if (!this.isObject(this.uipApp.woocommerce)) {
          this.apiLoaded = false;
          return;
        }
        if (!('ready' in this.uipApp.woocommerce)) {
          this.apiLoaded = false;
          return;
        }
        if (!this.uipApp.woocommerce.ready) {
          this.apiLoaded = false;
          return;
        }
        this.apiLoaded = true;

        //Check for global dates

        let startDate;
        let endDate;
        if (this.hasGlobalDate) {
          startDate = new Date(Date.parse(this.groupDate.start));
          endDate = new Date(Date.parse(this.groupDate.end));
        } else {
          //Build last two weeks date
          endDate = new Date();
          endDate.setDate(endDate.getDate() - 1);
          startDate = new Date();
          startDate.setDate(startDate.getDate() - this.returnRange);
        }

        //Send request to API
        const response = await this.uipApp.woocommerce.api('get', startDate, endDate);
        //The API returned an error so set relevant vars and return
        if (response.error) {
          this.loading = false;
          this.error = true;
          this.errorMessage = response.message;
          return;
        }
        //The call was a success, so let's process it
        this.loading = false;
        this.currentRequest = response.data;

        this.processResponse();
      },

      /**
       * Process api response
       *
       * @since 3.2.0
       */
      processResponse() {
        let data = this.currentRequest;
        let chartDates = data.timeline.report.dates;
        let comparisonDates = data.timeline.report_comparison.dates;
        let dataType = this.returnChartType;

        let chartData = [];
        let chartComparisonData = [];

        for (let [index, value] of data.timeline.report.data.entries()) {
          ///Fix engagement values
          chartData.push(value[dataType]);

          //Get comparison data
          if (typeof data.timeline.report_comparison.data[index] !== 'undefined') {
            if (dataType in data.timeline.report_comparison.data[index]) {
              chartComparisonData.push(data.timeline.report_comparison.data[index][dataType]);
            } else {
              chartComparisonData.push('0');
            }
          } else {
            chartComparisonData.push('0');
          }
        }

        if (this.returnChartSettings) {
          this.chartData.custom = this.returnChartSettings;
        }

        //Set data
        this.chartData.colors.main = this.returnLineColor;
        this.chartData.colors.comp = this.returnCompLineColor;
        this.chartData.title = this.returnName;
        this.chartData.type = this.returnChartStyle;
        this.chartData.data.main = chartData;
        this.chartData.data.comparison = chartComparisonData;
        this.chartData.labels.main = chartDates;
        this.chartData.labels.comparison = comparisonDates;
        this.total = data.timeline.report.totals[dataType];
        if (dataType in data.timeline.report_comparison.totals) {
          this.comparisonTotal = data.timeline.report_comparison.totals[dataType];
        } else {
          this.comparisonTotal = 'NA';
        }
        this.percentChange = data.timeline.report.totals_change[dataType];

        if (this.total != '') {
          this.total = new Intl.NumberFormat(this.uipApp.data.options.locale).format(this.total);
        }
        if (this.comparisonTotal != '' && this.comparisonTotal != 'NA') {
          this.comparisonTotal = new Intl.NumberFormat(this.uipApp.data.options.locale).format(this.comparisonTotal);
        }
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
	<div class="uip-flex uip-flex-column">
  
        <div class="uip-flex uip-flex-between">
          <div class="uip-margin-bottom-xxs uip-text-normal uip-chart-title">{{returnName}}</div>
        </div>
        <div v-if="loading" class="uip-padding-m uip-flex uip-flex-center uip-flex-middle uip-min-w-200 uip-w-100p uip-ratio-16-10 uip-border-box"><loading-chart></loading-chart></div>
        <div v-else-if="error && errorMessage" class="uip-padding-xs uip-border-round uip-background-orange-wash uip-text-bold uip-margin-bottom-s uip-scale-in-top uip-max-w-100p" v-html="returnErrrorMessage()"></div>
        <div v-else-if="!returnChartType" class="uip-padding-xxs uip-border-round uip-background-green-wash uip-text-green uip-text-bold uip-margin-bottom-s uip-scale-in-top uip-max-w-200">{{strings.selectDataMetric}}</div>
        <div v-else class="uip-min-w-200">
          <div class="uip-flex uip-flex-column uip-row-gap-xs">
            <div class="uip-flex uip-flex-between uip-gap-xxs uip-flex-center">
              <div class="uip-text-xl uip-text-bold">{{returnTotal}}</div>
              <div class="uip-text-s uip-background-orange-wash uip-border-round uip-padding-xxxs uip-padding-left-xs uip-padding-right-xs uip-post-type-label uip-flex uip-gap-xxs uip-flex-center uip-text-bold uip-tag-label">
                <span v-if="percentChange > 0" class="uip-icon">arrow_upward</span>
                <span v-if="percentChange < 0" class="uip-icon">arrow_downward</span>
                <span>{{percentChange}}%</span>
              </div>
            </div>
            <div class="uip-text-muted uip-margin-bottom-xs">vs. {{returnComparisonTotal}} {{strings.lastPeriod}}</div>
            <uip-chart v-if="!hideChart && rendered" :chartData="returnChartData" class="uip-chart-canvas"/>
            <div class="uip-flex uip-flex-row uip-flex-between" v-if="!hideChart">
              <div class="uip-text-s uip-text-muted uip-chart-label">{{chartData.labels.main[0]}}</div>
              <div class="uip-text-s uip-text-muted uip-chart-label">{{chartData.labels.main[chartData.labels.main.length - 1]}}</div>
            </div>
          </div>
        </div>
        
	</div>`,
  };
}
