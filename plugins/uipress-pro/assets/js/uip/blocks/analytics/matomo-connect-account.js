const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    inject: ['uipData', 'uipress', 'uiTemplate'],
    props: {
      translations: Object,
      success: Function,
    },
    data: function () {
      return {
        hover: false,
        strings: {
          conntectAccount: __('Connect matomo account', 'uipress-pro'),
          matomoURL: __('Matomo URL', 'uipress-pro'),
          siteID: __('Site id', 'uipress-pro'),
          authToken: __('Auth token', 'uipress-pro'),
          connect: __('Connect', 'uipress-pro'),
        },
        data: {
          url: '',
          siteID: 1,
          authToken: '',
        },
      };
    },
    mounted: function () {},
    computed: {
      returnAccountOnUser() {
        if (typeof this.uiTemplate.globalSettings.options === 'undefined') {
          return false;
        }

        if ('analytics' in this.uiTemplate.globalSettings.options) {
          if ('saveAccountToUser' in this.uiTemplate.globalSettings.options.analytics) {
            return this.uiTemplate.globalSettings.options.analytics.saveAccountToUser;
          }
        }
        return false;
      },
    },
    methods: {
      uip_save_matomo() {
        let self = this;
        if (!this.data.url || !this.data.siteID || !this.data.authToken) {
          self.uipress.notify(__('All fields are required', 'uipress-pro'), __('Please fill in all fields to connect to matomo', 'uipress-pro'), 'error', true);
          return;
        }

        let formData = new FormData();
        formData.append('action', 'uip_save_matomo_analytics');
        formData.append('security', uip_ajax.security);
        formData.append('analytics', JSON.stringify(self.data));
        formData.append('saveAccountToUser', self.returnAccountOnUser);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(__('Unable to save account', 'uipress-pro'), response.message, 'error', true);
            return;
          } else {
            self.success();
          }
        });
      },
    },
    template: `
	<drop-down dropPos="bottom-left">
  
      <template v-slot:trigger>
        <button class="uip-button-default">{{strings.conntectAccount}}</button>
      </template>
      
      <template v-slot:content>
        <div class="uip-padding-s uip-flex uip-flex-column uip-gap-s uip-w-300">
          <div class="uip-grid-col-1-3">
          
            <div class="uip-text-muted uip-flex uip-flex-center">{{strings.matomoURL}}</div>
            <input class="uip-input uip-input-small" type="text" placeholder="https://uipress.co/analytics/" v-model="data.url">
            
            <div class="uip-text-muted uip-flex uip-flex-center">{{strings.siteID}}</div>
            <input class="uip-input uip-input-small" type="number" v-model="data.siteID">
            
            <div class="uip-text-muted uip-flex uip-flex-center">{{strings.authToken}}</div>
            <input class="uip-input uip-input-small" type="password" placeholder="*************" v-model="data.authToken">
            
          </div>
          
          <button class="uip-button-primary" @click="uip_save_matomo()">{{strings.connect}}</button>
        </div>
      </template>
      
    </drop-down>
  `,
  };
}
