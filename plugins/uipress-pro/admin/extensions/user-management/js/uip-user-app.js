//Dynamic import Import scripts
///IMPORT TRANSLATIONS
const { __, _x, _n, _nx } = wp.i18n;
const pluginVersion = import.meta.url.split('?ver=')[1];
//App data
const uipUserData = JSON.parse(uip_user_app_ajax.appData);
//Import required classes and modules
const uipress = new window.uipClass();

import { createApp, getCurrentInstance, defineComponent, ref } from '../../../../../uipress-lite/assets/js/libs/vue-esm.js';
import { createRouter, createWebHistory, createWebHashHistory } from '../../../../../uipress-lite/assets/js/libs/vue-router-esm.js';

//Import modules
import * as navigation from './modules/navigation.min.js?ver=3.1.05';
import * as userTable from './modules/user-table.min.js?ver=3.1.05';
import * as roleSelect from './modules/select-roles.min.js?ver=3.1.05';
import * as dropdown from '../../../../../uipress-lite/assets/js/uip/modules/uip-dropdown.min.js?ver=3.1.05';
import * as offcanvas from './modules/offcanvas.min.js?ver=3.1.05';
import * as userPanel from './modules/user-panel.min.js?ver=3.1.05';
import * as editUserPanel from './modules/user-edit-panel.min.js?ver=3.1.05';
import * as userMessage from './modules/user-message.min.js?ver=3.1.05';
import * as newUserPanel from './modules/new-user.min.js?ver=3.1.05';
import * as roleTable from './modules/role-table.min.js?ver=3.1.05';
import * as rolePanel from './modules/role-panel.min.js?ver=3.1.05';
import * as newRole from './modules/new-role.min.js?ver=3.1.05';
import * as activityTable from './modules/activity-table.min.js?ver=3.1.05';
import * as batchRoleUpdate from './modules/batch-role-update.min.js?ver=3.1.05';
import * as userGroups from './modules/user-groups.min.js?ver=3.1.05';
import * as groupTemplate from './modules/group-template.min.js?ver=3.1.05';
import * as groupSelect from './modules/group-select.min.js?ver=3.1.05';
import * as iconSelect from './modules/icon-select.min.js?ver=3.1.05';
import * as appView from './modules/app-view.min.js?ver=3.1.05';
import * as loader from '../../../../../uipress-lite/assets/js/uip/modules/uip-loading-chart.min.js?ver=3.1.05';
import * as tooltip from '../../../../../uipress-lite/assets/js/uip/modules/uip-tooltip.min.js?ver=3.1.05';
import * as floatingPanel from './modules/floating-panel.min.js?ver=3.1.05';
import * as statusSelect from './modules/activity-status-select.min.js?ver=3.1.05';

const uipUserAppArgs = {
  data() {
    return {
      loading: true,
      screenWidth: window.innerWidth,
      appData: uipUserData.app,
    };
  },
  created: function () {
    window.addEventListener('resize', this.getScreenWidth);
  },
  provide() {
    return {
      appData: this.appData,
      uipress: uipress,
    };
  },
  computed: {},
  mounted: function () {},
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
    component: appView.moduleData(),
    query: { page: '1', search: '' },
    children: [
      {
        name: __('View user', 'uipress-pro'),
        path: '/users/:id',
        component: userPanel.moduleData(),
      },
      {
        name: __('Edit user', 'uipress-pro'),
        path: '/users/:id/edit',
        component: editUserPanel.moduleData(),
      },
      {
        name: __('New user', 'uipress-pro'),
        path: '/users/new',
        component: newUserPanel.moduleData(),
      },
      {
        name: __('Message user', 'uipress-pro'),
        path: '/message/:recipients',
        component: userMessage.moduleData(),
      },
      {
        name: __('Batch update roles', 'uipress-pro'),
        path: '/batch/roles/:users',
        component: batchRoleUpdate.moduleData(),
      },
      {
        name: __('Edit role', 'uipress-pro'),
        path: '/roles/edit/:role',
        component: rolePanel.moduleData(),
      },
      {
        name: __('New role', 'uipress-pro'),
        path: '/roles/edit/new',
        component: newRole.moduleData(),
      },
    ],
  },
];

const uiUserrouter = createRouter({
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
});

uiUserrouter.beforeEach((to, from, next) => {
  if (!to.query.section) {
    let newQuery = from.query;
    if (!newQuery.section) {
      newQuery.section = 'users';
    }
    next({ path: to.path, query: { ...newQuery } });
  } else {
    next();
  }
});

//:to="{path: '/', query: {...$route.query, my:query}}"

const uipUserApp = createApp(uipUserAppArgs);
//Allow reactive data from inject
uipUserApp.config.unwrapInjectedRef = true;
uipUserApp.config.devtools = true;
uipUserApp.use(uiUserrouter);
uipUserApp.provide('router', uiUserrouter);

///import components
uipUserApp.component('build-navigation', navigation.moduleData());
uipUserApp.component('user-table', userTable.moduleData());
uipUserApp.component('role-select', roleSelect.moduleData());
uipUserApp.component('drop-down', dropdown.moduleData());
uipUserApp.component('tooltip', tooltip.moduleData());
uipUserApp.component('offcanvas', offcanvas.moduleData());
uipUserApp.component('user-panel', userPanel.moduleData());
uipUserApp.component('role-table', roleTable.moduleData());
uipUserApp.component('activity-table', activityTable.moduleData());
uipUserApp.component('user-groups', userGroups.moduleData());
uipUserApp.component('group-template', groupTemplate.moduleData());
uipUserApp.component('group-select', groupSelect.moduleData());
uipUserApp.component('icon-select', iconSelect.moduleData());
uipUserApp.component('loading-chart', loader.moduleData());
uipUserApp.component('floating-panel', floatingPanel.moduleData());
uipUserApp.component('uip-tooltip', tooltip.moduleData());
uipUserApp.component('activity-status-select', statusSelect.moduleData());

uipUserApp.config.errorHandler = function (err, vm, info) {
  console.log(err);
};

uipUserApp.mount('#uip-user-management');
