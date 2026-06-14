const { __, _x, _n, _nx } = wp.i18n;

export default {
  data() {
    return {
      loading: true,
      modData: this.data,
      tableData: [],
      tablePage: 1,
      selectAll: false,
      queryRunning: false,
      roles: [],
      strings: {
        search: __('Search', 'uipress-lite'),
        actions: __('Actions', 'uipress-lite'),
        roleName: __('Role name', 'uipress-lite'),
        roleLabel: __('Role label', 'uipress-lite'),
        users: __('Users', 'uipress-lite'),
        permissionsGranted: __('Permissions granted', 'uipress-lite'),
        others: __('others', 'uipress-lite'),
        noUsersWithRole: __('No users with this role', 'uipress-lite'),
        clone: __('Clone', 'uipress-lite'),
        delete: __('Delete', 'uipress-lite'),
        edit: __('Edit', 'uipress-lite'),
        clearSelection: __('Clear selection', 'uipress-lite'),
      },
      search: '',
      tableOptions: {
        direction: 'ASC',
        sortBy: 'username',
        perPage: 20,
      },
      ui: {
        rolePanelOpen: false,
        activeRole: [],
        newRoleOpen: false,
        cloneRole: {},
      },
    };
  },
  mounted() {
    this.getRoleData();
    this.uipApp.refreshTable = this.getRoleData;
  },
  watch: {
    modData: {
      handler(newValue, oldValue) {
        this.dataChange(newValue);
      },
      deep: true,
    },
    tableFilters: {
      handler(newValue, oldValue) {
        this.getRoleData();
      },
      deep: true,
    },
    tableOptions: {
      handler(newValue, oldValue) {
        this.getRoleData();
      },
      deep: true,
    },
    /**
     * Selects or deselects all items in list
     *
     * @since 3.2.0
     */
    selectAll: {
      handler(newValue, oldValue) {
        if (newValue) return this.selectAllRoles();
        this.deSelectAllRoles();
      },
    },
  },
  computed: {
    /**
     * Returns total selected roles length
     *
     * @since 3.2.0
     */
    getTotalSelectedRoles() {
      const selected = this.roles.filter((role) => role.selected === true);
      return selected.length;
    },

    /**
     * Returns total selected roles length
     *
     * @since 3.2.0
     */
    returnSelectedRoleNames() {
      const selected = this.roles.map((role) => {
        if (role.selected) return role.name;
      });
      return selected;
    },

    /**
     * Return searched user roles
     *
     * @since 3.2.0
     */
    returnSearchedRoles() {
      const search = this.search.toLowerCase();
      return this.roles.filter((role) => role.name.toLowerCase().includes(search));
    },
  },
  methods: {
    /**
     * Selects all users in the table
     *
     * @since 3.2.0
     */
    selectAllRoles() {
      this.roles.map((role) => (role.selected = true));
      this.selectAll = true;
    },

    /**
     * Deselects all users in the table
     *
     * @since 3.2.0
     */
    deSelectAllRoles() {
      this.roles.map((role) => (role.selected = false));
      this.selectAll = false;
    },

    /**
     * Returns all roles
     *
     * @since 3.2.0
     */
    async getRoleData() {
      if (this.queryRunning) return;

      this.queryRunning = true;

      let formData = new FormData();
      formData.append('action', 'uip_get_role_table_data');
      formData.append('security', this.AjaxSecurity);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);
      this.queryRunning = false;

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error');
        return;
      }

      this.roles = response.roles;
    },

    /**
     * Deletes a role
     *
     * @param {array} rolenames
     * @returns {Promise}
     * @since 3.2.0
     */
    async deleteRoles(rolenames) {
      const confirm = await this.$refs.Confirm.show({
        title: __('Delete roles', 'uipress-pro'),
        message: __('Are you sure you want to delete these roles? This will remove the role sitewide', 'uipress-pro'),
        okButton: __('Delete', 'uipress-pro'),
      });

      // user rejected
      if (!confirm) return;

      // Ensure IDS are an array
      const allNAMES = Array.isArray(rolenames) ? rolenames : [rolenames];

      let formData = new FormData();
      formData.append('action', 'uip_delete_roles');
      formData.append('security', this.AjaxSecurity);
      formData.append('roles', JSON.stringify(allNAMES));

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error');
        return;
      }

      this.uipApp.notifications.notify(response.message, '', 'success');
      this.getRoleData();
    },

    /**
     * Clones a role and opens dialog to create new
     *
     * @param {object} role
     * @since 3.2.0
     */
    cloneRole(role) {
      this.uipApp.cloneRole = { ...role };
      this.$router.push('/roles/edit/new');
    },
  },
  template: `
  
  
  
  
  <div class="uip-text-normal uip-flex uip-flex-column uip-row-gap-s">
  
    <!--Filters-->
    
    <div class="uip-flex uip-gap-xs uip-flex-center uip-flex-between">
    
      <!--Search-->
      <div class="uip-background-muted uip-padding-xs uip-padding-top-xxs uip-padding-bottom-xxs uip-border-rounder uip-flex uip-flex-center uip-gap-xs">
        <span class="uip-icon uip-text-muted">search</span>
        <input class="uip-blank-input uip-flex-grow uip-text-s" :placeholder="strings.search" v-model="search">
      </div>
      
      <!--Batch actions-->
      <dropdown pos="bottom right" ref="bulkActions">
        
        <template #trigger>
        
          <button :disabled="!getTotalSelectedRoles" class="uip-button-default uip-text-s">{{strings.actions}} ({{getTotalSelectedRoles}})</button>
        
        </template>
        
        <template #content>
        
          <div class="uip-padding-xs uip-flex uip-flex-column uip-text-weight-normal uip-text-s">
          
            <a @click="deSelectAllRoles();$refs.bulkActions.close()" 
            class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
              <span class="">{{strings.clearSelection}}</span>
              <span class="uip-icon">backspace</span>
            </a>
            
            
            <div class="uip-border-top uip-margin-top-xs uip-margin-bottom-xs"></div>
            
            <a class="uip-link-danger uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder"
            @click.prevent="deleteRoles(returnSelectedRoleNames);$refs.bulkActions.close()">
              <span class="">{{strings.delete}}</span>
              <span class="uip-icon">delete</span>
            </a>
          
          </div>
        
        </template>
      
      </dropdown>
        
        
    
    </div>
    
    <table class="uip-background-transparent uip-template-table" style="border-collapse: collapse;
    border-spacing: 0;"> 
    
      <thead>
      
        <tr>
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-left"><input type="checkbox" class="uip-checkbox" v-model="selectAll"></th>
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.roleLabel}}</th>
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.permissionsGranted}}</th>
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.roleName}}</th>
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.users}}</th>
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top"></th>
        </tr>  
      
      
      </thead>
    
      <TransitionGroup name="list" tag="tbody">
      
        <tr v-for="(role, index) in returnSearchedRoles" :key="role.name" @contextmenu.prevent.stop="$refs['roleMenu-'+index][0].show($event)">
        
          <!--Selector-->
          <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-text-left">
            <input class="uip-checkbox" :data-id="role.name" type="checkbox" v-model="role.selected">
          </td>
          
          <!--Label-->
          <td @click="$router.push('/roles/edit/' + role.name)"
          class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-text-left uip-text-bold uip-text-emphasis uip-link-emphasis">
            {{role.label}}
          </td>
          
          <!--Granted-->
          <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-text-left">
            <span class="uip-background-primary-wash uip-border-round uip-padding-left-xxs uip-padding-right-xxs">{{role.granted}}</span>
          </td>
          
          <!--Name-->
          <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-text-left">
            {{role.name}}
          </td>
          
          <!--Users-->
          <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-text-left">
            <div class="uip-flex uip-gap-xxs uip-flex-center">
                                
                                
              <div v-if="role.users.length > 0" class="uip-flex uip-flex-reverse uip-margin-left-xxs">
                <template v-for="(user,index) in role.users">
                
                  <div class="uip-w-20 uip-ratio-1-1 uip-text-s uip-background-primary-wash uip-border-circle uip-border-match uip-text-capitalize 
                  uip-text-center uip-line-height-1 uip-text-center uip-flex uip-flex-center uip-flex-middle uip-margin-left--8" :title="user">
                    {{user[0]}}
                  </div>
                  
                </template>
              </div>
              
              <div v-if="role.usersCount > role.users.length" class="uip-text-muted uip-text-s">+{{role.usersCount - role.users.length}} {{strings.others}}</div>
              
              <div v-else-if="role.users.length == 0" class="uip-text-muted uip-text-s">{{strings.noUsersWithRole}}</div>
              
              
            </div>
          </td>
          
          
          <!--Actions-->
          <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-text-right">
            <div class="uip-inline-flex" @click.prevent.stop="$refs['roleMenu-'+index][0].show($event)">
              <a class="uip-link-default hover:uip-background-muted uip-border-rounder uip-icon uip-padding-xxs">more_vert</a>
            </div>
          </td>
        
        </tr>
        
      </TransitionGroup>
      
    </table>  
    
  </div>  
  
  
  <Confirm ref="Confirm"/>
  
  
  <template v-for="(role, index) in returnSearchedRoles">
    <ContextMenu :ref="'roleMenu-'+index">
    
      <div class="uip-padding-xs uip-flex uip-flex-column uip-text-weight-normal uip-text-s">
            
        <router-link :to="'/roles/edit/' + role.name" @click="$refs['roleMenu-'+index][0].close()" 
        class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
          <span class="">{{strings.edit}}</span>
          <span class="uip-icon">edit</span>
        </router-link>
        
        <a @click="cloneRole(role);$refs['roleMenu-'+index][0].close()" 
        class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
          <span class="">{{strings.clone}}</span>
          <span class="uip-icon">content_copy</span>
        </a>
        
        <div class="uip-border-top uip-margin-top-xs uip-margin-bottom-xs"></div>
        
        <a class="uip-link-danger uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder"
        @click.prevent="deleteRoles(role.name);$refs['roleMenu-'+index][0].close()">
          <span class="">{{strings.delete}}</span>
          <span class="uip-icon">delete</span>
        </a>
      
      </div>
    
    </ContextMenu>
  </template>
      `,
};
