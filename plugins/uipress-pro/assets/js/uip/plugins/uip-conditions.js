export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: [String, Array],
      placeHolder: String,
      args: Object,
      size: String,
    },
    inject: ['uipress'],
    data: function () {
      return {
        option: {
          relation: 'and',
          conditions: [],
        },
        strings: {
          newCondition: __('New condition', 'uipress-pro'),
          type: __('Type', 'uipress-pro'),
          operator: __('Operator', 'uipress-pro'),
          searchUsers: __('Search', 'uipress-pro'),
          value: __('Value', 'uipress-lite'),
          addCondition: __('Add condition', 'uipress-lite'),
        },
        newCondition: {
          type: 'userrole',
          operator: 'is',
          value: '',
        },
        conditions: {
          relations: {
            and: {
              value: 'and',
              label: __('And', 'uipress-pro'),
            },
            or: {
              value: 'or',
              label: __('Or', 'uipress-pro'),
            },
          },
          types: [
            {
              value: 'userrole',
              label: __('User role', 'uipress-pro'),
            },
            {
              value: 'userlogin',
              label: __('User login', 'uipress-pro'),
            },
            {
              value: 'userid',
              label: __('User ID', 'uipress-pro'),
            },
            {
              value: 'useremail',
              label: __('User email', 'uipress-pro'),
            },
          ],
          operators: {
            is: {
              value: 'is',
              label: __('Is', 'uipress-pro'),
            },
            isnot: {
              value: 'isnot',
              label: __('Is not', 'uipress-pro'),
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
        //Fill in for old settings
        if (Array.isArray(value)) {
          this.option.conditions = value;
        }
      },
      addCondition() {
        this.option.conditions.push(JSON.parse(JSON.stringify(this.newCondition)));
      },
      removeCondition(index) {
        this.option.conditions.splice(index, 1);
      },
    },
    template: `
	
	<div class="uip-flex uip-w-100p uip-flex-column uip-row-gap-xs">
	     
      <template v-for="(element, index) in option.conditions">
      
        <drop-down dropPos="left" class="uip-w-100p" triggerClass="uip-w-100p">
          <template v-slot:trigger>
            
            <div class="uip-flex uip-flex-row uip-gap-xxs">
              <div class="uip-padding-xxs uip-border-rounder uip-text-s uip-background-muted uip-flex-grow">
                {{element.type}} {{element.operator}} {{element.value}}
              </div>
              
              <button class="uip-button-default uip-border-rounder uip-icon uip-padding-xxs uip-link-muted"
              @click="removeCondition(index)">close</button>
            </div>  
            
          </template>
          <template v-slot:content>
            <div class="uip-padding-s">
            
              <div class="uip-grid-col-1-3">
              
                  <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.type}}</span></div>
                  <div class="uip-flex uip-flex-center">
                    <select class="uip-input-small uip-padding-top-xxxs uip-padding-bottom-xxxs uip-max-w-100p uip-w-100p uip-border-rounder" v-model="element.type" style="padding-top: 2px; padding-bottom: 2px; border-radius: var(--uip-border-radius-large);">
                      <template v-for="item in conditions.types">
                        <option :value="item.value">{{item.label}}</option>
                      </template>
                    </select>
                  </div>
                  
                  <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.operator}}</span></div>
                  <div class="uip-flex uip-flex-center">
                    <toggle-switch :options="conditions.operators" :activeValue="element.operator" :returnValue="function(data){ element.operator = data;}"></toggle-switch>
                  </div>
                  
                  <div class="uip-text-muted uip-flex uip-flex-center"><span>{{strings.value}}</span></div>
                  <div class="uip-flex uip-flex-center uip-gap-xxs">
                    <input type="text" class="uip-input-small uip-flex-grow" style="min-width:1px" v-model="element.value">
                    <user-role-search :selected="[]" :returnType="element.type" :searchPlaceHolder="strings.searchUsers" :updateSelected="function(d){element.value = d}"></user-role-search>
                  </div>
                  
              </div>    
              
            </div>
            
          </template>
        </drop-down>
      
      </template>
      
      <toggle-switch v-if="option.conditions.length > 0" :options="conditions.relations" :activeValue="option.relation" :dontAccentActive="true" :returnValue="function(data){ option.relation = data;}"></toggle-switch> 
      
      <div @click="option.conditions.push(newCondition)" class="uip-padding-xxs uip-border-rounder uip-background-muted hover:uip-background-grey uip-cursor-pointer uip-flex uip-flex-middle uip-flex-center uip-gap-xs uip-flex-grow">
        <span class="uip-icon">add</span>
      </div>
	  
	  
	</div>`,
  };
}
