const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    returnData: Function,
    value: Object,
  },
  data() {
    return {
      items: this.returnDefault,
      loaded: false,
      canUpdate: true,
      strings: {
        addNew: __('New item', 'uipress-lite'),
      },
    };
  },
  watch: {
    /**
     * watches changes to value
     *
     * @since 3.2.0
     */
    value: {
      handler(newValue, oldValue) {
        if (!this.canUpdate) return;
        this.injectValue();
      },
      deep: true,
      immediate: true,
    },

    /**
     * Watches items and returns to caller
     *
     * @since 3.2.0
     */
    items: {
      handler(newValue, oldValue) {
        if (!this.canUpdate) return;
        this.returnData({ options: this.items });
      },
      deep: true,
    },
  },
  computed: {
    /**
     * Returns default options
     *
     * @since 3.2.0
     */
    returnDefault() {
      return [{ name: 'toast' }, { name: 'toast' }];
    },
  },
  methods: {
    /**
     * Injects prop value to option
     *
     * @since 3.2.0
     */
    async injectValue() {
      this.canUpdate = false;
      this.items = Array.isArray(this.value.options) ? this.value.options : this.returnDefault;

      await this.$nextTick();
      this.canUpdate = true;
    },

    /**
     * Deletes a tab
     *
     * @param {number} index - the delete item index
     * @since 3.2.0
     */
    deleteOption(index) {
      this.items.splice(index, 1);
    },

    /**
     * Adds a new option
     *
     * @since 3.2.0
     */
    newOption() {
      this.items.push({ name: __('List item', 'uipress-pro'), icon: 'favorite' });
    },
  },
  template: `
    
    <div class="uip-flex uip-flex-column uip-row-gap-xs uip-w-100p">
  
        <uip-draggable v-if="items.length"
        :list="items" 
        class="uip-flex uip-flex-column uip-row-gap-xs uip-w-100p"
        :group="{ name: 'list', pull: false, put: false, revertClone: true }"
        animation="300"
        @start="drag = true" 
        @end="drag = false" 
        :sort="true"
        itemKey="name">
        
          <template v-for="(element, index) in items" :key="element.name" :index="index">
          
              <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
                
                
                <div class="uip-background-muted uip-border-rounder uip-padding-xxxs uip-padding-right-xxs uip-flex uip-flex-grow uip-gap-xxs uip-flex-center">
                
                  <inline-icon-select :value="{value: element.icon}" :returnData="function(e){element.icon = e.value}">
                    <template v-slot:trigger>
                      <div class=" uip-padding-xxxs uip-w-22 uip-text-center uip-text-muted uip-icon uip-text-l uip-flex-center">{{element.icon}}</div>
                    </template>
                  </inline-icon-select>
                  
                  <input type="text" v-model="element.name" class="uip-input-small uip-blank-input uip-flex-grow">
                  
                  <a class="uip-link-muted uip-icon" @click.prevent.stop="deleteOption(index)">close</a>
                  
                </div>
                
                
              </div>
              
          </template>
          
        </uip-draggable>
          
        
        <button @click="newOption()" class="uip-button-default uip-icon uip-border-rounder uip-padding-xxs uip-link-muted uip-w-100p">add</button>
          
      </div>`,
};
