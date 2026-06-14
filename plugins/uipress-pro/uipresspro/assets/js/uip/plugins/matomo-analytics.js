const { __, _x, _n, _nx } = wp.i18n;
export default {
  data() {
    return {
      ready: false,
      hasAccount: false,
      hasLicence: false,
      queryURL: false,
      reportRunning: false,
      token: false,
      saveAccountToUser: false,
      cache: {},
      queue: [],
      dev: false,
      matomoPath: '',
    };
  },
  inject: ['uiTemplate'],
  watch: {
    ready: {
      handler(newValue, oldValue) {
        this.uipApp.matomoAnalytics.ready = this.returnStatus;
      },
      deep: true,
    },
    'uiTemplate.globalSettings.options.analytics.saveAccountToUser': {
      handler(newVal, oldVal) {
        this.startSetup();
      },
    },
  },
  async mounted() {
    // Delay setup until the app has loaded
    await this.$nextTick();

    this.createQueue();
    this.pushToGlobal();
  },
  computed: {
    /**
     * Returns whether the app is ready to receive requests
     *
     * @since 3.2.13
     */
    returnStatus() {
      return this.ready;
    },

    /**
     * Returns whether the account is saved on a user or site level
     *
     * @since 3.2.13
     */
    returnAccountOnUser() {
      if (typeof this.uiTemplate.globalSettings.options === 'undefined') return false;
      return this.hasNestedPath(this.uiTemplate, 'globalSettings', 'options', 'analytics', 'saveAccountToUser');
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
      this.uipApp.matomoAnalytics = {
        api: this.uipMatomoAnalytics,
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
    async uipMatomoAnalytics(action, startDate, endDate) {
      // Not initiated yet so trigger setup
      if (!this.queryURL) {
        await this.getQueryURL();
      }

      ////Remove account
      ////get analytics report, creates a async queue so as not to overload api calls to google
      ////Remove account
      if (action == 'refresh') {
        return await new Promise((resolve, reject) => {
          this.getQueryURL(resolve);
        });
      }

      ////No account
      ////Return error if no account connected
      ////No account
      if (!this.hasAccount) {
        let error = {};
        error.error = true;
        error.message = __('No matomo account connected', 'uipress-pro');
        error.type = 'no_account';
        return error;
      }

      ////No licence
      ////Return error if no account connected
      ////No licence
      if (!this.hasLicence) {
        let error = {};
        error.error = true;
        error.message = __('No pro licence found. Please add a valid pro licence to use google analytics', 'uipress-pro');
        error.type = 'no_licence';
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

      ////Remove account
      ////get analytics report, creates a async queue so as not to overload api calls to google
      ////Remove account
      if (action == 'removeAccount') {
        return await new Promise((resolve, reject) => {
          this.removeAnalyticsAccount(resolve);
        });
      }
    },

    /**
     * Set's up required features for analytics API
     *
     * @since 3.0.0
     */
    startSetup() {
      this.getQueryURL();
    },

    /**
     * Gets analytics request URL or flags no account / no licence
     *
     * @since 3.0.0
     */
    async getQueryURL(resolve) {
      this.cache = {};

      this.saveAccountToUser = this.returnAccountOnUser;
      this.hasAccount = false;
      this.hasLicence = false;
      this.ready = false;
      this.queryURL = false;

      // Build request
      let formData = new FormData();
      formData.append('action', 'uip_build_matomo_analytics_query');
      formData.append('security', uip_ajax.security);
      formData.append('saveAccountToUser', this.saveAccountToUser);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);
      this.ready = true;

      // Handle error
      if (response.error) {
        //No matomo account connected
        if (response.error_type == 'no_matomo') {
          this.hasAccount = false;
          this.queryURL = 'no_matomo';
        }
        //No uipress pro licence account added
        if (response.error_type == 'no_licence') {
          this.hasLicence = false;
          this.queryURL = 'no_licence';
        }
        if (typeof resolve !== 'undefined') {
          resolve(false);
          this.queryURL = 'undefined';
        }
        return false;
      }
      //Set the query URL
      this.hasAccount = true;
      this.hasLicence = true;
      this.queryURL = response.url;
      this.matomoPath = response.matomoPath;
      if (typeof resolve !== 'undefined') {
        resolve(true);
      }

      return true;
    },

    /**
     * Fetches the matomo report for the given date range
     *
     * @since 3.0.0
     */
    async runReport(dates, resolve, lastresolve) {
      let self = this;

      let query = `&sd=${dates.startDate}&ed=${dates.endDate}&sdc=${dates.startDateCom}&edc=${dates.endDateCom}`;
      let URL = this.queryURL + query;

      // Return cached query
      if (this.cache[dates.startDate + dates.endDate]) {
        resolve(true);
        lastresolve(this.cache[dates.startDate + dates.endDate]);
        return;
      }

      this.reportRunning = true;
      let formData = new FormData();

      const response = await this.sendServerRequest(URL, formData);

      this.reportRunning = false;
      if (response.error) {
        const errorMessage = response.message;
        const errorTitle = __('Unable to fetch analytic data', 'uipress-pro');
        this.uipApp.notifications.notify(errorTitle, errorMessage, 'error', true, false);
        resolve(true);
        lastresolve(response);
      }
      if (response.access_token) {
        this.saveToken(response.access_token);
      }

      this.cache[dates.startDate + dates.endDate] = response;
      response.matomoPath = this.matomoPath;
      resolve(true);
      lastresolve(response);
    },

    /**
     * Saves UIP access token
     *
     * @since 3.0.0
     */
    async saveToken(token) {
      if (!token || token == this.token) return;

      let formData = new FormData();
      formData.append('action', 'uip_save_matomo_access_token');
      formData.append('security', uip_ajax.security);
      formData.append('token', token);
      formData.append('saveAccountToUser', this.saveAccountToUser);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true, false);
      } else {
        this.token = token;
      }
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

      startDate.setDate(startDate.getDate() - range);
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

    /**
     * Removes currently connected analytics account
     *
     * @since 3.0.0
     */
    async removeAnalyticsAccount(resolve) {
      let formData = new FormData();
      formData.append('action', 'uip_remove_matomo_analytics_account');
      formData.append('security', uip_ajax.security);
      formData.append('saveAccountToUser', this.saveAccountToUser);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true, false);
        resolve(false);
        return;
      }

      this.getQueryURL();
      resolve(true);
      return;
    },
  },
  template: ' ',
};
