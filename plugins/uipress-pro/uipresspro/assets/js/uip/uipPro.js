///IMPORT TRANSLATIONS
const { __, _x, _n, _nx } = wp.i18n;

//Dynamic import Import scripts
const pluginVersion = import.meta.url.split('?ver=')[1];
window.uipressroute = 'https://api.uipress.co/';

const isObject = (obj) => {
  return obj !== null && typeof obj === 'object' && obj.constructor === Object;
};
const plugindata = {
  proVersion: pluginVersion,
};
window.uipress = isObject(window.uipress) ? { ...window.uipress, ...plugindata } : plugindata;

/**
 * Import blocks
 *
 * @since 3.2.0
 */
import './blocks/analytics/loader.min.js?ver=3.2.2';
import './blocks/inputs/loader.min.js?ver=3.2.2';
import './blocks/storeanalytics/loader.min.js?ver=3.2.2';
import './blocks/dynamic/loader.min.js?ver=3.2.2';
import './blocks/elements/loader.min.js?ver=3.2.2';
import './blocks/layout/loader.min.js?ver=3.2.2';

/**
 * Import settings
 *
 * @since 3.2.0
 */

import './settings/global-settings-groups.min.js?ver=3.2.2';

/**
 * Import template settings
 *
 * @since 3.2.0
 */

import './settings/template-settings-groups.min.js?ver=3.2.2';

/**
 * Import variables
 *
 * @since 3.2.0
 */
import './styles/pro-styles.min.js?ver=3.2.2';

/**
 * Import plugins
 *
 * @since 3.2.0
 */

import './settings/builder-plugins.min.js?ver=3.2.2';
