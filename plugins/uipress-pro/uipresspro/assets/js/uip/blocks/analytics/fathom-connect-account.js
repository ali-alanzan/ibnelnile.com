const { __, _x, _n, _nx } = wp.i18n;
export default {
  inject: ['uiTemplate'],
  props: {
    success: Function,
  },
  data() {
    return {
      hover: false,
      strings: {
        conntectAccount: __('Connect fathom account', 'uipress-pro'),
        siteID: __('Site id', 'uipress-pro'),
        authToken: __('Auth token', 'uipress-pro'),
        connect: __('Connect', 'uipress-pro'),
      },
      data: {
        siteID: '',
        authToken: '',
      },
    };
  },
  computed: {
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
     * Saves fathom data
     *
     * @since 3.2.0
     */
    async uip_save_fathom() {
      // Missing required data
      if (!this.data.siteID || !this.data.authToken) {
        this.uipApp.notifications.notify(__('All fields are required', 'uipress-pro'), __('Please fill in all fields to connect to fathom', 'uipress-pro'), 'error', true);
        return;
      }

      let formData = new FormData();
      formData.append('action', 'uip_save_fathom_analytics');
      formData.append('security', uip_ajax.security);
      formData.append('analytics', JSON.stringify(this.data));
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
	<dropdown pos="bottom left">
  
      <template v-slot:trigger>
        <button class="uip-button-default">{{strings.conntectAccount}}</button>
      </template>
      
      <template v-slot:content>
        <div class="uip-padding-s uip-flex uip-flex-column uip-gap-s uip-w-300">
          <div class="uip-grid-col-1-3">
          
            
            <div class="uip-text-muted uip-flex uip-flex-center">{{strings.siteID}}</div>
            <input class="uip-input uip-input-small" type="text" v-model="data.siteID">
            
            <div class="uip-text-muted uip-flex uip-flex-center">{{strings.authToken}}</div>
            <input class="uip-input uip-input-small" type="password" placeholder="*************" v-model="data.authToken">
            
          </div>
          
          <button class="uip-button-primary" @click="uip_save_fathom()">{{strings.connect}}</button>
        </div>
      </template>
      
    </dropdown>
  `,
};
