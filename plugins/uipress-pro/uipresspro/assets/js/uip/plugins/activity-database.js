const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    returnData: Function,
    value: [Object, String],
  },
  data: function () {
    return {
      data: {
        enabled: false,
        host: '',
        username: '',
        name: '',
        password: '',
      },
      search: '',
      strings: {
        username: __('Username', 'uipress-pro'),
        name: __('Name', 'uipress-pro'),
        password: __('Password', 'uipress-pro'),
        testConnection: __('Test connection', 'uipress-pro'),
        host: __('Host', 'uipress-pro'),
        enabled: __('Enabled', 'uipress-pro'),
      },
    };
  },
  watch: {
    data: {
      handler(newValue, oldValue) {
        this.returnData(this.data);
      },
      deep: true,
    },
  },

  mounted() {
    this.formatVal(this.value);
  },
  computed: {
    /**
     * Returns dynamic data
     *
     * @since 3.2.0
     */
    returnDynamicData() {
      const ordered = Object.keys(this.dynamics)
        .sort()
        .reduce((obj, key) => {
          obj[key] = this.dynamics[key];
          return obj;
        }, {});
      return ordered;
    },
  },
  methods: {
    /**
     * Formats new value
     *
     * @param {mixed} val - new value
     */
    formatVal(val) {
      if (this.isObject(val)) {
        this.data = { ...this.data, ...val };
      }
    },

    /**
     * Test database connection
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async testDatabaseConnection() {
      let data = JSON.stringify(this.data);

      let formData = new FormData();
      formData.append('action', 'uip_test_remote_database');
      formData.append('security', uip_ajax.security);
      formData.append('dataBase', data);

      const notificationID = this.uipApp.notifications.notify(__('Testing connection', 'uipress-lite'), '', 'default', false, true);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);
      this.loading = false;

      this.uipApp.notifications.remove(notificationID);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, response.details, 'error', true, false);
        this.loading = false;
        return;
      }
      this.uipApp.notifications.notify(response.message, '', 'success', true, false);
    },
  },
  template: `
      
      <div class="uip-flex uip-flex-column uip-row-gap-xs">
      
        <div class="">
          <switch-select :value="data.enabled" :returnData="function(d){data.enabled = d}" :args="{
            asText: true,
            options: {
              false: {
                value: false,
                label: __('Disabled', 'uipress-lite'),
              },
              true: {
                value: true,
                label: __('Enabled', 'uipress-lite'),
              },
            },
          }"></switch-select>
        </div>
      
        <div class="" v-if="data.enabled">
          <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.host}}</div>
          <input placeholder="path.com/to/host:port" type="text" class="uip-input uip-w-100p" v-model="data.host">
        </div>
        
        <div class="uip-flex uip-flex-column uip-row-gap-xs" v-if="data.enabled">
        
          <div class="uip-flex uip-flex-column">
            <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.username}}</div>
            <input :placeholder="strings.username" type="text" class="uip-input" v-model="data.username">
          </div>
          
          <div class="uip-flex uip-flex-column">
            <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.name}}</div>
            <input :placeholder="strings.name" type="text" class="uip-input" v-model="data.name">
          </div>
          
          <div class="uip-flex uip-flex-column">
            <div class="uip-text-s uip-text-muted uip-margin-bottom-xxs">{{strings.password}}</div>
            <input :placeholder="strings.password" type="password" class="uip-input" v-model="data.password">
          </div>
        
        </div>
        
        <div class="uip-margin-top-s" v-if="data.enabled">
          <button @click="testDatabaseConnection()" class="uip-button-secondary uip-w-100p">{{strings.testConnection}}</button>
        </div>
        
      </div>
      
    
    `,
};
