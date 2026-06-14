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
      range: false,
      picker: false,
      imageEditor: false,
      dateRange: '',
      date: {
        single: '',
        dateRange: {
          start: '',
          end: '',
        },
        dateRangeComparison: {
          start: '',
          end: '',
        },
      },
      strings: {
        placeholder: __('Input placeholder...', 'uipress-pro'),
      },
    };
  },
  mounted() {},
  computed: {
    /**
     * Returns whether media should be limited to author
     *
     * @since 3.2.0
     */
    limitToAuthor() {
      return this.get_block_option(this.block, 'block', 'limitToAuthor', true);
      return item;
    },

    /**
     * Returns number of photos per page
     *
     * @since 3.2.0
     */
    returnRange() {
      let range = this.get_block_option(this.block, 'block', 'photosPerPage');
      range = isNaN(range) ? 20 : range;
      range = range > 999 ? 999 : range;
      range = !range ? 20 : range;
      return range;
    },
  },
  template: `
      <uipMediaLibrary/>`,
};
