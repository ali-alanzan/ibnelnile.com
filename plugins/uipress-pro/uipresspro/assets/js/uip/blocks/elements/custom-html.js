const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    display: String,
    name: String,
    block: Object,
  },
  computed: {
    /**
     * Returns user submitted HTML code
     *
     * @since 3.2.0
     */
    getCode() {
      let code = this.get_block_option(this.block, 'block', 'customHTML');
      if (!code) return '';
      return code;
    },
  },
  template: `<div v-html="getCode"></div>`,
};
