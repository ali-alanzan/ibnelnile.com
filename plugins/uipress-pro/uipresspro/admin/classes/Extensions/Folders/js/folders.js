const { __, _x, _n, _nx } = wp.i18n;
const pluginVersion = import.meta.url.split('?ver=')[1];

/**
 * Set up script data
 *
 * @since 3.2.0
 */
const AppDataHolder = document.querySelector('#uip-folder-app-data');
const uipressLitePath = AppDataHolder ? AppDataHolder.getAttribute('uipress-lite') : false;
const postType = AppDataHolder ? AppDataHolder.getAttribute('postType') : false;
const limitToAuthorVal = AppDataHolder ? AppDataHolder.getAttribute('limitToAuthor') : false;
const limitToType = AppDataHolder ? AppDataHolder.getAttribute('limitToType') : false;
const userPreferences = AppDataHolder ? AppDataHolder.getAttribute('preferences') : '{}';
const AjaxUrl = AppDataHolder ? AppDataHolder.getAttribute('ajax_url') : false;
const AjaxSecurity = AppDataHolder ? AppDataHolder.getAttribute('security') : false;
if (AppDataHolder) AppDataHolder.remove();

/**
 * App args
 *
 * @since 3.2.0
 */
const AppArgs = {
  data() {
    return {
      foldersOpen: true,
      rendered: false,
      strings: {
        folders: __('Folders', 'uipress-lite'),
      },
    };
  },
  watch: {
    foldersOpen() {
      if (!this.rendered) return;
      this.saveUserPreference('foldersOpen', this.foldersOpen);
    },
  },
  computed: {
    returnFolderScreen() {
      return {
        component: 'FolderApp',
        label: this.strings.folders,
      };
    },
  },
  methods: {
    /**
     * Saves user pref
     *
     * @param {string} key
     * @param {mixed} value
     * @returns {Promise}
     * @since 3.2.3
     */
    async saveUserPreference(key, value) {
      let formData = new FormData();

      // Format value
      value = value == true ? 'uiptrue' : value;
      value = value == false ? 'uipfalse' : value;
      value = this.prepareJSON(value);

      formData.append('action', 'uip_save_user_preference');
      formData.append('security', this.AjaxSecurity);
      formData.append('key', key);
      formData.append('value', value);

      this.sendServerRequest(this.AjaxUrl, formData);
    },
  },
  async mounted() {
    if (this.isObject(this.userPreferences)) {
      if ('foldersOpen' in this.userPreferences) {
        this.foldersOpen = this.userPreferences.foldersOpen;
      }
    }

    await this.$nextTick();
    this.rendered = true;
  },
  template: `
  <component v-if="foldersOpen" is="style">
    .wrap:not(#wp-media-grid){padding-left:266px !important;}
  </component>
  <component v-else is="style">
    .wrap:not(#wp-media-grid){padding-left:60px !important;}
  </component>
  
  <div v-if="!foldersOpen"  class="uip-padding-xs">
    <div class="uip-icon uip-link-muted uip-padding-xxs uip-border-rounder hover:uip-background-muted" @click="foldersOpen = true">folder</div>
  </div>
  
  
  <ScreenControl v-if="foldersOpen" :startScreen="returnFolderScreen" :homeScreen="returnFolderScreen.component" class="uip-w-260 uip-padding-s uip-position-sticky uip-top-0 uip-folders-inner"
  :closer="()=>foldersOpen = false" :showNavigation="true">
   
    <template #componenthandler="{ processScreen, currentScreen, goBack }">
        <KeepAlive>
          <component @request-screen="(d)=>{processScreen(d)}" @go-back="goBack()"
          v-bind="currentScreen"
          :is="currentScreen.component"/>
        </KeepAlive>
    </template>
    
  </ScreenControl>

  <Notify/>
  `,
};

const setupFolders = async () => {
  // Use uipress lites instance of vue
  const { createApp, getCurrentInstance, defineComponent, defineAsyncComponent, ref, reactive } = await import(`${uipressLitePath}assets/js/libs/vue-esm.js`);
  const { VueDraggableNext } = await import(`${uipressLitePath}assets/js/libs/VueDraggableNext.js`);
  const { sendServerRequest, isObject, createUID, hasNestedPath, uipParseJson, prepareJSON } = await import(`${uipressLitePath}assets/js/uip/v3.5/utility/functions.min.js`);
  /**
   * Import core components
   *
   * @since 3.2.0
   */
  const ContentFolder = defineAsyncComponent(() => import(`./components/content-folder.min.js?ver=${pluginVersion}`));
  const NewFolder = defineAsyncComponent(() => import(`./components/new-folder.min.js?ver=${pluginVersion}`));
  const FolderApp = defineAsyncComponent(() => import(`./components/folder-app.min.js?ver=${pluginVersion}`));
  const Loader = defineAsyncComponent(() => import(`./components/loader.min.js?ver=${pluginVersion}`));
  const UpdateFolder = defineAsyncComponent(() => import(`./components/update-folder.min.js?ver=${pluginVersion}`));
  const DropDown = defineAsyncComponent(() => import(`${uipressLitePath}assets/js/uip/components/dropdown.min.js?ver=${pluginVersion}`));
  const ColourPicker = defineAsyncComponent(() => import(`${uipressLitePath}assets/js/uip/options/color-select.min.js?ver=${pluginVersion}`));
  const Notify = defineAsyncComponent(() => import(`${uipressLitePath}assets/js/uip/v3.5/utility/notify.min.js?ver=${pluginVersion}`));
  const ScreenControl = defineAsyncComponent(() => import(`${uipressLitePath}assets/js/uip/v3.5/utility/screen-control.min.js?ver=${pluginVersion}`));
  const ContextMenu = defineAsyncComponent(() => import(`${uipressLitePath}assets/js/uip/v3.5/utility/contextmenu.min.js?ver=${pluginVersion}`));

  // Create app
  const App = createApp(AppArgs);

  App.component('content-folder', ContentFolder);
  App.component('NewFolder', NewFolder);
  App.component('loading-chart', Loader);
  App.component('dropdown', DropDown);
  App.component('color-picker', ColourPicker);
  App.component('FolderApp', FolderApp);
  App.component('Notify', Notify);
  App.component('ScreenControl', ScreenControl);
  App.component('uipDraggable', VueDraggableNext);
  App.component('ContextMenu', ContextMenu);
  App.component('UpdateFolder', UpdateFolder);

  App.config.globalProperties.postType = postType;
  App.config.globalProperties.limitToAuthor = limitToAuthorVal;
  App.config.globalProperties.limitToType = limitToType;
  App.config.globalProperties.AjaxUrl = AjaxUrl;
  App.config.globalProperties.AjaxSecurity = AjaxSecurity;
  App.config.globalProperties.sendServerRequest = sendServerRequest;
  App.config.globalProperties.uipApp = reactive({});
  App.config.globalProperties.isObject = isObject;
  App.config.globalProperties.createUID = createUID;
  App.config.globalProperties.hasNestedPath = hasNestedPath;
  App.config.globalProperties.activeFolder = reactive({ id: 'all' });
  App.config.globalProperties.folderMove = reactive({ handler: () => {}, showRemoveFromFolder: false });
  App.config.globalProperties.userPreferences = uipParseJson(userPreferences);
  App.config.globalProperties.prepareJSON = prepareJSON;

  const Mounter = document.querySelector('#uip-folder-app');

  if (Mounter) App.mount('#uip-folder-app');
};

setupFolders();
