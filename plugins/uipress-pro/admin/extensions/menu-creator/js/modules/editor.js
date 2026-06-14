const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    data: function () {
      return {
        loading: true,
        id: this.$route.params.id,
        saving: false,
        activeTab: 'content',
        switchOptions: {
          content: {
            value: 'content',
            label: __('Menu items', 'uipress-lite'),
          },
          settings: {
            value: 'settings',
            label: __('Settings', 'uipress-lite'),
          },
        },
        strings: {
          active: __('Active', 'uipress-pro'),
          name: __('Name', 'uipress-pro'),
          autoUpdate: __('Auto update', 'uipress-pro'),
          autoUpdateDesc: __('Enabling this option will allow the menu to update automatically as you add or remove plugins', 'uipress-pro'),
          applyToSubsite: __('Apply to subsites', 'uipress-pro'),
          appliesTo: __('Applies to', 'uipress-pro'),
          excludes: __('Excludes', 'uipress-pro'),
          selectUsersAndRoles: __('Select users and roles', 'uipress-pro'),
          searchUsersAndRoles: __('Search users and roles', 'uipress-pro'),
          saveMenu: __('Save menu', 'uipress-pro'),
          cancel: __('Cancel', 'uipress-pro'),
          menuName: __('Menu name', 'uipress-pro'),
          menuSaved: __('Menu saved', 'uipress-pro'),
          appliesDescription: __('Who you want the menu to load for', 'uipress-pro'),
          excludesDescription: __('Who you would like the menu to not load for (optional)', 'uipress-pro'),
        },
        customMenu: {
          menu: [],
          status: false,
          appliesTo: [],
          excludes: [],
          name: '',
          autoUpdate: false,
          multisite: false,
        },
        enabledDisabled: {
          false: {
            value: false,
            label: __('Disabled', 'uipress-lite'),
          },
          true: {
            value: true,
            label: __('Enabled', 'uipress-lite'),
          },
        },
      };
    },
    inject: ['router', 'uipress', 'refreshList'],
    mounted: function () {
      this.getMenu();
    },
    watch: {},
    computed: {},
    methods: {
      closeOffcanvas() {
        let self = this;
        self.router.push('/');
      },
      getMenu() {
        let self = this;
        self.loading = true;
        let formData = new FormData();
        formData.append('action', 'uipress_get_menu');
        formData.append('security', uip_ajax.security);
        formData.append('id', self.id);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(response.message, '', 'error', true);
            self.loading = false;
            return;
          }
          //self.customMenu = response.data;
          self.customMenu = { ...self.customMenu, ...response.menuOptions };
          self.loading = false;
        });
      },
      saveMenu() {
        let self = this;
        self.saving = true;

        let menu = JSON.stringify(self.customMenu, (k, v) => (v === 'true' ? 'uiptrue' : v === true ? 'uiptrue' : v === 'false' ? 'uipfalse' : v === false ? 'uipfalse' : v === '' ? 'uipblank' : v));

        let formData = new FormData();
        formData.append('action', 'uipress_save_menu');
        formData.append('security', uip_ajax.security);
        formData.append('menu', menu);
        formData.append('id', self.id);

        self.uipress.callServer(uip_ajax.ajax_url, formData).then((response) => {
          if (response.error) {
            self.uipress.notify(response.message, '', 'error', true);
            return;
          }
          self.uipress.notify(self.strings.menuSaved, '', 'success', true);
          self.saving = false;

          self.refreshList();
        });
      },
    },

    template: `
      <component is="style"> #wpadminbar{z-index:8;}#adminmenuwrap{z-index:7;} </component>

      <div
        ref="offCanvasCover"
        class="uip-position-fixed uip-w-100p uip-top-0 uip-bottom-0 uip-text-normal uip-flex uip-fade-in uip-transition-all"
        style="background:rgba(0,0,0,0.3);z-index:9;top:0;left:0;right:0;max-height:100%;backdrop-filter: blur(2px);"
      >
        <!-- MODAL GRID -->
        <div class="uip-flex uip-w-100p uip-h-100p">
          <div class="uip-flex-grow" @click="closeOffcanvas()"></div>

          <div ref="offCanvasBody" class="uip-w-500 uip-border-box uip-offcanvas-panel uip-position-relative uip-padding-s uip-padding-right-remove uip-margin-right-s" style="max-height: 100%;min-height: 100%;height:100%">
		  
            <div class="uip-flex uip-slide-in-right uip-background-default uip-border-rounder uip-position-relative uip-shadow uip-border uip-border-box uip-overflow-auto" style="max-height: 100%;min-height: 100%;height:100%">
            
              <div class="uip-position-absolute uip-top-0 uip-padding-m uip-padding-top-s uip-padding-bottom-s uip-right-0 uip-z-index-1">
                <span @click="closeOffcanvas()" class="uip-icon uip-padding-xxs uip-border-round hover:uip-background-grey uip-cursor-pointer uip-link-muted uip-text-l"> close </span>
              </div>

              <div class="uip-position-relative uip-h-100p uip-flex uip-w-100p uip-flex uip-max-h-100p uip-flex uip-flex-column uip-h-100p uip-max-h-100p">
                
                
                <div class="uip-border-box uip-w-100p uip-padding-m uip-padding-top-s uip-padding-bottom-s uip-flex uip-flex-column uip-row-gap-m">
                  <div class="uip-text-l uip-text-bold">{{customMenu.name}}</div>
                </div>
                
                
                <div class="uip-border-box uip-w-100p uip-padding-m uip-padding-top-s uip-padding-bottom-remove uip-flex uip-flex-column uip-row-gap-m">
                
                  <toggle-switch :options="switchOptions" :activeValue="activeTab" :dontAccentActive="true" :returnValue="function(data){ activeTab = data}"></toggle-switch>
                
                </div>

                <div v-if="loading" class="uip-w-100p uip-flex uip-flex-center uip-flex-middle uip-padding-l uip-border-box uip-w-100p">
                  <loading-chart></loading-chart>
                </div>

                <template v-else>
                
                  <div v-if="activeTab == 'content'" class="uip-padding-m uip-flex-grow uip-overflow-auto uip-flex-grow uip-overflow-auto">
                    <menu-editor :value="customMenu.menu" :returnData="function(d){customMenu.menu = d}"></menu-editor>
                  </div>

                  <div v-if="activeTab == 'settings'" class="uip-padding-m uip-flex uip-flex-column uip-row-gap-m uip-flex-grow uip-overflow-auto">
                    <div class="uip-grid-col-2 uip-grid-gap-m">
                    
                      <div class="uip-text-bold uip-margin-bottom-xs">{{strings.name}}</div>
                      <input type="text" class="uip-input" v-model="customMenu.name" :placeholder="strings.menuName" />
                    

                      <div class="uip-text-bold uip-margin-bottom-xs">{{strings.active}}</div>
                      <toggle-switch :options="enabledDisabled" :activeValue="customMenu.status" :returnValue="function(data){ customMenu.status = data;}"></toggle-switch>
                      
                      
                      <template v-if="uipress.uipOptions.primarySite">
                      <div class="uip-text-bold uip-margin-bottom-xs">{{strings.applyToSubsite}}</div>
                      <toggle-switch :options="enabledDisabled" :activeValue="customMenu.multisite" :returnValue="function(data){ customMenu.multisite = data;}"></toggle-switch>
                      </template>
                   

                      <div>
                        <div class="uip-text-bold uip-margin-bottom-xs">{{strings.autoUpdate}}</div>
                        <div class="uip-text-s uip-text-muted uip-margin-bottom-xs">{{strings.autoUpdateDesc}}</div>
                      </div>
                      
                      <toggle-switch :options="enabledDisabled" :activeValue="customMenu.autoUpdate" :returnValue="function(data){ customMenu.autoUpdate = data;}"></toggle-switch>
                      
                    </div>

                    <div class="uip-grid-col-2 uip-grid-gap-m">
					
					           <div>
                        <div class="uip-text-bold uip-margin-bottom-xs">{{strings.appliesTo}}</div>
					  	          <div class="uip-text-s uip-text-muted uip-margin-bottom-xs">{{strings.appliesDescription}}</div>
					            </div>

                      <user-role-select
                        :selected="customMenu.appliesTo"
                        :placeHolder="strings.selectUsersAndRoles"
                        :searchPlaceHolder="strings.searchUsersAndRoles"
                        :single="false"
                        :updateSelected="function(data){fetchReturnData(data, customMenu.appliesTo)}"/>
                        
                    </div>

                    <div class="uip-grid-col-2 uip-grid-gap-m">
                    
					           <div>
                        <div class="uip-text-bold uip-margin-bottom-xs">{{strings.excludes}}</div>
					              <div class="uip-text-s uip-text-muted uip-margin-bottom-xs">{{strings.excludesDescription}}</div>
					            </div>

                      <user-role-select
                        :selected="customMenu.excludes"
                        :placeHolder="strings.excludes"
                        :searchPlaceHolder="strings.excludes"
                        :single="false"
                        :updateSelected="function(data){fetchReturnData(data, customMenu.excludes)}"
                      ></user-role-select>
                    </div>
                  </div>

                  <div class="uip-border-box uip-w-100p uip-padding-m uip-padding-top-s uip-padding-bottom-s uip-flex uip-flex-row uip-flex-between uip-row-gap-s uip-border-top">
                    <button class="uip-button-default" @click="closeOffcanvas()">{{strings.cancel}}</button>
                    <button class="uip-button-primary" @click="saveMenu">{{strings.saveMenu}}</button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  };
  return compData;
}
