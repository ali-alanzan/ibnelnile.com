const { __, _x, _n, _nx } = wp.i18n;
export default {
  data() {
    return {};
  },
  inject: ['uiTemplate'],
  computed: {
    returnFavicon() {
      if (!this.isObject(this.uiTemplate.globalSettings)) {
        return false;
      }
      if (!('options' in this.uiTemplate.globalSettings)) {
        return false;
      }
      if (!('whiteLabel' in this.uiTemplate.globalSettings.options)) {
        return false;
      } else {
        if ('favicon' in this.uiTemplate.globalSettings.options.whiteLabel) {
          return this.returnValue(this.uiTemplate.globalSettings.options.whiteLabel.favicon);
        }
      }
    },
  },
  methods: {
    getFavicon() {
      let fav = this.returnFavicon;
      if (fav) {
        this.setFavicon(fav);
      }
    },
    returnValue(option) {
      //Dynamic Images
      if (option.dynamic) {
        let dynkey = option.dynamicKey;
        if (this.uipApp.data.dynamicOptions[dynkey]) {
          let dynValue = this.uipApp.data.dynamicOptions[dynkey].value;
          return dynValue;
        }
      }

      if ('url' in option) {
        if (option.url != '') {
          return option.url;
        }
      }
      return false;
    },
    setFavicon(fav) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = fav;
    },
  },
  template: '{{getFavicon()}}',
};
