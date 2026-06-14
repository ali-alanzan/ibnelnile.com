export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Array,
      placeHolder: String,
      args: Object,
      size: String,
    },
    data() {
      return {
        updating: false,
        option: this.returnDefaultOptions,
        strings: {
          styles: __('Styles', 'uipress-pro'),
          lineRoundness: __('Line tension', 'uipress-pro'),
          showYaxis: __('Y axis', 'uipress-pro'),
          showXaxis: __('X axis', 'uipress-pro'),
          showYaxisGrid: __('Y axis grid', 'uipress-pro'),
          showXaxisGrid: __('X axis grid', 'uipress-pro'),
          borderWidth: __('Line width', 'uipress-pro'),
          dataBackground: __('Data fill', 'uipress-lite'),
          compBackground: __('Comparison data fill', 'uipress-lite'),
        },
      };
    },
    watch: {
      /**
       * Watches changes to value prop and injects
       *
       * @since 3.2.13
       */
      value: {
        handler(newValue, oldValue) {
          if (this.updating) return;
          this.injectProp();
        },
        deep: true,
        immediate: true,
      },

      /**
       * Returns data back to caller
       *
       * @since 3.2.00
       */
      option: {
        handler(newValue, oldValue) {
          if (this.updating) return;
          this.returnData(this.option);
        },
        deep: true,
      },
    },
    computed: {
      /**
       * Returns default setting options
       *
       * @since 3.2.13
       */
      returnDefaultOptions() {
        return { tension: 0.15, borderWidth: 3, showYaxis: false, showXaxis: false, showYaxisGrid: true, showXaxisGrid: false, dataBackground: '', compBackground: '' };
      },

      /**
       * Returns default setting options
       *
       * @since 3.2.13
       */
      returnSelectOptions() {
        return {
          false: {
            value: false,
            label: __('Hide', 'uipress-pro'),
          },
          true: {
            value: true,
            label: __('Show', 'uipress-pro'),
          },
        };
      },
    },
    methods: {
      /**
       * Injects value into component
       *
       * @since 3.2.13
       */
      async injectProp() {
        this.updating = true;
        const defaultOptions = this.returnDefaultOptions;
        const newOptions = this.isObject(this.value) ? this.value : {};
        this.option = { ...defaultOptions, ...newOptions };

        await this.$nextTick();
        this.updating = false;
      },
    },
    template: `
	
	<dropdown pos="left center" class="uip-w-100p" :snapX="['#uip-block-settings']">
  
      <template v-slot:trigger>
        
          <button class="uip-button-default uip-border-rounder uip-icon uip-padding-xxs uip-link-muted uip-w-100p">palette</button>
        
      </template>
      
      <template v-slot:content>
        
          <div class="uip-grid-col-1-3 uip-padding-s uip-w-300">
          
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.lineRoundness}}</span></div>
              <div class="uip-flex uip-flex-center">
                <uip-number :value="option.tension" :returnData="function(d){option.tension = d}" :customStep="0.01"/>
              </div>
              
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.borderWidth}}</span></div>
              <div class="uip-flex uip-flex-center">
                <uip-number :value="option.borderWidth" :returnData="function(d){option.borderWidth = d}" :customStep="1"/>
              </div>
              
              
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.dataBackground}}</span></div>
              <color-select :value="option.dataBackground" :returnData="(data)=>{option.dataBackground = data}"/>
              
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.compBackground}}</span></div>
              <color-select :value="option.compBackground" :returnData="(data)=>{option.compBackground = data}"/>
                
              
              
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.showYaxis}}</span></div>
              <div class="uip-flex uip-flex-center">
                <switch-select :args="{asText: true, options: returnSelectOptions}" :value="option.showYaxis" :returnData="function(d){option.showYaxis = d}"/>
              </div>
              
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.showXaxis}}</span></div>
              <div class="uip-flex uip-flex-center">
                <switch-select :args="{asText: true, options: returnSelectOptions}" :value="option.showXaxis" :returnData="function(d){option.showXaxis = d}"/>
              </div>
              
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.showYaxisGrid}}</span></div>
              <div class="uip-flex uip-flex-center">
                <switch-select :args="{asText: true, options: returnSelectOptions}" :value="option.showYaxisGrid" :returnData="function(d){option.showYaxisGrid = d}"/>
              </div>
              
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.showXaxisGrid}}</span></div>
              <div class="uip-flex uip-flex-center">
                <switch-select :args="{asText: true, options: returnSelectOptions}" :value="option.showXaxisGrid" :returnData="function(d){option.showXaxisGrid = d}"/>
              </div>
              
          </div>    
          
        
      </template>
    </dropdown>
    `,
  };
}
