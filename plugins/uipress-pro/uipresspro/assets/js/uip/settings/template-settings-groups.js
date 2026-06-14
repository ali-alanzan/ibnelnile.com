///IMPORT TRANSLATIONS
const { __, _x, _n, _nx } = wp.i18n;
const SettingsGroups = {
  analytics: {
    label: __('Analytics', 'uipress-pro'),
    name: 'analytics',
    icon: 'bar_chart',
  },
};

//Group options
const Settings = [
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

(function () {
  wp.hooks.addFilter('uipress.uibuilder.templatesettings.groups.register', 'uipress', (current) => ({ ...current, ...SettingsGroups }));
  wp.hooks.addFilter('uipress.uibuilder.templatesettings.options.register', 'uipress', (current) => [...current, ...Settings]);
})();
