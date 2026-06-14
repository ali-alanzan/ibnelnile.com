const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    display: String,
    name: String,
    block: Object,
  },
  data() {
    return {
      shortCode: '',
    };
  },
  watch: {
    /**
     * Watches changes to code and updates shortcode output
     *
     * @since 3.2.0
     */
    getCode: {
      handler(newValue, oldValue) {
        this.buildShortCode();
      },
      deep: true,
    },
  },
  created() {
    this.buildShortCode();
  },
  computed: {
    /**
     * Returns user submitted code
     *
     * @since 3.2.0
     */
    getCode() {
      let code = this.get_block_option(this.block, 'block', 'shortcode');
      if (!code) return '';
      return code;
    },
  },
  methods: {
    /**
     * Builds shortcode
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async buildShortCode() {
      let code = this.getCode;
      if (!code) return '';

      const isMultisite = this.uipApp.data.options.multisite && this.uipApp.data.options.networkActivated ? 'uiptrue' : false;

      let formData = new FormData();
      formData.append('action', 'uip_get_shortcode');
      formData.append('security', uip_ajax.security);
      formData.append('shortCode', code);
      formData.append('isMultisite', isMultisite);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) return;

      if (response.success) {
        this.shortCode = response.shortCode;
      }
    },
  },
  template: `<div v-html="shortCode"></div>`,
};
