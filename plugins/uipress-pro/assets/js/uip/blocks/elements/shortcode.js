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
        shortCode: '',
      };
    },
    inject: ['uipData', 'uipress', 'uiTemplate'],
    watch: {
      getCode: {
        handler(newValue, oldValue) {
          this.buildShortCode();
        },
        deep: true,
      },
    },
    created: function () {
      this.buildShortCode();
    },
    computed: {
      getCode() {
        let code = this.uipress.get_block_option(this.block, 'block', 'shortcode');
        if (!code || code == '') {
          return '';
        }
        return code;
      },
    },
    methods: {
      buildShortCode() {
        let self = this;
        let code = this.getCode;
        if (!code) {
          return '';
        }

        let formData = new FormData();
        formData.append('action', 'uip_get_shortcode');
        formData.append('security', uip_ajax.security);
        formData.append('shortCode', code);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            //self.uipress.notify(response.message, 'uipress-lite', '', 'error', true);
            //self.saving = false;
          }
          if (response.success) {
            self.shortCode = response.shortCode;
          }
        });

        //self.shortCode = code;
      },
    },
    template: `<div v-html="shortCode"></div>`,
  };
}
