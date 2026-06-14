const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Array,
      placeHolder: String,
    },
    data: function () {
      return {
        option: [],
        strings: {
          placeHolder: __('Select post types', 'uipress-lite'),
          searchPlaceHolder: __('Seach post types', 'uipress-lite'),
        },
      };
    },
    watch: {
      option: {
        handler(newValue, oldValue) {
          this.returnData(newValue);
        },
        deep: true,
      },
    },
    created: function () {
      if (this.value) {
        if (Array.isArray(this.value)) {
          this.option = this.value;
        }
      }
    },
    template: `
    <post-type-select :selected="option" :placeHolder="strings.placeHolder" :searchPlaceHolder="strings.searchPlaceHolder" :single="false"
    :updateSelected="function(data){option = data}">
    </post-type-select>`,
  };
}
