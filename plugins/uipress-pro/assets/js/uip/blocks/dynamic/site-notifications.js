const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      display: String,
      name: String,
      block: Object,
      contextualData: Object,
    },
    data: function () {
      return {
        loading: true,
        strings: {
          placeholder: __('Input placeholder...', 'uipress-pro'),
        },
      };
    },
    inject: ['uipData', 'uipress', 'uiTemplate'],
    created: function () {
      let self = this;

      //Mount watcher for page load
    },
    mounted: function () {},
    computed: {
      returnEmptyMessage() {
        let message = this.uipress.get_block_option(this.block, 'block', 'emptyMessage', true);
        if (!message) {
          return __('No notifications at the moment', 'uipress-pro');
        }
        return message;
      },
      returnPlaceHolder() {
        let item = this.uipress.get_block_option(this.block, 'block', 'inputPlaceHolder', true);
        if (!item) {
          return '';
        }
        if (this.uipress.isObject(item)) {
          if ('string' in item) {
            return item.string;
          } else {
            return '';
          }
        }
        return item;
      },
    },
    methods: {},
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
}
