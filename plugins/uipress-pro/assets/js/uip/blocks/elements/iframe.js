const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      display: String,
      name: String,
      block: Object,
    },
    data: function () {
      return {
        loading: true,
      };
    },
    inject: ['uipData', 'uipress', 'uiTemplate'],
    watch: {},
    mounted: function () {},
    computed: {
      getLink() {
        let src = this.uipress.get_block_option(this.block, 'block', 'linkSelect', true);

        if (typeof src == 'undefined') {
          return 'https://uipress.co';
        }

        if (!src || src == '') {
          return 'https://uipress.co';
        }

        if (this.uipress.isObject(src)) {
          if ('value' in src) {
            return src.value;
          }
        }
        return src;
      },
    },
    methods: {},
    template: `
		  <iframe :src="getLink" >
		  </iframe>`,
  };
}
