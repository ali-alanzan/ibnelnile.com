export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Array,
      placeHolder: String,
      args: Object,
      size: String,
    },
    inject: ['uipress'],
    data: function () {
      return {
        option: {
          tension: 0.15,
          borderWidth: 3,
          showYaxis: false,
          showXaxis: false,
          showYaxisGrid: true,
          showXaxisGrid: false,
          dataBackground: '',
          compBackground: '',
        },
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
        conditions: {
          hideShow: {
            false: {
              value: false,
              label: __('Hide', 'uipress-pro'),
            },
            true: {
              value: true,
              label: __('Show', 'uipress-pro'),
            },
          },
        },
      };
    },
    mounted: function () {
      this.processValue(this.value);
    },
    watch: {
      option: {
        handler(newValue, oldValue) {
          this.returnData(this.option);
        },
        deep: true,
      },
    },
    methods: {
      processValue(value) {
        if (typeof value === 'undefined') {
          return;
        }
        if (this.uipress.isObject(value)) {
          this.option = { ...this.option, ...value };
        }
      },
    },
    template: `
	
	<drop-down dropPos="left" class="uip-w-100p" triggerClass="uip-w-100p">
  
      <template v-slot:trigger>
        
          <button class="uip-button-default uip-border-rounder uip-icon uip-padding-xxs uip-link-muted uip-w-100p"
          >palette</button>
        
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
              <div class="uip-flex uip-flex-center">
                <div class="uip-background-muted uip-border-rounder uip-padding-xxs uip-flex uip-gap-xxs uip-flex-center uip-flex-grow">
                  <color-picker :value="option.dataBackground" :returnData="function(data){option.dataBackground = data}" class="uip-max-w-100p">
                    <template v-slot:trigger>
                     <div class="uip-border uip-border-round uip-w-18 uip-ratio-1-1 uip-flex" :style="'background-color:' + option.dataBackground "></div>
                    </template>
                  </color-picker>
                  <div class="uip-text-xs uip-no-wrap uip-text-overflow-ellipsis uip-overflow-hidden" style="width:auto">{{option.dataBackground}}</div>
                </div>
              </div>
              
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.compBackground}}</span></div>
              <div class="uip-flex uip-flex-center">
                <div class="uip-background-muted uip-border-rounder uip-padding-xxs uip-flex uip-gap-xxs uip-flex-center uip-flex-grow">
                  <color-picker :value="option.compBackground" :returnData="function(data){option.compBackground = data}" class="uip-max-w-100p">
                    <template v-slot:trigger>
                     <div class="uip-border uip-border-round uip-w-18 uip-ratio-1-1 uip-flex" :style="'background-color:' + option.compBackground "></div>
                    </template>
                  </color-picker>
                  <div class="uip-text-xs uip-no-wrap uip-text-overflow-ellipsis uip-overflow-hidden" style="width:auto">{{option.compBackground}}</div>
                </div>
              </div>
                
              
              
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.showYaxis}}</span></div>
              <div class="uip-flex uip-flex-center">
                <switch-select :args="{asText: true, options: conditions.hideShow}" :value="option.showYaxis" :returnData="function(d){option.showYaxis = d}"/>
              </div>
              
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.showXaxis}}</span></div>
              <div class="uip-flex uip-flex-center">
                <switch-select :args="{asText: true, options: conditions.hideShow}" :value="option.showXaxis" :returnData="function(d){option.showXaxis = d}"/>
              </div>
              
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.showYaxisGrid}}</span></div>
              <div class="uip-flex uip-flex-center">
                <switch-select :args="{asText: true, options: conditions.hideShow}" :value="option.showYaxisGrid" :returnData="function(d){option.showYaxisGrid = d}"/>
              </div>
              
              <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.showXaxisGrid}}</span></div>
              <div class="uip-flex uip-flex-center">
                <switch-select :args="{asText: true, options: conditions.hideShow}" :value="option.showXaxisGrid" :returnData="function(d){option.showXaxisGrid = d}"/>
              </div>
              
          </div>    
          
        
      </template>
    </drop-down>
    `,
  };
}
