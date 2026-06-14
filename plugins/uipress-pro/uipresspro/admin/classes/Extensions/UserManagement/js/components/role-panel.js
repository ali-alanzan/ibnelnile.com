const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    refreshTable: Function,
    closePanel: Function,
  },
  data() {
    return {
      activeroleName: '',
      toggleState: false,
      currentRole: this.$route.params.role,
      creatingNewRole: false,
      role: {
        editData: [],
      },
      strings: {
        editRole: __('Edit role', 'uipress-lite'),
        details: __('Details', 'uipress-lite'),
        label: __('Label', 'uipress-lite'),
        loginRedirect: __('Login redirect', 'uipress-lite'),
        capabilities: __('Capabilities', 'uipress-lite'),
        toggleAll: __('Toggle all', 'uipress-lite'),
        addCapability: __('Add capability', 'uipress-lite'),
        addCustomCapability: __('Custom capability name', 'uipress-lite'),
        searchCapabilities: __('Search capabilities', 'uipress-lite'),
        updateRole: __('Update role', 'uipress-lite'),
        cancel: __('Cancel', 'uipress-lite'),
        name: __('Name', 'uipress-lite'),
        adminWarning: __(
          'You are currently editing the administrator role. This is usually the most important role on the site so please make sure not to remove nessecary capabilities.',
          'uipress-lite'
        ),
      },
      capSeach: '',
      activeCat: 'all',
      allcaps: this.capabilities,
      customcap: '',
      newCap: {
        name: '',
      },
    };
  },
  mounted() {
    this.getRoleData();
  },
  watch: {
    /**
     * Watch changes to role name and format it
     *
     * @since 3.2.0
     */
    'role.editData.name': {
      handler(newValue, oldValue) {
        if (!newValue) return;
        if (!newValue.length) return;
        this.role.editData.name = this.formatCapName(newValue);
        this.activeroleName = this.role.editData.name;
      },
      deep: true,
    },
    /**
     * Watch changes to cap name and format it
     *
     * @since 3.2.0
     */
    'newCap.name': {
      handler(newValue, oldValue) {
        if (!newValue) return;
        if (!newValue.length) return;
        this.newCap.name = this.formatCapName(newValue);
      },
      deep: true,
    },
  },
  computed: {
    /**
     * Returns formatted title for capabilities with count
     *
     * @since 3.2.0
     */
    returnCapabilityTitle() {
      let title = this.strings.capabilities;
      let totalCaps = this.totalAvailableCaps;
      let totalAssigned = this.totalAssignedCaps;
      return `${title} <span class="uip-text-muted uip-text-weight-normal uip-text-s">(${totalAssigned}/${totalCaps})</span>`;
    },

    /**
     * Returns total amount of capabilities available
     *
     * @since 3.2.0
     */
    totalAvailableCaps() {
      return this.allcaps.all.caps.length;
    },

    /**
     * Returns total amount of capabilities the role has assigned
     *
     * @since 3.2.0
     */
    totalAssignedCaps() {
      const allCaps = this.role.editData.caps;
      let count = 0;
      for (var cat in allCaps) if (allCaps[cat]) count++;
      return count;
    },

    /**
     * Returns the icon for the toggle all caps option
     *
     * @since 3.2.0
     */
    returnToggleCapsIcon() {
      return this.toggleState ? 'select_check_box' : 'indeterminate_check_box';
    },

    /**
     * Returns caps with search for current category
     *
     * @since 3.2.0
     */
    returnSearchedCaps() {
      const caps = this.allcaps[this.activeCat].caps;
      const search = this.capSeach.toLowerCase();
      return caps.filter((cap) => this.maybeLowerCase(cap).includes(search));
    },
  },
  methods: {
    /**
     * Checks a string before return lower caps version
     *
     * @param {string} str - the string to check
     * @since 3.3.01
     */
    maybeLowerCase(str) {
      return str ? str.toLowerCase() : '';
    },
    /**
     * Formats capability name
     *
     * @param {string} ammended
     * @since 3.2.0
     */
    formatCapName(ammended) {
      ammended = ammended.replace(' ', '_');
      ammended = ammended.replace('-', '_');
      return ammended.toLowerCase();
    },

    /**
     * Gets current role data
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async getRoleData() {
      // Checks if role name exists
      if (this.currentRole === 'new') return this.handleRoleCreate();
      this.creatingNewRole = true;

      let formData = new FormData();
      formData.append('action', 'uip_get_singular_role');
      formData.append('security', this.AjaxSecurity);
      formData.append('role', this.currentRole);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error');
        return;
      }
      this.role.editData = response.role;

      if (Array.isArray(this.role.editData.caps)) {
        this.role.editData.caps = {};
      }

      this.activeroleName = this.role.editData.name;
    },

    /**
     * Handles role creating defaults and injects clone if exists
     *
     * @since 3.2.0
     */
    handleRoleCreate() {
      this.creatingNewRole = true;
      this.role.editData = { name: '', label: '', redirect: '', caps: {} };

      if (this.uipApp.cloneRole) {
        this.role.editData.caps = { ...this.uipApp.cloneRole.caps };
        this.role.editData.label = this.uipApp.cloneRole.label + ' ' + __('copy', 'uipress-lite');
        this.uipApp.cloneRole = false;
      }
    },

    /**
     * Saves role
     *
     * @since 3.2.0
     */
    async updateRole() {
      let formData = new FormData();
      formData.append('action', 'uip_update_user_role');
      formData.append('security', this.AjaxSecurity);
      formData.append('role', JSON.stringify(this.role.editData));
      formData.append('originalRoleName', this.activeroleName);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error');
        return;
      }

      this.uipApp.notifications.notify(response.message, '', 'success');
      this.activeroleName = this.role.editData.name;
      this.uipApp.refreshTable();

      // Direct to proper edit page if we just created a new role
      if (this.$route.params.role == 'new') {
        this.$router.push('/roles/edit/' + this.role.editData.name);
      }
    },

    /**
     * Adds new custom capability
     *
     * @since 3.2.0
     */
    async addCustomCap() {
      this.role.editData.caps[this.newCap.name] = true;

      let formData = new FormData();
      formData.append('action', 'uip_add_custom_capability');
      formData.append('security', this.AjaxSecurity);
      formData.append('role', JSON.stringify(this.role.editData));
      formData.append('customcap', this.newCap.name);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error');
        return;
      }

      this.uipApp.notifications.notify(response.message, '', 'success');
      this.newCap.name = '';
      this.allcaps = response.allcaps;
      this.$refs.newCapDrop.close();
      this.uipApp.refreshTable();
    },

    /**
     * Toggles all caps state
     *
     * @since 3.2.0
     */
    toggleAllCaps() {
      this.allcaps.all.caps.map((cap) => (this.role.editData.caps[cap] = this.toggleState));
      this.toggleState = !this.toggleState;
    },

    /**
     * Returns whether the current role has the capability
     *
     * @param {string} cap
     * @returns {boolean}
     * @since 3.2.0
     */
    isInCaps(cap) {
      const currentcaps = this.role.editData.caps;
      if (!this.isObject(currentcaps)) return false;
      if (!(cap in currentcaps)) return false;
      return currentcaps[cap] ? true : false;
    },

    /**
     * Toggles a capability state
     *
     * @param {string} cap
     * @since 3.2.0
     */
    toggleCap(cap) {
      const currentcaps = this.role.editData.caps;
      if (!this.isObject(currentcaps)) this.role.editData.caps = {};
      this.role.editData.caps[cap] = currentcaps[cap] ? false : true;
    },

    /**
     * Deletes a capability from a role
     *
     * @param {string} cap
     * @returns {Promise}
     * @since 3.2.0
     */
    async removeCapability(cap) {
      const confirm = await this.$refs.Confirm.show({
        title: __('Delete capability', 'uipress-pro'),
        message: __('Are you sure you want to delete this capability? This will remove the capability sitewide. Please note not all capabilities can be deleted.', 'uipress-pro'),
        okButton: __('Delete', 'uipress-pro'),
      });

      // Exit now if user did not confirm
      if (!confirm) return;

      let formData = new FormData();
      formData.append('action', 'uip_remove_custom_capability');
      formData.append('security', this.AjaxSecurity);
      formData.append('role', JSON.stringify(this.role.editData));
      formData.append('customcap', cap);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error');
        return;
      }
      this.uipApp.notifications.notify(response.message, '', 'success');
      this.allcaps = response.allcaps;
      this.uipApp.refreshTable();
    },
  },
  template: `
  
      <FloatingPanel ref="rolePanel" :startOpen="true" :closer="()=>$router.push('/')">
      
        <div class="uip-flex uip-flex-grow uip-flex-column uip-max-h-100p uip-row-gap-s uip-padding-m uip-h-100p">
          
          <!--Header-->
          <div class="uip-flex uip-flex-column uip-row-gap-xs" >
            
            <!-- OVERVIEW -->
            <div class="uip-flex uip-flex-center uip-gap-s">
              
              <div class="uip-flex uip-flex-column uip-flex-grow">
                <div class="uip-text-bold uip-text-l uip-text-emphasis">{{strings.editRole}}</div>
                <div class="uip-text-muted uip-max-w-250 uip-overflow-hidden uip-no-wrap uip-text-ellipsis">{{role.editData.label}}</div>
              </div>
              
              <div class="uip-flex uip-text-l uip-self-flex-start">
                
                <a @click="$router.push('/');$refs.rolePanel.close()" class="uip-link-muted hover:uip-background-muted uip-border-rounder uip-icon uip-padding-xxs">close</a>
                
              </div>
            </div>
            
          </div>
          
          <div v-if="role.editData.name == 'administrator'" class="uip-background-orange-wash uip-padding-xs uip-border-rounder">
            {{strings.adminWarning}}
          </div>
          
          <!--Spacer-->
          <div></div>
          
          <!--Role details-->
          <ToggleSection :title="strings.details" :startOpen="true">
          
            <div class="uip-grid-col-1-3">
            
            
              
              <div v-if="creatingNewRole" class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.name}}</span>
              </div>
              <input v-if="creatingNewRole" type="text" class="uip-input uip-w-100p" v-model="role.editData.name">
            
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.label}}</span>
              </div>
              <input type="text" class="uip-input uip-w-100p" v-model="role.editData.label">
              
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.loginRedirect}}</span>
              </div>
              <input placeholder="index.php" 
              type="text" class="uip-input" v-model="role.editData.redirect">
            
            </div>
            
          </ToggleSection>  
          
          
          <!--Spacer-->
          <div class="uip-border-top"></div>
          
          
          <!--Capabilities-->
          <ToggleSection :title="returnCapabilityTitle" :startOpen="true">
          
          
            <div class="uip-grid-col-1-3">
            
              <!--Categories-->
              <div class="uip-flex uip-flex-column uip-row-gap-xs">
              
                <template v-for="cat in allcaps">
                  <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center uip-link-muted uip-text-s" 
                  :class="{'uip-text-bold uip-text-emphasis' : activeCat == cat.shortname}" @click="activeCat = cat.shortname">
                    <div class="">{{cat.name}}</div>
                  </div>
                </template>
                
              </div>
              
              
              <!-- caps -->
              <div class="uip-flex-grow uip-flex uip-flex-column uip-row-gap-xxs">
              
                <div class="uip-flex uip-gap-xxs uip-margin-bottom-xs">
                
                  <div class="uip-background-muted uip-padding-xxs uip-border-rounder uip-flex uip-flex-center uip-gap-xxs uip-flex-grow">
                    <span class="uip-icon">search</span>
                    <input class="uip-blank-input uip-flex-grow uip-text-s" :placeholder="strings.searchCapabilities" v-model="capSeach">
                  </div>
                  
                  <button @click="toggleAllCaps()" :title="strings.toggleAll" class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center uip-border-rounder uip-button-default uip-text-s uip-padding-xs">
                    <span class="uip-icon">{{returnToggleCapsIcon}}</span>
                  </button>
                  
                  <!--New cap-->
                  <dropdown pos="bottom right" ref="newCapDrop">
                    <template #trigger>
                      <button class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center uip-border-rounder uip-button-default uip-text-s uip-padding-xs">
                        <span class="uip-icon">add</span>
                      </button>
                    </template>
                    <template #content>
                        <div class="uip-flex uip-flex-column uip-row-gap-s uip-padding-s">
                          
                          <input :placeholder="strings.addCustomCapability" class="uip-input-small uip-w-100p" type="text" v-model="newCap.name">
                                                      
                          <button class="uip-button-primary uip-border-rounder uip-text-s" @click="addCustomCap()">{{strings.addCapability}}</button>
                        </div>
                    </template>
                    
                   
                    
                  </dropdown>
                
                </div>
                
                <div class="uip-flex uip-flex-column uip-row-gap-xxs uip-max-h-300 uip-overflow-auto">
                  <template v-for="cap in returnSearchedCaps">
                  
                    <div class="uip-flex uip-flex-center uip-gap-s uip-background-muted uip-border-rounder uip-cursor-pointer uip-padding-xxs">
                      <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-border-round uip-cursor-pointer uip-flex-grow" @click="toggleCap(cap)">
                        <div v-if="isInCaps(cap)" class="uip-icon uip-text-accent">radio_button_checked</div>
                        <div v-if="!isInCaps(cap)" class="uip-icon" >radio_button_unchecked</div>
                        <div class="uip-flex-grow uip-text-s uip-overflow-hidden uip-text-ellipsis uip-no-wrap">{{cap}}</div>
                      </div>
                      <div class="uip-icon uip-link-muted" @click="removeCapability(cap)">close</div>
                    </div>
                    
                  </template>
                </div>
                
              </div>
              
            </div>  
          
          </ToggleSection>
          
          
          
          <!--Spacer-->
          <div class="uip-border-top"></div>
          
          
          <div class="uip-flex-grow uip-flex uip-flex-column" style="justify-content: end;">
            <div class="uip-flex uip-flex-between uip-gap-s">
              <router-link :to="'/'" class="uip-button-default uip-no-underline uip-flex-grow uip-text-center">{{strings.cancel}}</router-link>
              <button class="uip-button-primary uip-flex-grow" @click="updateRole()">{{strings.updateRole}}</button>
            </div>
          </div>
          
        </div>    
        
        
        
        
        <Confirm ref="Confirm"/>
      
      </FloatingPanel>
      
      
      `,
};
