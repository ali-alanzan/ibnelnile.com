const { __, _x, _n, _nx } = wp.i18n;

export default {
  props: {
    returnData: Function,
    value: Object,
  },
  data() {
    return {
      adminMenu: null,
      strings: {
        saveMenu: __('Save menu', 'uipress-lite'),
        importMenu: __('Import menu', 'uipress-lite'),
      },
    };
  },
  computed: {
    /**
     * Checks if the menu has a menu array
     *
     * @returns {boolean}
     * @since 3.2.0
     */
    hasAdminMenu() {
      if (!this.adminMenu || !this.isObject(this.adminMenu)) return false;
      if (!('menu' in this.adminMenu)) return false;
      if (!('menu' in this.adminMenu.menu)) return false;
      return true;
    },

    /**
     * Returns the main editor screen
     *
     * @since 3.2.0
     */
    returnMenuEditorScreen() {
      return {
        component: 'CustomMenuBuilder',
        adminMenu: this.adminMenu.menu.menu,
        submenu: this.adminMenu.menu.submenu,
        label: this.adminMenu.name,
        menuObject: this.adminMenu,
        resetMenuToDefault: this.resetMenuToDefault,
      };
    },
  },
  methods: {
    /**
     * Main method for open menu editor
     *
     * @param {object} menu
     *  @param {function} savefunction - the function to return menu
     * @since 3.2.0
     */
    async show(menu, savefunction) {
      //let processed = decodeURIComponent(JSON.parse(JSON.stringify(menu)));
      this.adminMenu = { ...menu };

      this.maybeInjectDefaults();

      await this.$nextTick();
      this.saveMenu = savefunction;
      this.$refs.panel.show();
    },

    /**
     * Injects menus into new menus
     *
     * @since 3.2.0
     */
    maybeInjectDefaults() {
      if (!('menu' in this.adminMenu)) {
        this.adminMenu.menu = {
          menu: [...this.uipGlobalMenu.menu],
          submenu: { ...this.uipGlobalMenu.submenu },
        };
      }
    },

    /**
     * Returns menu back to list for saving
     *
     * @since 3.2.0
     */
    returnMenu() {
      this.saveMenu(this.adminMenu);
    },

    /**
     * Resets the menu to it's default state
     *
     * @since 3.2.0
     */
    resetMenuToDefault() {
      this.adminMenu.menu.menu = [...[], ...this.uipGlobalMenu.menu];
      this.adminMenu.menu.submenu = { ...{}, ...this.uipGlobalMenu.submenu };
    },

    /**
     * Imports menus from json file
     *
     * @param {object} evt - file change event
     * @since 3.2.0
     */
    importMenu(evt) {
      const thefile = evt.currentTarget.files[0];
      if (!thefile) return;

      const notiID = this.uipApp.notifications.notify(__('Importing menu', 'uipress-pro'), '', 'default', false, true);

      const ErrorUpload = (msg) => {
        this.uipApp.notifications.notify(msg, '', 'error', true, false);
        this.uipApp.notifications.remove(notiID);
      };

      if (thefile.type != 'application/json') {
        return ErrorUpload(__('Import file must be in valid JSON format', 'uipresss-pro'));
      }
      if (thefile.size > 1000000) {
        return ErrorUpload(__('Uploaded file is too big', 'uipresss-pro'));
      }

      // Read file handler
      const handleFileRead = async (evt) => {
        const json_settings = evt.target.result;
        let parsed;

        // Try to parse json
        try {
          parsed = JSON.parse(json_settings);
        } catch (error) {
          return ErrorUpload(error);
        }

        if (!parsed) {
          return ErrorUpload(__('JSON parsing failed', 'uipress-pro'));
        }

        if (!('uipmenus' in parsed)) {
          return ErrorUpload(__('Template is not valid', 'uipress-pro'));
        }

        if (!Array.isArray(parsed.uipmenus)) {
          return ErrorUpload(__('Template is not valid', 'uipress-pro'));
        }

        const firstMenu = parsed.uipmenus[0];
        if (!firstMenu) return;

        const currentID = this.adminMenu.id;
        this.adminMenu = { ...firstMenu };
        this.adminMenu.id = currentID;
        this.uipApp.notifications.remove(notiID);
        this.uipApp.notifications.notify(__('Menu imported', 'uipress-pro'), '', 'success', true, false);
      };

      // Read file
      const reader = new FileReader();
      reader.onload = handleFileRead;
      reader.readAsText(thefile, 'UTF-8');

      this.uipApp.notifications.remove(notiID);
    },
  },
  template: `
  
  <FloatingPanel ref="panel">
  
    <div class="uip-flex uip-flex-column uip-row-gap-m uip-padding-m uip-h-100p" id="uip-block-settings" style="overflow:hidden;max-height:100%">
      
      <ScreenControl :closer="$refs.panel.close" :startScreen="returnMenuEditorScreen" :homeScreen="returnMenuEditorScreen.component" :showNavigation="true"
      class="uip-flex-grow" style="overflow:auto"
      :largeNavigation="true">
       
        <template #componenthandler="{ processScreen, currentScreen, goBack }">
            <KeepAlive>
              <component @request-screen="(d)=>{processScreen(d)}" @go-back="goBack()"
              v-bind="currentScreen"
              :is="currentScreen.component"/>
            </KeepAlive>
        </template>
        
      </ScreenControl>
        
        
      <div class="uip-flex uip-flex-between uip-gap-s">  
      
        <label class="uip-button-default uip-flex-grow uip-text-center">
          <input class="uip-hidden" type="file" @change="importMenu" accept=".json">
          {{strings.importMenu}}
        </label>
        
        <button @click="returnMenu" class="uip-button-primary uip-flex-grow">
          {{strings.saveMenu}}
        </button>
      
      </div>
      
    </div>
    
  </FloatingPanel>
  `,
};
