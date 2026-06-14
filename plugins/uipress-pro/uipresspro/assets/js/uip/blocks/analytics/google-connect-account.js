const { __, _x, _n, _nx } = wp.i18n;
export default {
  inject: ['uiTemplate'],

  props: {
    success: Function,
  },

  data() {
    return {
      googliconNoHover: uipProPath + 'assets/img/ga_btn_light.png',
      googliconHover: uipProPath + 'assets/img/ga_btn_dark.png',
      hover: false,
      analyticsWindow: null,
    };
  },
  computed: {
    /**
     * Returns image for hover state
     *
     * @since 3.2.0
     */
    returnHoverImg() {
      return this.googliconHover;
    },

    /**
     * Returns image for non-hover state
     *
     * @since 3.2.0
     */
    returnNoHoverImg() {
      return this.googliconNoHover;
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

    /**
     * Returns image style based on hover state
     *
     * @since 3.2.0
     */
    returnStyle() {
      return this.hover ? 'opacity:1' : 'opacity:0';
    },
  },
  methods: {
    /**
     * Opens a new window for Google OAuth and listens for a message event containing analytics data.
     *
     * @since 3.2.0
     */
    gauthWindow() {
      const url = this.buildOAuthUrl();
      const { x, y } = this.calculateWindowPosition(450, 600);

      const newWindow = window.open(url, 'name', `height=600,width=450,top=${y},left=${x}`);

      if (window.focus) newWindow.focus();

      // Event listener for message event
      const messageEventListener = (e) => {
        if (e.origin !== 'https://analytics.uipress.co' || !e.data) return;

        try {
          const analyticsdata = JSON.parse(e.data);

          if (analyticsdata.code && analyticsdata.view) {
            newWindow.close();
            this.uip_save_analytics(analyticsdata);
            window.removeEventListener('message', messageEventListener);
          }
        } catch (err) {
          console.error('Error processing the message event:', err);
        }
      };

      // Add event listener
      window.addEventListener('message', messageEventListener);
    },

    /**
     * Builds the OAuth URL.
     *
     * @returns {string} - The OAuth URL.
     * @since 3.2.0
     */
    buildOAuthUrl() {
      // Consider storing sensitive data securely and not exposing it in client-side code
      const clientId = '285756954789-dp7lc40aqvjpa4jcqnfihcke3o43hmt1.apps.googleusercontent.com';
      const redirectUri = 'https://analytics.uipress.co';
      const scope = 'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fanalytics.readonly';

      return `https://accounts.google.com/o/oauth2/auth/oauthchooseaccount?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&approval_prompt=force&flowName=GeneralOAuthFlow`;
    },

    /**
     * Calculates the position for the new window.
     *
     * @param {number} width - The width of the new window.
     * @param {number} height - The height of the new window.
     * @returns {Object} - The x and y coordinates for the new window.
     * @since 3.2.0
     */
    calculateWindowPosition(width, height) {
      return {
        x: window.outerWidth / 2 + window.screenX - width / 2,
        y: window.outerHeight / 2 + window.screenY - height / 2,
      };
    },

    /**
     * Handles response from account selector
     *
     * @param {object} e - message event
     * @since 3.2.0
     */
    handleWindowMessage(e) {
      if (e.origin != 'https://analytics.uipress.co' || !e.data) return;
      try {
        const analyticsdata = JSON.parse(e.data);

        if (analyticsdata.code && analyticsdata.view) {
          this.analyticsWindow.close();
          this.uip_save_analytics(analyticsdata);
        }
      } catch (err) {
        ///ERROR
        console.log(err);
      }
    },

    /**
     * Saves google account choice
     *
     * @param {Object} accountData - the analytics data
     */
    async uip_save_analytics(accountData) {
      // Exit if missing required info
      if (!('view' in accountData) || !('code' in accountData)) {
        this.uipApp.notifications.notify(__('Connection failed', 'uipress-pro'), __('Incorrect credentials returned from account. Please try again', 'uipress-pro'), 'error', true);
        return;
      }

      let formData = new FormData();
      formData.append('action', 'uip_save_google_analytics');
      formData.append('security', uip_ajax.security);
      formData.append('analytics', JSON.stringify(accountData));
      formData.append('saveAccountToUser', this.returnAccountOnUser);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(__('Unable to save account', 'uipress-pro'), response.message, 'error', true);
        return;
      }
      this.success();
    },
  },
  template: `
		<a @mouseenter="hover = true" @mouseleave="hover = false" class="uip-position-relative uip-cursor-pointer" @click="gauthWindow()" style="width:120px;height:26px">
			<img width="120"  :src="returnNoHoverImg">
			<img width="120" class="uip-position-absolute uip-left-0" :style="returnStyle" :src="returnHoverImg">
		</a>`,
};
