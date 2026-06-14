const { __, _x, _n, _nx } = wp.i18n;
const pluginVersion = import.meta.url.split('?ver=')[1];

const AppDataHolder = document.querySelector('#uip-menu-creator-app-data');
const UipressLitePath = AppDataHolder ? AppDataHolder.getAttribute('uipress-lite') : false;
const AjaxUrl = AppDataHolder ? AppDataHolder.getAttribute('ajax_url') : false;
const AjaxSecurity = AppDataHolder ? AppDataHolder.getAttribute('security') : false;
const MasterMenu = AppDataHolder ? JSON.parse(AppDataHolder.getAttribute('mastermenu')) : { menu: [], submenu: {} };
const isMultisite = AppDataHolder ? JSON.parse(AppDataHolder.getAttribute('isMultisite')) : false;
const isPrimarySite = AppDataHolder ? JSON.parse(AppDataHolder.getAttribute('isPrimarySite')) : false;
if (AppDataHolder) AppDataHolder.remove();

const setupMenuCreator = async () => {
  // Use uipress lites instance of vue
  const { createApp, getCurrentInstance, defineComponent, defineAsyncComponent, ref, reactive } = await import(`${UipressLitePath}assets/js/libs/vue-esm.js`);
  const { VueDraggableNext } = await import(`${UipressLitePath}assets/js/libs/VueDraggableNext.js`);
  const { sendServerRequest, isObject, createUID, prepareJSON } = await import(`${UipressLitePath}assets/js/uip/v3.5/utility/functions.min.js`);
  /**
   * Import core components
   *
   * @since 3.2.0
   */
  const MenuList = defineAsyncComponent(() => import(`./components/menu-list.min.js?ver=${pluginVersion}`));
  const MenuEditor = defineAsyncComponent(() => import(`./components/menu-editor.min.js?ver=${pluginVersion}`));
  const FloatingPanel = defineAsyncComponent(() => import(`./components/floating-panel.min.js?ver=${pluginVersion}`));
  const CustomMenuBuilder = defineAsyncComponent(() => import(`./components/custom-menu-builder.min.js?ver=${pluginVersion}`));
  const ItemEditor = defineAsyncComponent(() => import(`./components/item-editor.min.js?ver=${pluginVersion}`));
  const NewMenuItems = defineAsyncComponent(() => import(`./components/new-menu-items.min.js?ver=${pluginVersion}`));

  const Loader = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/components/loading-chart.min.js?ver=${pluginVersion}`));
  const DropDown = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/components/dropdown.min.js?ver=${pluginVersion}`));
  const SwitchToggle = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/components/switch-toggle.min.js?ver=${pluginVersion}`));
  const ColourPicker = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/options/color-select.min.js?ver=${pluginVersion}`));
  const IconPicker = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/options/icon-select.min.js?ver=${pluginVersion}`));
  const Notify = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/v3.5/utility/notify.min.js?ver=${pluginVersion}`));
  const ContextMenu = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/v3.5/utility/contextmenu.min.js?ver=${pluginVersion}`));
  const Confirm = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/v3.5/utility/confirm.min.js?ver=${pluginVersion}`));
  const UserRoleSelect = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/components/user-role-multiselect.min.js?ver=${pluginVersion}`));
  const ScreenControl = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/v3.5/utility/screen-control.min.js?ver=${pluginVersion}`));
  const Classes = defineAsyncComponent(() => import(`${UipressLitePath}assets/js/uip/options/classes.min.js?ver=${pluginVersion}`));

  // Create app
  const App = createApp(MenuList);

  App.component('MenuList', MenuList);
  App.component('MenuEditor', MenuEditor);
  App.component('CustomMenuBuilder', CustomMenuBuilder);
  App.component('ItemEditor', ItemEditor);
  App.component('NewMenuItems', NewMenuItems);

  App.component('loading-chart', Loader);
  App.component('dropdown', DropDown);
  App.component('Notify', Notify);
  App.component('uipDraggable', VueDraggableNext);
  App.component('ContextMenu', ContextMenu);
  App.component('switch-select', SwitchToggle);
  App.component('toggle-switch', SwitchToggle);
  App.component('IconPicker', IconPicker);
  App.component('user-role-select', UserRoleSelect);
  App.component('Confirm', Confirm);
  App.component('FloatingPanel', FloatingPanel);
  App.component('ScreenControl', ScreenControl);
  App.component('Classes', Classes);

  App.config.globalProperties.AjaxUrl = AjaxUrl;
  App.config.globalProperties.AjaxSecurity = AjaxSecurity;
  App.config.globalProperties.sendServerRequest = sendServerRequest;
  App.config.globalProperties.uipApp = reactive({});
  App.config.globalProperties.isObject = isObject;
  App.config.globalProperties.createUID = createUID;
  App.config.globalProperties.uipGlobalMenu = MasterMenu;
  App.config.globalProperties.prepareJSON = prepareJSON;
  App.config.globalProperties.isMultisite = isMultisite === true ? true : false;
  App.config.globalProperties.isPrimarySite = isPrimarySite === true ? true : false;

  const Mounter = document.querySelector('#uip-menu-creator-app');

  if (Mounter) App.mount('#uip-menu-creator-app');
};

setupMenuCreator();
