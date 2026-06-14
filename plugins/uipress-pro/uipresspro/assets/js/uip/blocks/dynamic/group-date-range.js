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
    this.mountPicker();
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
     * Returns whether the input is required
     *
     * @since 3.2.0
     */
    returnRequired() {
      return this.get_block_option(this.block, 'block', 'inputRequired');
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
     * Sets group dates for picker
     *
     * @param {string} start
     * @param {string} end
     * @since 3.2.0
     */
    setGroupDates(start, end) {
      const IDS = this.getChildIDS();

      const dateRangeEvent = new CustomEvent('uipress/app/daterange/change', {
        detail: { groupDate: { start: start, end: end }, IDS: IDS },
      });

      document.dispatchEvent(dateRangeEvent);
    },

    /**
     * Returns all children IDS for group date event change
     *
     * @since 3.2.0
     */
    getChildIDS() {
      const RecursiveHandler = (blocks) => {
        if (!Array.isArray(blocks)) return [];
        let IDs = [];
        for (let block of blocks) {
          IDs.push(block.uid);

          if (Array.isArray(block.content)) {
            IDs = [...IDs, ...RecursiveHandler(block.content)];
          }
        }

        return IDs;
      };

      // No children so return empty array
      if (!this.block.content.length) return [];

      return RecursiveHandler(this.block.content);
    },

    /**
     * Mounts picker
     *
     * @since 3.2.0
     */
    mountPicker() {
      this.picker = new easepick.create(this.returnPickerArgs);
      this.picker.on('select', this.handleDateChange);
    },

    /**
     * Handles data change
     *
     * @param {object} e - the date change event
     * @since 3.2.0
     */
    handleDateChange(e) {
      const startdate = this.picker.getStartDate();
      const enddate = this.picker.getEndDate();
      this.setGroupDates(startdate, enddate);
    },
  },
  template: `
      <div class="uip-flex uip-flex-column">
      
        <div class="uip-background-muted uip-border-round uip-overflow-hidden uip-padding-xxs uip-flex uip-gap-xs uip-flex-center uip-date-input uip-inline-flex">
          <div class="uip-icon uip-text-l">calendar_month</div>
          <input ref="datepicker" :value="dateRange" :name="returnName" :range="returnDateRange"
          class="uip-blank-input uip-text-s" type="text" :placeholder="returnPlaceHolder" :required="returnRequired">
        </div>
        
        <uip-content-area class="uip-date-group-area"
        :content="block.content" :returnData="(data)=>{block.content = data}"/>
        
      </div>`,
};
