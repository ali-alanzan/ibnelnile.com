const { __, _x, _n, _nx } = wp.i18n;
const defineAsyncComponent = window.uipress.defineAsyncComponent;
const uipVersion = window.uipress.proVersion;

export default {
  components: {
    GoogleAnalytics: defineAsyncComponent(() => import(`./google-analytics.min.js?ver=${uipVersion}`)),
    WooCommerce: defineAsyncComponent(() => import(`./woocommerce.min.js?ver=${uipVersion}`)),
    Matomo: defineAsyncComponent(() => import(`./matomo-analytics.min.js?ver=${uipVersion}`)),
    Fathom: defineAsyncComponent(() => import(`./fathom-analytics.min.js?ver=${uipVersion}`)),
  },
  data() {
    return {
      //Registered
      rg: true,
      //Show prompt
      sp: false,
      ul: window.uipressroute,
      userKey: '',
      validating: false,
      userData: {},
      fa: 0,
      strings: {
        thankYou: __('Thank you for installing UiPress 3 Pro', 'uipress-pro'),
        thankYouMessage: __('For pro features to work correctly, please add your pro licence below', 'uipress-pro'),
        register: __('Register', 'uipress-pro'),
      },
    };
  },
  inject: ['uiTemplate'],
  watch: {},
  mounted() {
    this.getData();
  },
  methods: {
    /**
     * Main function for fetching licence details
     *
     * @since 3.2.0
     */
    async getData() {
      // Don't fetch if not in builder
      if (this.uiTemplate.display == 'production' || this.uiTemplate.display == 'prod') {
        this.rg = true;
        return;
      }

      let formData = new FormData();
      formData.append('action', 'uip_get_pro_app_data');
      formData.append('security', uip_ajax.security);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      // No uipress pro keys
      if (!response.uip_pro) {
        this.rg = false;
        this.register();
        return;
      }

      // Plugin is registered
      this.userData = response.uip_pro;
      setTimeout(this.consume, 240000);
      this.uiTemplate.proActivated = true;
    },

    /**
     * Sets app registered state to true
     *
     * @since 3.2.13
     */
    register() {
      this.sp = true;
    },

    /**
     * Saves licence key details
     *
     * @param {string} key
     * @param {object} activationResponse - activation response
     * @since 3.2.00
     */
    async saveData(key, activationResponse) {
      const instance = 'instance_id' in activationResponse ? activationResponse.instance_id : false;

      let formData = new FormData();
      formData.append('action', 'uip_save_uip_pro_data');
      formData.append('security', uip_ajax.security);
      formData.append('key', key);
      formData.append('instance', instance);
      formData.append('multisite', this.uipApp.data.options.multisite);
      formData.append('networkActivated', this.uipApp.data.options.networkActivated);
      formData.append('primarySite', this.uipApp.data.options.primarySite);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error response
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }
    },

    /**
     * Removes uipress activation
     *
     * @since 3.2.13
     */
    removeData() {
      let formData = new FormData();
      formData.append('action', 'uip_remove_uip_pro_data');
      formData.append('security', uip_ajax.security);

      this.sendServerRequest(uip_ajax.ajax_url, formData);
    },

    /**
     * Validates given key
     *
     * @since 3.2.00
     */
    async consume() {
      const domain = this.uipApp.data.options.domain;
      let query = '';
      query += '?k=' + this.userData.key;
      query += '&d=' + domain;
      query += '&instance=' + this.userData.instance;
      let url = this.ul + 'validate/' + query;
      let formData = new FormData();
      //console.log(url);

      const response = await this.sendServerRequest(url, formData);
      if (response instanceof Error || response.state == 'false') {
        // it's an error, unable to contact licence server, do nothing and check again later
        this.handleRegisterErrror();
      } else if (response.state == 'true') {
        //Key is valid, say no more
        //console.log('Key is valid, do nothing more');
        this.saveUserPreference('uipfa', 2, false);
        this.sp = false;
        this.rg = true;
        this.uiTemplate.proActivated = true;
        return;
      } else {
        //Wait two minutes and try again
        //console.log("An error I don't know about");
        this.rg = true;
        setTimeout(this.consume, 300000);
        return;
      }
    },

    /**
     * Handles licence check errors
     *
     * @since 3.2.00
     */
    async handleRegisterErrror() {
      //Get activation attempts
      const response = await this.getUserPreference('uipfa');
      if (!response) {
        this.fa = 2;
      } else {
        this.fa = parseInt(response);
        this.fa = isNaN(this.fa) ? 2 : this.fa + 1;
      }
      if (this.fa < 12) {
        this.saveUserPreference('uipfa', this.fa, false);
        return;
      }
      //Too many failed attempts so remove the key
      if (this.fa >= 12) {
        this.sp = true;
        this.rg = false;
        this.saveUserPreference('uipfa', 2, false);
        this.removeData();
        this.uiTemplate.proActivated = false;
      }
    },
    /**
     * Handles licence key form submit
     *
     * @returns {Promise}
     * @since 3.2.00
     */
    async onSubmit() {
      this.validating = true;
      let domain = this.uipApp.data.options.domain;
      let query = '';
      query += '?k=' + this.userKey;
      query += '&d=' + domain;
      query += '&instance=';
      let url = this.ul + 'validate/' + query;
      let formData = new FormData();

      const response = await this.sendServerRequest(url, formData);
      if (response.error) {
        this.validating = false;
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      } else if (response instanceof Error) {
        // it's an error, unable to contact licence server
        this.validating = false;
        this.uipApp.notifications.notify(__('Check failed', 'uipress-pro'), __('Unable to contact licencing servers. Please try again later', 'uipress-pro'), 'error', true);
      } else if (response.state == 'false') {
        //It's a licence key error
        this.validating = false;
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      } else if (response.state == 'true') {
        this.sp = false;
        this.validating = false;
        this.rg = true;
        this.uipApp.notifications.notify(__('Thank you!', 'uipress-pro'), __('Your key is valid and you can now use pro features', 'uipress-pro'), 'success', true);
        this.saveData(this.userKey, response);
        this.saveUserPreference('uipfa', 2, false);
        this.uiTemplate.proActivated = true;
        return;
      } else {
        this.validating = false;
        this.uipApp.notifications.notify(__('Check failed', 'uipress-pro'), __('Something went wrong. Please try again later', 'uipress-pro'), 'error', true);
        return;
      }
    },
  },
  template: `
	<div id="notification-drop" class="uip-dark-mode">
  
		<div v-if="sp" class="uip-notification uip-padding-s uip-fade-in" style="width:auto;">
			<div class="uip-flex uip-gap-xs">
				<div class="uip-max-w-300">
					<div class="uip-text-bold uip-text-inverse uip-margin-bottom-xs">{{strings.thankYou}}</div>
					<div class="uip-text-s uip-text-normal uip-margin-bottom-s">{{strings.thankYouMessage}}</div>
					
					<form class="uip-flex uip-flex-row uip-gap-xs" @submit.prevent="onSubmit()">
						<input class="uip-input uip-flex-grow" type="text" v-model="userKey" placeholder="xxxx-xxxx-xxxx-xxxx" required>
						<label class="uip-button-primary uip-body-font uip-min-w-60 uip-flex uip-flex-middle uip-flex-row">
							<input v-show="!validating" type="submit" class="uip-blank-input uip-text-emphasis" :value="strings.register"/>
							<div><span v-show="validating" class="uip-load-spinner" ></span></div>
						</label>
					</form>
				</div>
				<div class="uip-position-absolute uip-right-0 uip-top-0 uip-padding-s">
					<div class="uip-icon uip-margin-left-xs uip-cursor-pointer uip-link-default" @click="sp = false">close</div>
				</div>
			</div>
		</div>
    
	</div>
  
  <!--Pro Plugins-->
  <template v-if="rg">
    <GoogleAnalytics/>
    <WooCommerce/>
    <Matomo/>
    <Fathom/>
  </template>`,
};
