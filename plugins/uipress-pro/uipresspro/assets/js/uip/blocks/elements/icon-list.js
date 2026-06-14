const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    display: String,
    name: String,
    block: Object,
  },
  data() {
    return {};
  },
  computed: {
    /**
     * Returns list items
     *
     * @since 3.2.0
     */
    getListItems() {
      let items = this.get_block_option(this.block, 'block', 'blockListItems', true);

      if (typeof items === 'undefined') {
        return [];
      }

      if (!items) {
        return [];
      }

      if (!('options' in items)) {
        return [];
      }

      if (!Array.isArray(items.options)) {
        return [];
      }

      return items.options;
    },

    /**
     * Returns list direction
     *
     * @since 3.2.0
     */
    getListDirection() {
      let items = this.get_block_option(this.block, 'block', 'listDirection', true);

      if (typeof items === 'undefined') {
        return 'vertical';
      }

      if (!items) {
        return 'vertical';
      }

      if (!('value' in items)) {
        return 'vertical';
      }

      return items.value;
    },
  },
  template: `
  
        <div v-if="getListDirection == 'vertical'" class="uip-flex uip-flex-column uip-row-gap-xs">
          <div v-for="item in getListItems" class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
            <span class="uip-icon">{{item.icon}}</span>
            <span>{{item.name}}</span>
          </div>
        </div>
        
        <div v-else class="uip-flex uip-flex-row uip-gap-xs">
          <div v-for="item in getListItems" class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
            <span class="uip-icon">{{item.icon}}</span>
            <span>{{item.name}}</span>
          </div>
        </div>
        
        `,
};
