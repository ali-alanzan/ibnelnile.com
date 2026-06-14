//Dynamic import Import scripts
///IMPORT TRANSLATIONS
const { __, _x, _n, _nx } = wp.i18n;
const pluginVersion = import.meta.url.split('?ver=')[1];

import { createApp, getCurrentInstance, defineComponent, ref } from '../../../../../uipress-lite/assets/js/libs/vue-esm.js';
import { createRouter, createWebHistory, createWebHashHistory } from '../../../../../uipress-lite/assets/js/libs/vue-router-esm.js';
import { VueDraggableNext } from '../../../../../uipress-lite/assets/js/libs/VueDraggableNext.js';

//Import required classes and modules
const uipress = new window.uipClass();

//Import main ui view
import * as menuList from './modules/menu-list.min.js?ver=3.1.05';
import * as editor from './modules/editor.min.js?ver=3.1.05';
import * as menuEditor from './modules/menu-editor.min.js?ver=3.1.05';
import * as switchSelect from '../../../../../uipress-lite/assets/js/uip/options/uip-switch-select.min.js?ver=3.1.05';
import * as toolTip from '../../../../../uipress-lite/assets/js/uip/modules/uip-tooltip.min.js?ver=3.1.05';
import * as loader from '../../../../../uipress-lite/assets/js/uip/modules/uip-loading-chart.min.js?ver=3.1.05';
import * as toggle from '../../../../../uipress-lite/assets/js/uip/modules/uip-switch-toggle.min.js?ver=3.1.05';
import * as dropdown from '../../../../../uipress-lite/assets/js/uip/modules/uip-dropdown.min.js?ver=3.1.05';
import * as iconSelect from '../../../../../uipress-lite/assets/js/uip/options/uip-inline-icon-select.min.js?ver=3.1.05';
import * as userSelect from '../../../../../uipress-lite/assets/js/uip/modules/uip-user-role-multiselect.min.js?ver=3.1.05';
//'./options/uip-switch-select.min.js?version=310';

/**
 * Builds main args for uip menu creator app
 * @since 3.0.0
 */
const uipMenuCreatorAppArgs = {
  data() {
    return {
      loading: true,
    };
  },
  provide() {
    return {
      uipress: uipress,
    };
  },
  created: function () {
    //window.addEventListener('resize', this.getScreenWidth);
  },
  mounted: function () {
    //window.addEventListener('resize', this.getScreenWidth);
  },
  computed: {
    returnGlobalData() {
      return this.uipGlobalData;
    },
  },
  methods: {},
  template: '<router-view></router-view>',
};

/**
 * Defines and create ui builder routes
 * @since 3.0.0
 */
const routes = [
  {
    path: '/',
    name: __('List View', 'uipress-pro'),
    component: menuList.moduleData(),
    query: { page: '1', search: '' },
    children: [
      {
        name: __('Menu creator', 'uipress-pro'),
        path: '/menucreator/:id',
        component: editor.moduleData(),
      },
    ],
  },
];

const uiBuilderrouter = createRouter({
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
});

/**
 * Define app
 * @since 3.0.0
 */
const uipMenuCreatorApp = createApp(uipMenuCreatorAppArgs);
//Allow reactive data from inject
uipMenuCreatorApp.config.unwrapInjectedRef = true;
uipMenuCreatorApp.config.devtools = true;
uipMenuCreatorApp.use(uiBuilderrouter);
uipMenuCreatorApp.provide('router', uiBuilderrouter);

//Import
uipMenuCreatorApp.component('switch-select', switchSelect.moduleData());
uipMenuCreatorApp.component('uip-tooltip', toolTip.moduleData());
uipMenuCreatorApp.component('loading-chart', loader.moduleData());
uipMenuCreatorApp.component('toggle-switch', toggle.moduleData());
uipMenuCreatorApp.component('menu-editor', menuEditor.moduleData());
uipMenuCreatorApp.component('drop-down', dropdown.moduleData());
uipMenuCreatorApp.component('inline-icon-select', iconSelect.moduleData());
uipMenuCreatorApp.component('user-role-select', userSelect.moduleData());
uipMenuCreatorApp.component('draggable', VueDraggableNext);
/**
 * Handles app errors
 * @since 3.0.0
 */
uipMenuCreatorApp.config.errorHandler = function (err, vm, info) {
  uipress.notify(err, info, 'error');
  console.log(err);
};

/**
 * Register vue components
 * @since 3.0.0
 */
//uipApp.component('uip-main-app', uipMainView.moduleData());
uipMenuCreatorApp.mount('#uip-menu-creator-app');
