const { __, _x, _n, _nx } = wp.i18n;
const pluginVersion = import.meta.url.split('?ver=')[1];

// Setup plugin data
const AppDataHolder = document.querySelector('#uip-user-management-data');
const UipressLitePath = AppDataHolder ? AppDataHolder.getAttribute('uipress-lite') : false;
const AjaxUrl = AppDataHolder ? AppDataHolder.getAttribute('ajax_url') : false;
const AjaxSecurity = AppDataHolder ? AppDataHolder.getAttribute('security') : false;
const Capabilities = AppDataHolder ? JSON.parse(AppDataHolder.getAttribute('Capabilities')) : [];
// Remove data node
if (AppDataHolder) AppDataHolder.remove();

const setupUserManagement = async () => {
  // Use uipress lites instance of vue
  const { createApp, getCurrentInstance, defineComponent, defineAsyncComponent, ref, reactive } = await import(`${UipressLitePath}assets/js/libs/vue-esm.js`);
  const { VueDraggableNext } = await import(`${UipressLitePath}assets/js/libs/VueDraggableNext.js`);
  const { sendServerRequest, isObject, createUID, prepareJSON, stripUIPparams } = await import(`${UipressLitePath}assets/js/uip/v3.5/utility/functions.min.js`);
  const { createRouter, createWebHistory, createWebHashHistory } = await import(`${UipressLitePath}assets/js/libs/vue-router-esm.js`);

  const Args = {
    components: {
      'Notify': defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/v3.5/utility/notify.min.js?ver=${pluginVersion}`)),
      'UserMessage': defineAsyncComponent(() => import(`./components/user-message.min.js?ver=${pluginVersion}`)),
    },
    data() {
      return {};
    },
    template: '<router-view></router-view><Notify/><UserMessage/>',
  };

  // Import routes
  const ListView = () => import(`./components/app-view.min.js?ver=${pluginVersion}`);
  const UserPanel = () => import(`./components/user-panel.min.js?ver=${pluginVersion}`);
  const UserEditPanel = () => import(`./components/user-edit-panel.min.js?ver=${pluginVersion}`);
  const UserNewPanel = () => import(`./components/new-user.min.js?ver=${pluginVersion}`);
  const RolePanel = () => import(`./components/role-panel.min.js?ver=${pluginVersion}`);

  // Setup routes
  const AppRoutes = [
    {
      path: '/',
      name: __('List View', 'uipress-pro'),
      component: ListView,
      query: { page: '1', search: '' },
      children: [
        {
          name: __('View user', 'uipress-pro'),
          path: '/users/:id',
          component: UserPanel,
        },
        {
          name: __('Edit user', 'uipress-pro'),
          path: '/users/:id/edit',
          component: UserEditPanel,
        },
        {
          name: __('New user', 'uipress-pro'),
          path: '/users/new',
          component: UserNewPanel,
        },
        {
          name: __('Edit role', 'uipress-pro'),
          path: '/roles/edit/:role',
          component: RolePanel,
        },
      ],
    },
  ];

  const Router = createRouter({
    history: createWebHashHistory(),
    routes: AppRoutes,
  });

  // Create app
  const App = createApp(Args);
  App.use(Router);

  // Import components
  const UserTable = defineAsyncComponent(() => import(`./components/user-table.min.js?ver=${pluginVersion}`));
  const RoleTable = defineAsyncComponent(() => import(`./components/role-table.min.js?ver=${pluginVersion}`));
  const ActivityTable = defineAsyncComponent(() => import(`./components/activity-table.min.js?ver=${pluginVersion}`));
  const UserRoleSelect = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/components/user-role-multiselect.min.js?ver=${pluginVersion}`));
  const MultiSelect = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/components/multiselect.min.js?ver=${pluginVersion}`));
  const DropDown = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/components/dropdown.min.js?ver=${pluginVersion}`));
  const SwitchToggle = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/components/switch-toggle.min.js?ver=${pluginVersion}`));
  const ToggleSection = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/components/toggle-section.min.js?ver=${pluginVersion}`));
  const InlineImageSelect = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/options/inline-image-select.min.js?ver=${pluginVersion}`));
  const RichTextEditor = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/options/paragraph-input.min.js?ver=${pluginVersion}`));
  const ContextMenu = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/v3.5/utility/contextmenu.min.js?ver=${pluginVersion}`));
  const FloatingPanel = defineAsyncComponent(() => import(`./components/floating-panel.min.js?ver=${pluginVersion}`));
  const Confirm = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/v3.5/utility/confirm.min.js?ver=${pluginVersion}`));
  const MediaLibrary = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/v3.5/utility/media-library.min.js?ver=${pluginVersion}`));

  App.component('UserTable', UserTable);
  App.component('UserRoleSelect', UserRoleSelect);
  App.component('dropdown', DropDown);
  App.component('switch-select', SwitchToggle);
  App.component('toggle-switch', SwitchToggle);
  App.component('ContextMenu', ContextMenu);
  App.component('FloatingPanel', FloatingPanel);
  App.component('ToggleSection', ToggleSection);
  App.component('Confirm', Confirm);
  App.component('InlineImageSelect', InlineImageSelect);
  App.component('mediaLibrary', MediaLibrary);
  App.component('RichTextEditor', RichTextEditor);
  App.component('RoleTable', RoleTable);
  App.component('ActivityTable', ActivityTable);
  App.component('MultiSelect', MultiSelect);

  App.config.globalProperties.AjaxUrl = AjaxUrl;
  App.config.globalProperties.AjaxSecurity = AjaxSecurity;
  App.config.globalProperties.sendServerRequest = sendServerRequest;
  App.config.globalProperties.uipApp = reactive({ litePath: UipressLitePath });
  App.config.globalProperties.isObject = isObject;
  App.config.globalProperties.createUID = createUID;
  App.config.globalProperties.capabilities = Capabilities;
  App.config.globalProperties.prepareJSON = prepareJSON;
  App.config.globalProperties.stripUIPparams = stripUIPparams;

  const Mounter = document.querySelector('#uip-user-management');

  if (Mounter) App.mount('#uip-user-management');
};

setupUserManagement();
