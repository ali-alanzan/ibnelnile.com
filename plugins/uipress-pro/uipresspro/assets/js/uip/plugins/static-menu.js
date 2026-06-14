const { __, _x, _n, _nx } = wp.i18n;

export default {
  props: {
    value: [Object, String],
    returnData: Function,
  },

  data() {
    return {
      updating: false,
      option: this.defaultValue,
      menus: [],
      strings: {
        selectMenu: __('Select menu', 'uipress-lite'),
      },
      enabledDisabled: {
        false: {
          value: false,
          label: __('Disabled', 'uipress-lite'),
        },
        true: {
          value: true,
          label: __('Enabled', 'uipress-lite'),
        },
      },
    };
  },
  watch: {
    /**
     * Watches changes to value and updates option
     *
     * @since 3.2.0
     */
    value: {
      handler() {
        if (this.updating) return;
        this.injectProp();
      },
      deep: true,
      immediate: true,
    },
    /**
     * Watches changes to option and returns to caller
     *
     * @since 3.2.0
     */
    option: {
      handler() {
        if (this.updating) return;
        this.returnData(this.option);
      },
      deep: true,
    },
    'option.enabled': {
      handler() {
        if (!this.option.enabled) return;
        this.fetchMenus();
      },
      immediate: true,
    },
  },
  computed: {
    /**
     * Returns default value
     *
     * @since 3.2.0
     */
    defaultValue() {
      return {
        enabled: false,
        menuid: '',
      };
    },
  },
  methods: {
    /**
     * Injects prop value into component
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async injectProp() {
      this.updating = true;
      this.option = this.isObject(this.value) ? { ...this.value } : { ...this.defaultValue };
      await this.$nextTick();
      this.updating = false;
    },

    /**
     * Fetches custom admin menus
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async fetchMenus() {
      // Menus have already been fetched so exit
      if (this.menus.length) return;

      let formData = new FormData();
      formData.append('action', 'uip_get_custom_menu_list');
      formData.append('security', uip_ajax.security);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true, false);
        return;
      }

      this.menus = response.menus;
    },
  },
  template: `
  
  <div class="uip-flex uip-flex-column uip-row-gap-xs uip-w-100p">
  	
	  <toggle-switch :options="enabledDisabled" :activeValue="option.enabled" :returnValue="(data)=>option.enabled = data"/>
	  
	  
	  <select v-if="option.enabled" class="uip-input" v-model="option.menuid">
	  
	  	<option disabled selected value="">{{strings.selectMenu}}</option>
		  
	  	<template v-for="menu in menus">
		  
		  <option :value="menu.id">{{menu.label}}</option>
		  
		</template>
		
	  </select>
  
  
  </div>
  
  
  
  `,
};
