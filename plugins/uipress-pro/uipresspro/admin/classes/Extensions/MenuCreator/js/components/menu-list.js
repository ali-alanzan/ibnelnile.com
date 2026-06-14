const { __, _x, _n, _nx } = wp.i18n;
export default {
  data() {
    return {
      menus: [],
      page: 1,
      totalPages: 0,
      totalFound: 0,
      loading: false,
      initialLoading: true,
      selectAll: false,
      search: '',
      strings: {
        adminMenus: __('Admin menus', 'uipress-pro'),
        newMenu: __('New menu', 'uipress-pro'),
        edit: __('Edit', 'uipress-pro'),
        duplicate: __('Duplicate', 'uipress-pro'),
        delete: __('Delete', 'uipress-pro'),

        status: __('Status', 'uipress-pro'),
        forRoles: __('Roles and users', 'uipress-pro'),
        excludes: __('Excludes', 'uipress-pro'),
        modified: __('Modified', 'uipress-pro'),
        name: __('Name', 'uipress-pro'),
        type: __('Type', 'uipress-pro'),
        active: __('Active', 'uipress-pro'),
        draft: __('Draft', 'uipress-pro'),
        results: __('results', 'uipress-pro'),
        searchMenus: __('Search menus', 'uipress-pro'),
        templateDuplicated: __('Template duplicated', 'uipress-pro'),
        templateDeleted: __('Template deleted', 'uipress-pro'),
        deleteSelected: __('Delete selected', 'uipress-pro'),
        menuCreator: __('Menu Builder', 'uipress-pro'),
        newMenu: __('New menu', 'uipress-pro'),
        welcomeTotheUibuilder: __("It's a little quiet!", 'uipress-pro'),
        welcomeMeta: __('Create a new menu to get started with menu creator', 'uipress-pro'),
        viewDocs: __('View docs', 'uipress-pro'),
        editTemplate: __('Edit', 'uipress-pro'),
        duplicateAdminMenu: __('Duplicate', 'uipress-pro'),
        export: __('Export', 'uipress-pro'),
        importTemplate: __('Import', 'uipress-pro'),
        deleteTemplate: __('Delete', 'uipress-pro'),
        version: __('version', 'uipress-pro'),
        tools: __('Tools', 'uipress-pro'),
        settings: __('Site settings', 'uipress-pro'),
        phpErrorLog: __('PHP error log', 'uipress-pro'),
        roleEditor: __('Role editor', 'uipress-pro'),
        pro: __('pro', 'uipress-pro'),
        uiTemplate: __('Ui Template', 'uipress-pro'),
        adminPage: __('Admin page', 'uipress-pro'),
        loginPage: __('Login page', 'uipress-pro'),
        frontEndToolbar: __('Frontend toolbar', 'uipress-pro'),
        setupWizard: __('Setup wizard', 'uipress-pro'),
        exportSelected: __('Export selected', 'uipress-pro'),
        uploadMenus: __('Import menus', 'uipress-pro'),
      },
      activeSwitchOptions: {
        false: {
          value: false,
          label: __('Draft', 'uipress-lite'),
        },
        true: {
          value: true,
          label: __('Active', 'uipress-lite'),
        },
      },
      activeFilter: 'all',
      tabletabs: [
        {
          name: 'all',
          label: __('All menus', 'uipress-lite'),
        },
        {
          name: true,
          label: __('Active', 'uipress-lite'),
        },
        {
          name: false,
          label: __('Drafts', 'uipress-lite'),
        },
      ],
    };
  },
  async created() {
    await this.getMenuList();
  },
  computed: {
    /**
     * Returns menus with search
     *
     * @since 3.2.0
     */
    returnTableData() {
      const searchterm = this.search.toLowerCase();
      const status = this.activeFilter == 'all' ? [false, true] : [this.activeFilter];
      return this.menus.filter((menu) => menu.name.toLowerCase().includes(searchterm) && status.includes(menu.status));
    },
  },
  methods: {
    /**
     * Fetches main menu list from server
     *
     * @since 3.2.0
     */
    async getMenuList() {
      // Query already running
      if (this.loading) return;

      this.loading = true;

      let formData = new FormData();
      formData.append('action', 'uipress_get_menus');
      formData.append('security', this.AjaxSecurity);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      this.loading = false;
      this.initialLoading = false;

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      this.menus = response.menus;
      this.totalPages = response.totalPages;
      this.totalFound = response.totalFound;
    },

    /**
     * Duplicates given menu
     *
     * @param {string} id - menu id
     * @returns {Promise}
     * @since 3.2.0
     */
    async duplicateAdminMenu(id) {
      let formData = new FormData();
      formData.append('action', 'uip_duplicate_admin_menu');
      formData.append('security', this.AjaxSecurity);
      formData.append('id', id);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }
      this.uipApp.notifications.notify(this.strings.templateDuplicated, '', 'success', true);
      this.getMenuList();
    },
    /**
     * Deletes templates
     *
     * @since 3.0.0
     */
    async deleteAdminMenu(ids) {
      ids = Array.isArray(ids) ? ids : [ids];

      let formData = new FormData();
      formData.append('action', 'uip_delete_admin_menus');
      formData.append('security', this.AjaxSecurity);
      formData.append('menuids', ids);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      this.uipApp.notifications.notify(response.message, '', 'success', true);
      this.getMenuList();
    },

    /**
     * Exports the given template
     *
     * @param {string} id - the menu id
     * @since 3.2.0
     */
    async exportTemplate(id) {
      let formData = new FormData();
      formData.append('action', 'uipress_get_menu');
      formData.append('security', this.AjaxSecurity);
      formData.append('id', id);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      let customMenu = {};
      customMenu.uipmenus = [response.menuOptions];
      this.exportToJson(customMenu);
    },

    /**
     * Exports menu to JSON
     *
     * @param {object} data
     * @since 3.2.0
     */
    exportToJson(data) {
      let layout = JSON.stringify(data);
      let name = 'UiPress menu export';

      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      let yyyy = today.getFullYear();

      let date_today = mm + '-' + dd + '-' + yyyy;
      let filename = name + '-' + date_today + '.json';

      let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(layout);
      let dlAnchorElem = this.$refs.menuexport;
      dlAnchorElem.setAttribute('href', dataStr);
      dlAnchorElem.setAttribute('download', filename);
      dlAnchorElem.click();
      this.uipApp.notifications.notify(__('Menu exported', 'uipress-lite'), '', 'success', true);
    },

    /**
     * Creates new draft ui template
     *
     * @since 3.0.0
     */
    async createNewMenu() {
      const notiID = this.uipApp.notifications.notify(__('Creating new menu', 'uipress-pro'), '', 'default', false, true);
      let formData = new FormData();
      formData.append('action', 'uip_create_new_admin_menu');
      formData.append('security', this.AjaxSecurity);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);
      const newID = response.id;
      await this.getMenuList();

      const newIndex = this.menus.findIndex((menu) => menu.id === newID);
      const newItem = this.menus[newIndex];
      this.editAdminMenu(newItem, newIndex);
      this.uipApp.notifications.remove(notiID);
    },

    /**
     * Returns style for active indicator
     *
     * @param {String} status - the item status
     * @since 3.2.13
     */
    returnActiveIndicatorStyle(status) {
      let style = 'border:1px solid var(--uip-color-green)';
      if (status == 'draft') {
        style = 'border:1px solid var(--uip-color-orange)';
      }
      return style;
    },

    /**
     * Confirms the deletion of admin menu
     *
     * @param {Number} id - id of template to delete
     * @since 3.0.0
     */
    async confirmDelete(id) {
      const confirm = await this.$refs.confirm.show({
        title: __('Delete admin menu', 'uipress-pro'),
        message: __("Deleted menus can't be recovered", 'uipress-pro'),
        okButton: __('Delete', 'uipress-pro'),
      });
      if (!confirm) return;
      this.deleteAdminMenu(id);
    },

    /**
     * Opens and admin menu object
     *
     * @param {object} menu - menu item
     *  @param {number} index - menu item index
     * @since 3.2.0
     */
    editAdminMenu(menu, index) {
      const updateMenu = (updatedMenu) => {
        this.menus[index] = { ...updatedMenu };
        this.menus[index].appliesTo = Array.isArray(updatedMenu.for) ? [...updatedMenu.for] : [];
        this.saveMenu(this.menus[index], true);
      };
      this.$refs.menueditor.show(menu, updateMenu);
    },

    /**
     * Saves menu item
     *
     * @param {object} - the menu item to save
     * @param {boolean} - whether to hide the success message
     * @since 3.2.0
     */
    async saveMenu(menu, showSuccess) {
      const menuString = JSON.stringify(menu, (k, v) => (v === 'true' ? 'uiptrue' : v === true ? 'uiptrue' : v === 'false' ? 'uipfalse' : v === false ? 'uipfalse' : v === '' ? 'uipblank' : v));

      let formData = new FormData();
      formData.append('action', 'uipress_save_menu');
      formData.append('security', this.AjaxSecurity);
      formData.append('menu', menuString);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      // Only show success if requested
      if (showSuccess) {
        this.uipApp.notifications.notify(__('Menu saved', 'uipress-lite'), '', 'success', true);
      }
    },

    /**
     * Returns active style for tab
     *
     * @param {object} item
     * @since 3.2.0
     */
    returnTabStyle(item) {
      if (item.name != this.activeFilter) return;
      return { 'border-bottom': '2px solid var(--uip-color-accent)' };
    },

    /**
     * Handles menu role update from list
     *
     * @param {array} roles
     * @param {object} menu
     * @since 3.2.08
     */
    handleMenuRoleChange(roles, menu) {
      menu.for = [...roles];
      menu.appliesTo = [...roles];
      this.saveMenu(menu, false);
    },

    /**
     * Returns a clone of the templates roles for property
     *
     * @param {Array} data - the array of data to clone
     * @returns {Array}
     * @since 3.2.13
     */
    returnRoleClone(data) {
      if (!data) return [];
      return [...data];
    },
  },
  template: `
	
	
  <div class="uip-flex uip-flex-column uip-h-100p uip-w-100p uip-background-muted" style="min-height:100dvh">
  
    <!-- Toolbar -->
    <div class="uip-padding-s uip-background-default uip-border-bottom uip-border-bottom uip-flex uip-flex-between uip-position-relative">
    
      <!-- Logo -->
      <div class="uip-flex uip-gap-xs uip-flex-center uip-border-rounder uip-background-muted uip-padding-xs uip-padding-top-xxs uip-padding-bottom-xxs">
        <div class="uip-logo uip-w-18 uip-ratio-1-1"></div>
        <div class="uip-text-bold">Menu Builder</div>
      </div>
            
      <!-- Global search -->
      <div class="uip-position-absolute uip-left-50p uip-translateX--50p uip-flex uip-flex-center uip-flex-middle">
        <div class="uip-flex uip-background-muted uip-border-rounder uip-padding-xxs uip-flex-center uip-w-240 ">
          <span class="uip-icon uip-text-muted uip-margin-right-xs">search</span>
          <input class="uip-blank-input uip-flex-grow uip-text-s" type="search" v-model="search" :placeholder="strings.searchMenus" autofocus="">
        </div>
      </div>
      
      <!-- Right actions -->
      <div class="uip-flex uip-gap-xs uip-flex-center">
      
        
        <!-- New template -->
        <div class="uip-button-primary uip-flex uip-flex-row uip-gap-xxs uip-flex-center uip-text-s" @click="createNewMenu()">
          <span>{{strings.newMenu}}</span>
        </div>
      
      </div>
      
    </div>
    <!-- End Toolbar-->
    
    <!-- Body-->
    <div class="uip-flex uip-flex-column uip-flex-center uip-padding-l">
      
      <!-- Inner body -->
      <div class="uip-flex uip-flex-column uip-row-gap-m uip-w-1000 uip-max-w-100p">
      
        <!-- Heading -->
        <div class="uip-flex uip-flex-between uip-flex-center">
          <div class="uip-text-bold uip-text-xl uip-text-emphasis">{{ strings.adminMenus }}</div>
        
        </div>
        
        
        <!-- Filters -->
        <div class="uip-flex uip-gap-s">
          <template v-for="item in tabletabs">
            <a class="uip-padding-bottom-s" @click="activeFilter = item.name" 
            :class="item.name == this.activeFilter ? 'uip-text-bold uip-link-emphasis' : 'uip-link-muted'"
            :style="returnTabStyle(item)">
              {{item.label}}
            </a>
          </template>
        </div>
        
        
        <component is="style">
          tr:hover {
           box-shadow: var(--uip-box-shadow);
          }
          
          tr:hover td:first-child{
            border-radius:8px 0 0 8px;
          }
          tr:hover td:last-child{
            border-radius:0 8px 8px 0;
          }
          .uip-template-table tr:first-child td:first-child {border-radius: 8px 0 0 0;}
          .uip-template-table tr:first-child td:last-child {border-radius: 0 8px 0 0;}
          .uip-template-table tr:last-child td:first-child {border-radius: 0 0 0 8px;}
          .uip-template-table tr:last-child td:last-child {border-radius: 0 0 8px 0;}
          .uip-template-table tr:last-child td {border: none !important;}
        </component>
        
        <!-- Table -->
        <TransitionGroup name="list" tag="table" class="uip-background-transparent uip-template-table" style="border-collapse: collapse;
        border-spacing: 0;">
        
          <template v-for="(template, index) in returnTableData" :key="template.id">
            
          
            <tr class="uip-link-default uip-border-rounder" @click="editAdminMenu(template, index)"
            @contextmenu.prevent.stop="$refs['templatemenu-'+index][0].show($event)">
              <!-- Template Title -->
              <td class="uip-border-bottom uip-padding-s uip-background-default">
                <div class="uip-flex uip-flex-column uip-gap-xxs">
                  
                  <div class="uip-flex uip-gap-xs uip-flex-center">
                  
                    <div class="uip-text-bold">{{ template.name }}</div>
                    
                    <div class="uip-w-9 uip-ratio-1-1 uip-border-circle uip-opacity-70"
                    :class="template.status ? 'uip-background-green' : 'uip-background-orange'" 
                    style="returnActiveIndicatorStyle(template.status)"></div>
                    
                  </div>
                  
                  
                  <div class="uip-text-muted uip-text-s">{{ template.modified }}</div>
                  
                </div>
              </td>
              
              
              <!-- Active state -->
              <td class="uip-border-bottom uip-padding-s uip-max-w-100 uip-background-default">
                
                <switch-select :options="activeSwitchOptions" 
                @click.stop
                :activeValue="template.status" 
                :returnValue="(d)=>{template.status=d; saveMenu(template, false)}"/>
                
              </td>
              
              
              
              <!-- Applies to -->
              <td  @click.stop class="uip-border-bottom uip-padding-s uip-max-w-160 uip-background-default">
              
                <user-role-select :selected="returnRoleClone(template.for)"
                :placeHolder="strings.appliesTo"
                :searchPlaceHolder="strings.searchUsersRoles"
                :updateSelected="(d)=>{handleMenuRoleChange(d, template)}"/>
                
              </td>
              
              
              
              <!-- Dropdown -->
              <td class="uip-border-bottom uip-padding-s uip-text-right uip-background-default">
                
                <a @click.prevent.stop="$refs['templatemenu-'+index][0].show($event)"
                class="uip-link-muted hover:uip-background-muted uip-border-rounder uip-padding-xxs uip-inline-flex uip-flex-centers uip-text-l">
                  <span class="uip-icon">more_vert</span>
                </a>
                
              </td>
              
            </tr>
          
          </template>
        </TransitionGroup>
        <!-- End table -->
        
        <template v-for="(template, index) in returnTableData" :key="template.id">
          <ContextMenu :ref="'templatemenu-'+index">
          
            <div class="uip-padding-xs uip-flex uip-flex-column uip-text-weight-normal uip-text-s">
            
              <a @click="editAdminMenu(template, index);$refs['templatemenu-'+index][0].close()" 
              class="uip-link-muted uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
                <span class="">{{strings.edit}}</span>
                <span class="uip-icon">edit</span>
              </a>
            
              <a class="uip-link-muted uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder"
              @click.prevent="duplicateAdminMenu(template.id);$refs['templatemenu-'+index][0].close()">
                <span class="">{{strings.duplicate}}</span>
                <span class="uip-icon">content_copy</span>
              </a>
              
              <a class="uip-link-muted uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder"
              @click.prevent="exportTemplate(template.id);$refs['templatemenu-'+index][0].close()">
                <span class="">{{strings.export}}</span>
                <span class="uip-icon">file_download</span>
              </a>
              
              <div class="uip-border-top uip-margin-top-xs uip-margin-bottom-xs"></div>
              
              <a class="uip-link-danger uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder"
              @click.prevent="confirmDelete(template.id);$refs['templatemenu-'+index][0].close()">
                <span class="">{{strings.delete}}</span>
                <span class="uip-icon">delete</span>
              </a>
            
            </div>
          
          </ContextMenu>
        </template>
        
      </div>
      <!-- End inner body-->
      
    </div>
    <!-- End body-->
    
    <a class="uip-hidden" ref="menuexport"></a>
    
    <Confirm ref="confirm"/>
    
    <MenuEditor ref="menueditor"/>
  
    <Notify/>
  </div>
  `,
};
