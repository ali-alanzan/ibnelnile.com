///IMPORT TRANSLATIONS
const { __, _x, _n, _nx } = wp.i18n;
export function fetchGroups() {
  return {
    //Group two
    whiteLabel: {
      label: __('White label', 'uipress-pro'),
      name: 'whiteLabel',
      icon: 'branding_watermark',
    },
    analytics: {
      label: __('Analytics', 'uipress-pro'),
      name: 'analytics',
      icon: 'bar_chart',
    },
  };
}

//Group options
export function fetchSettings() {
  return [
    //White label
    {
      component: 'inline-image-select',
      group: 'whiteLabel',
      uniqueKey: 'favicon',
      label: __('Template favicon', 'uipress-pro'),
      accepts: Object,
      args: {
        hasPositioning: false,
      },
    },
    {
      component: 'uip-dynamic-input',
      group: 'whiteLabel',
      uniqueKey: 'siteTitle',
      label: __('Replace Wordpress in site title', 'uipress-pro'),
      accepts: Object,
      args: {
        language: 'css',
      },
    },
    //Analytics
    {
      component: 'choice-select',
      group: 'analytics',
      args: {
        options: {
          false: {
            value: false,
            label: __('Global', 'uipress-pro'),
          },
          true: {
            value: true,
            label: __('User', 'uipress-pro'),
          },
        },
      },
      uniqueKey: 'saveAccountToUser',
      label: __('Google Analytics', 'uipress-pro'),
      help: __('By default, accounts are set site wide. So whoever logs in sees the same account data. Setting this on a user level allows each user to sync their own account', 'uipress-pro'),
      accepts: Boolean,
    },
  ];
}
