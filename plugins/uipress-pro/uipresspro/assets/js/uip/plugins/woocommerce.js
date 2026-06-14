const { __, _x, _n, _nx } = wp.i18n;
export default {
  data() {
    return {
      ready: false,
      hasLicence: false,
      noWC: false,
      queryURL: false,
      reportRunning: false,
      token: false,
      saveAccountToUser: false,
      cache: {},
      queue: [],
      dev: false,
    };
  },
  watch: {
    ready: {
      handler(newValue, oldValue) {
        this.uipApp.woocommerce.ready = this.returnStatus;
      },
      deep: true,
    },
  },
  async mounted() {
    // Wait for app to load before building data
    await this.$nextTick();

    this.createQueue();
    this.pushToGlobal();
  },
  computed: {
    /**
     * Returns whether the app is ready to receive requests
     *
     * @since 3.2.00
     */
    returnStatus() {
      return this.ready;
    },
  },
  methods: {
    /**
     * Creates a queue so requests are not all sent at once
     *
     * @since 3.0.0
     */
    createQueue() {
      const Queue = (onResolve, onReject) => {
        const items = [];

        const dequeue = () => {
          // no work to do
          if (!items[0]) return;

          items[0]()
            .then(function (response) {
              return response;
            })
            .catch(onReject)
            .then(() => items.shift())
            .then(dequeue)
            .then();
        };

        const enqueue = async (func) => {
          items.push(func);

          if (items.length === 1) {
            return new Promise((resolve, reject) => {
              dequeue();
            });
          }
        };

        return enqueue;
      };

      this.queue = Queue();
    },

    /**
     * Pushes the API to the global template
     *
     * @since 3.0.0
     */
    async pushToGlobal() {
      this.uipApp.woocommerce = {
        api: this.uipWCAnalytics,
        ready: this.returnStatus,
      };

      await this.$nextTick();
      this.ready = true;
    },

    /**
     * The provided object and main base for analytics requests
     *
     * @since 3.0.0
     */
    async uipWCAnalytics(action, startDate, endDate) {
      // Not initiated yet so trigger setup
      if (!this.queryURL) {
        await this.getQueryURL();
      }

      ////No licence
      ////Return error if no account connected
      ////No licence
      if (!this.hasLicence) {
        let error = {};
        error.error = true;
        error.message = __('No pro licence found. Please add a valid pro licence to use woocommerce analytics', 'uipress-pro');
        error.type = 'no_licence';
        return error;
      }

      if (!this.noWC) {
        let error = {};
        error.error = true;
        error.message = __('Woocommerce needs to be active on this site to use woocommerce analytics blocks', 'uipress-pro');
        error.type = 'no_woocommerce';
        return error;
      }

      ////Get Report
      ////get analytics report, creates a async queue so as not to overload api calls to google
      ////Get Report
      if (action == 'get') {
        const dates = this.getDates(startDate, endDate);

        const returnAnalyticsReport = (dates, finisher) =>
          new Promise((resolve, reject) => {
            return this.runReport(dates, resolve, finisher);
          });

        return await new Promise((resolve, reject) => {
          this.queue(() => returnAnalyticsReport(dates, resolve));
        });
      }
    },

    /**
     * Gets analytics request URL or flags no account / no licence
     *
     * @since 3.0.0
     */
    async getQueryURL(resolve) {
      this.cache = {};

      this.hasLicence = false;
      this.noWC = false;
      this.ready = false;
      this.queryURL = false;
      //Build request
      let formData = new FormData();
      formData.append('action', 'uip_build_woocommerce_analytics_query');
      formData.append('security', uip_ajax.security);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);
      this.ready = true;
      // Handle error
      if (response.error) {
        //No uipress pro licence account added
        if (response.error_type == 'no_licence') {
          this.noWC = true;
          this.hasLicence = false;
          this.queryURL = 'no_licence';
        }
        if (response.error_type == 'no_woocommerce') {
          this.hasLicence = true;
          this.noWC = false;
          this.queryURL = 'no_woocommerce';
        }

        if (typeof resolve !== 'undefined') {
          resolve(false);
          this.queryURL = 'undefined';
        }
        return false;
      }

      //Set the query URL
      this.hasLicence = true;
      this.noWC = true;
      this.queryURL = response.url;

      if (typeof resolve !== 'undefined') {
        resolve(true);
      }

      return true;
    },

    /**
     * Fetches the google report for the given date range
     *
     * @since 3.0.0
     */
    async runReport(dates, resolve, lastresolve) {
      let query = `&sd=${dates.startDate}&ed=${dates.endDate}&sdc=${dates.startDateCom}&edc=${dates.endDateCom}`;
      let URL = this.queryURL + query;

      // Return cached results if exists
      if (this.cache[dates.startDate + dates.endDate]) {
        resolve(true);
        lastresolve(this.cache[dates.startDate + dates.endDate]);
        return;
      }

      //Report is running so let's queue it
      this.reportRunning = true;
      let formData = new FormData();

      formData.append('action', 'uip_run_woocommerce_analytics_query');
      formData.append('security', uip_ajax.security);
      formData.append('dates', JSON.stringify(dates));

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);
      this.reportRunning = false;

      // Handle error
      if (response.error) {
        let errorMessage = response.message;
        let errorTitle = __('Unable to fetch analytic data', 'uipress-pro');
        this.uipApp.notifications.notify(errorTitle, errorMessage, 'error', true, false);
        resolve(true);
        lastresolve(response);
      }

      this.cache[dates.startDate + dates.endDate] = response;
      resolve(true);
      lastresolve(response);
    },

    /**
     * Builds required dates for request including a comparison range
     *
     * @since 3.0.0
     */
    getDates(startDate, endDate) {
      let range = this.daysDifference(startDate, endDate);
      let dateObj = {};
      dateObj.startDate = this.returnFormattedDate(startDate);
      dateObj.endDate = this.returnFormattedDate(endDate);

      startDate.setDate(startDate.getDate() - 1);
      dateObj.endDateCom = this.returnFormattedDate(startDate);

      startDate.setDate(startDate.getDate() - range + 1);
      dateObj.startDateCom = this.returnFormattedDate(startDate);

      return dateObj;
    },

    /**
     * Formats dates for query
     *
     * @since 3.0.0
     */
    returnFormattedDate(d) {
      let month = d.getMonth() + 1;
      let day = d.getDate();
      let year = d.getFullYear();

      if (month < 10) {
        month = '0' + month;
      }
      if (day < 10) {
        day = '0' + day;
      }

      return year + '-' + month + '-' + day;
    },

    /**
     * Gets days between two dates
     *
     * @since 3.0.0
     */
    daysDifference(first, second) {
      let timeDif = second.getTime() - first.getTime();
      let oneDay = 1000 * 60 * 60 * 24;
      return Math.round(timeDif / oneDay) + 1;
    },
  },
  template: ' ',
};
