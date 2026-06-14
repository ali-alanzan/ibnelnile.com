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
      getCode() {
        let code = this.uipress.get_block_option(this.block, 'block', 'customHTML');
        if (!code || code == '') {
          return '';
        }
        return code;
      },
    },
    methods: {},
    template: `<div v-html="getCode"></div>`,
  };
}
