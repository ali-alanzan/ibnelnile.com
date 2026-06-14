const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
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
       * Returns src for iframe
       *
       * @since 3.2.0
       */
      getLink() {
        const defaultLink = 'https://uipress.co';
        let src = this.get_block_option(this.block, 'block', 'linkSelect', true);

        if (typeof src == 'undefined') return defaultLink;

        if (!src || src == '') return defaultLink;

        return this.isObject(src) ? src.value : src;
      },
    },
    template: `<iframe :src="getLink" ></iframe>`,
  };
}
