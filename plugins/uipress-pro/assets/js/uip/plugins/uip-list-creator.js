const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Object,
    },
    data: function () {
      return {
        items: [{ name: 'toast' }, { name: 'toast' }],
        loaded: false,
        strings: {
          addNew: __('New item', 'uipress-lite'),
        },
      };
    },
    mounted: function () {
      if (Array.isArray(this.value.options)) {
        this.items = this.value.options;
      }
      requestAnimationFrame(() => {
        this.loaded = true;
      });
    },
    watch: {
      items: {
        handler(newValue, oldValue) {
          this.returnData({ options: this.items });
        },
        deep: true,
      },
    },
    computed: {
      returnItems() {
        return this.items;
      },
    },
    methods: {
      deleteTab(index) {
        this.items.splice(index, 1);
      },
      newTab() {
        this.items.push({ name: __('List item', 'uipress-pro'), icon: 'favorite' });
      },
      setdropAreaStyles() {
        let returnData = [];
        returnData.class = 'uip-flex uip-flex-column uip-row-gap-xs uip-w-100p';
        return returnData;
      },
    },
    template: `
    
    <div class="uip-flex uip-flex-column uip-row-gap-xs">
  
        <uip-draggable v-if="items.length && items.length > 0 && loaded"
        :list="items" 
        class="uip-flex uip-flex-column uip-row-gap-xs uip-w-100p"
        :group="{ name: 'list', pull: false, put: false, revertClone: true }"
        animation="300"
        @start="drag = true" 
        @end="drag = false" 
        :sort="true"
        handle=".uip-drag-handle"
        itemKey="name">
        
          <template v-for="(element, index) in items" :key="element.name" :index="index">
          
              <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
                
                <button class="uip-button-default uip-border-rounder uip-icon uip-padding-xxs uip-link-muted uip-cursor-drag uip-drag-handle">drag_indicator</button>
                
                <div class="uip-background-muted uip-border-rounder uip-padding-xxxs uip-flex uip-flex-grow uip-gap-xxs">
                  <inline-icon-select :value="{value: element.icon}" :returnData="function(e){element.icon = e.value}">
                    <template v-slot:trigger>
                      <div class=" uip-padding-xxxs uip-w-22 uip-text-center uip-text-muted uip-icon uip-text-l uip-flex-center">{{element.icon}}</div>
                    </template>
                  </inline-icon-select>
                  
                  <input type="text" v-model="element.name" class="uip-input-small uip-blank-input uip-border-left-remove uip-border-left-square uip-border-right-square">
                  
                </div>
                
                <button class="uip-button-default uip-border-rounder uip-icon uip-padding-xxs uip-link-muted" @click="deleteTab(index)">close</button>
                
              </div>
              
          </template>
          
        </uip-draggable>
          
        
        <button @click="newTab()" class="uip-button-default uip-icon uip-border-rounder uip-padding-xxs uip-link-muted uip-w-100p">add</button>
          
      </div>`,
  };
}
