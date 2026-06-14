const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    display: String,
    name: String,
    block: Object,
  },
  data() {
    return {
      loading: true,
      strings: {
        placeholder: __('Input placeholder...', 'uipress-pro'),
      },
    };
  },
  inject: ['uiTemplate'],
  computed: {
    /**
     * Returns empty message placeholder
     *
     * @since 3.2.0
     */
    returnEmptyMessage() {
      let message = this.get_block_option(this.block, 'block', 'emptyMessage', true);
      if (!message) {
        return __('No notifications at the moment', 'uipress-pro');
      }
      return message;
    },
    /**
     * Returns plugin search bar placeholder
     *
     * @since 3.2.0
     */
    returnPlaceHolder() {
      const item = this.get_block_option(this.block, 'block', 'inputPlaceHolder', true);
      if (!item) return '';

      if (!this.isObject(item)) return item;
      if (item.string) return item.string;
      return '';
    },
  },
  template: `
      <div class="">
        <component is="style" scoped>
         .notice{
           display: block !important;
           margin-left: 0;
           margin-right: 0;
         }
        </component>
        
        <div v-if="uiTemplate.notifications.length < 1">{{returnEmptyMessage}}</div>
      
        <template v-for="notification in uiTemplate.notifications">
          <div class="uip-site-notification-holder uip-text-normal" v-html="notification"></div>
        </template>
        
      </div>`,
};
