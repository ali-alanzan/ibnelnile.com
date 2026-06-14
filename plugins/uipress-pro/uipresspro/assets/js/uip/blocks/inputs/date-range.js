const { __, _x, _n, _nx } = wp.i18n;
import '../../../libs/easepick.min.js';
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
      formData: {},
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
  watch: {
    /**
     * Watches changes to date range
     *
     * @since 3.2.0
     */
    range: {
      handler(newValue, oldValue) {
        if (!this.picker) return;
        this.picker.destroy();
        this.mountPicker();
      },
    },
  },
  mounted() {
    document.addEventListener('uipress/app/forms/change', this.handleFormChange);
    this.mountPicker();
  },
  beforeUnmount() {
    document.removeEventListener('uipress/app/forms/change', this.handleFormChange);
  },
  computed: {
    /**
     * Returns placeholder for input
     *
     * @since 3.2.13
     */
    returnPlaceHolder() {
      const item = this.get_block_option(this.block, 'block', 'inputPlaceHolder', true);
      if (!item) return '';

      if (!this.isObject(item)) return item;
      if (item.string) return item.string;
      return '';
    },

    /**
     * Returns populated value
     *
     * @since 3.2.13
     */
    returnPopulated() {
      // If input name exists in pre populate then return it
      if (this.returnName in this.formData) {
        return this.formData[this.returnName];
      }
    },

    /**
     * Returns label for input
     *
     * @since 3.2.13
     */
    returnLabel() {
      const item = this.get_block_option(this.block, 'block', 'inputLabel', true);
      if (!item) return '';

      if (!this.isObject(item)) return item;
      if (item.string) return item.string;
      return '';
    },

    /**
     * Returns whether the input field is required
     *
     * @since 3.2.13
     */
    returnRequired() {
      let required = this.get_block_option(this.block, 'block', 'inputRequired');
      return this.isObject(required) ? required.value : required;
    },

    /**
     * Returns name of block
     *
     * @since 3.2.0
     */
    returnName() {
      return this.get_block_option(this.block, 'block', 'inputName');
    },

    /**
     * Returns the current date range
     *
     * @since 3.2.0
     */
    returnDateRange() {
      this.range = this.get_block_option(this.block, 'block', 'dateRange', true);
      return this.range;
    },

    /**
     * Returns args for date picker
     *
     * @since 3.2.0
     */
    returnPickerArgs() {
      let range = this.returnDateRange;
      let datepicker = this.$refs.datepicker;
      let args = {
        element: datepicker,
        css: [uipProPath + 'assets/css/libs/uip-datepicker.css'],
        lang: this.uipApp.data.options.locale,
        plugins: ['RangePlugin', 'PresetPlugin', 'LockPlugin'],
        grid: 2,
        calendars: 2,
        LockPlugin: {
          maxDate: new Date(),
        },
        zIndex: 99,
        RangePlugin: {
          tooltip: true,
        },
      };

      return args;
    },
  },
  methods: {
    /**
     * Mounts date picker
     *
     * @since 3.2.0
     */
    mountPicker() {
      this.picker = new easepick.create(this.returnPickerArgs);
    },

    /**
     * Handles date change events
     *
     * @param {object} evt - date change event
     * @since 3.2.0
     */
    handleFormChange(evt) {
      if (!evt.detail.IDS) return;
      if (!Array.isArray(evt.detail.IDS)) return;
      if (!evt.detail.IDS.includes(this.block.uid)) return;

      this.formData = evt.detail.formData;
    },
  },
  template: `
      <label class="uip-flex uip-flex-column" >
        <span class="uip-input-label uip-text-muted uip-margin-bottom-xxs">{{returnLabel}}</span>
        <div class="uip-background-muted uip-border-round uip-overflow-hidden uip-padding-xxs uip-flex uip-gap-xs uip-flex-center uip-date-input">
          <div class="uip-icon uip-text-l">calendar_month</div>
          <input ref="datepicker" :name="returnName" :range="returnDateRange"
          class="uip-blank-input uip-text-s" type="text" :placeholder="returnPlaceHolder" :required="returnRequired" :value="returnPopulated">
        </div>
      </label>`,
};
