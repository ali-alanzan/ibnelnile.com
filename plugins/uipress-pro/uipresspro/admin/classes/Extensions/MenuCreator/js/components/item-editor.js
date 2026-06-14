const { __, _x, _n, _nx } = wp.i18n;

export default {
  props: {
    menuItem: { type: Object, default: {} },
    returnData: Function,
  },
  data() {
    return {
      custom: this.returnDefault,
      updating: false,
      strings: {
        name: __('Name', 'uipress-pro'),
        icon: __('Icon', 'uipress-pro'),
        hidden: __('Hidden', 'uipress-pro'),
        link: __('Link', 'uipress-pro'),
        classes: __('Classes', 'uipress-pro'),
        capability: __('Capability', 'uipress-pro'),
        newTab: __('New tab', 'uipress-pro'),
      },
      hiddenOptions: {
        false: {
          value: false,
          label: __('Visible', 'uipress-lite'),
        },
        true: {
          value: true,
          label: __('Hidden', 'uipress-lite'),
        },
      },
      newTabOptions: {
        false: {
          value: false,
          label: __('No', 'uipress-lite'),
        },
        true: {
          value: true,
          label: __('Yes', 'uipress-lite'),
        },
      },
    };
  },
  watch: {
    menuItem: {
      handler() {
        if (this.updating) return;
        this.injectProp();
      },
      deep: true,
      immediate: true,
    },
    custom: {
      handler() {
        if (this.updating) return;
        this.returnData(this.custom);
      },
      deep: true,
    },
  },
  computed: {
    /**
     * Returns default custom object
     *
     * @since 3.2.0
     */
    returnDefault() {
      return { name: '', icon: '', hidden: false, url: '', classes: '', capabilities: '', newTab: false };
    },
  },

  methods: {
    /**
     * Injects prop value into the app
     *
     * @since 3.2.0
     */
    async injectProp() {
      this.updating = true;
      this.custom = this.isObject(this.menuItem.custom) ? { ...this.returnDefault, ...this.menuItem.custom } : this.returnDefault;
      await this.$nextTick();
      this.updating = false;
    },
  },
  template: `
	<div class="uip-grid-col-1-3 uip-padding-left-s uip-padding-top-s" style="grid-gap: var(--uip-margin-s)">
	
	  <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.name}}</span></div>
	  <input class="uip-input uip-input-small" type="text" v-model="custom.name" :placeholder="menuItem.cleanName">
	  
	  <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.icon}}</span></div>
	  <IconPicker :value="{value:custom.icon}" :returnData="(d)=>{custom.icon = d.value}"/>
	  
	  <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.hidden}}</span></div>
	  <switch-select :options="hiddenOptions" 
	  :activeValue="custom.hidden" 
	  :returnValue="(d)=>(custom.hidden=d)"/>
	  
	  <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.link}}</span></div>
	  <input class="uip-input uip-input-small" type="text" v-model="custom.url" :placeholder="menuItem[2]">
    
      <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.newTab}}</span></div>
      <switch-select :options="newTabOptions" 
      :activeValue="custom.newTab" 
      :returnValue="(d)=>(custom.newTab=d)"/>
	  
	  <div class="uip-text-muted uip-flex uip-flex-center uip-text-s uip-padding-top-xxs uip-flex-start"><span>{{strings.classes}}</span></div>
	  <Classes :value="custom.classes" :returnData="(d)=>{custom.classes=d}"/>
	  
	  <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.capability}}</span></div>
	  <input class="uip-input uip-input-small" type="text" v-model="custom.capabilities" :placeholder="menuItem[1]">
		
	</div>
  `,
};
