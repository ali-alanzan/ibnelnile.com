const { __, _x, _n, _nx } = wp.i18n;
export default {
  data() {
    return {
      loading: true,
      tableData: [],
      tablePage: 1,
      selectAll: false,
      queryRunning: false,
      users: [],
      query: {
        totalPages: 0,
        totalUsers: 0,
      },
      strings: {
        user: __('User', 'uipress-pro'),
        name: __('Name', 'uipress-pro'),
        role: __('Role', 'uipress-pro'),
        registered: __('Registered', 'uipress-pro'),
        search: __('Search', 'uipress-pro'),
        roleFilter: __('Role filter', 'uipress-pro'),
        created: __('Created', 'uipress-pro'),
        date: __('Date', 'uipress-pro'),
        order: __('Order', 'uipress-pro'),
        ascending: __('Ascending', 'uipress-pro'),
        descending: __('Descending', 'uipress-pro'),
        perPage: __('Per page', 'uipress-pro'),
        filters: __('Filters', 'uipress-pro'),
        edit: __('Edit', 'uipress-pro'),
        delete: __('Delete', 'uipress-pro'),
        view: __('View', 'uipress-pro'),
        passwordReset: __('Password reset', 'uipress-pro'),
        message: __('Message', 'uipress-pro'),
        previous: __('Previous', 'uipress-pro'),
        next: __('Next', 'uipress-pro'),
        results: __('results', 'uipress-pro'),
        actions: __('Actions', 'uipress-pro'),
        clearSelection: __('Clear selection', 'uipress-lite'),
      },
      tableFilters: {
        page: 1,
        search: '',
        roles: [],
        dateCreated: {
          type: 'on',
          date: '',
        },
        activeGroup: 'all',
      },
      tableOptions: {
        direction: 'ASC',
        sortBy: 'username',
        perPage: 20,
      },
      dateOptions: {
        on: {
          value: 'on',
          label: __('On', 'uipress-pro'),
        },
        before: {
          value: 'before',
          label: __('Before', 'uipress-pro'),
        },
        after: {
          value: 'after',
          label: __('After', 'uipress-pro'),
        },
      },
      ui: {
        offcanvas: {
          userPanelOpen: false,
          messagePanelOpen: false,
          newUserOpen: false,
          batchRolePanelOpen: false,
        },
      },
    };
  },
  mounted() {
    this.getUserData();
    this.uipApp.refreshTable = this.getUserData;
  },
  watch: {
    /**
     * Watch changes to filters and trigger role query
     *
     * @since 3.2.0
     */
    tableFilters: {
      handler(newValue, oldValue) {
        this.getUserData();
      },
      deep: true,
    },

    /**
     * Watch changes to options and trigger role query
     *
     * @since 3.2.0
     */
    tableOptions: {
      handler(newValue, oldValue) {
        this.getUserData();
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
        if (newValue) return this.selectAllUsers();
        this.deSelectAllUsers();
      },
    },
  },
  computed: {
    /**
     * Returns list of current paged users
     *
     * @since 3.2.0
     */
    returnUsers() {
      return this.users;
    },

    /**
     * Returns total selected users length
     *
     * @since 3.2.0
     */
    getTotalSelectedUsers() {
      const selected = this.users.filter((user) => user.selected === true);
      return selected.length;
    },

    /**
     * Returns all users selected IDs
     *
     * @since 3.2.0
     */
    returnSelectedIDs() {
      return this.users.map((user) => {
        if (user.selected === true) return user.user_id;
      });
    },

    /**
     * Returns all users selected IDs
     *
     * @since 3.2.0
     */
    returnSelectedUsers() {
      return this.users.map((user) => {
        if (user.selected === true) return user;
      });
    },
  },
  methods: {
    /**
     * Selects all users in the table
     *
     * @since 3.2.0
     */
    selectAllUsers() {
      this.users.map((user) => (user.selected = true));
      this.selectAll = true;
    },

    /**
     * Deselects all users in the table
     *
     * @since 3.2.0
     */
    deSelectAllUsers() {
      this.users.map((user) => (user.selected = false));
      this.selectAll = false;
    },

    /**
     * Fetches users list
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async getUserData() {
      // Exit early if a query is already running
      if (this.queryRunning) return;

      this.queryRunning = true;

      let formData = new FormData();
      formData.append('action', 'uip_get_user_table_data');
      formData.append('security', this.AjaxSecurity);
      formData.append('tablePage', this.tablePage);
      formData.append('filters', JSON.stringify(this.tableFilters));
      formData.append('options', JSON.stringify(this.tableOptions));

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      this.queryRunning = false;

      this.users = response.tableData.users;
      this.query.totalPages = response.tableData.totalPages;
      this.query.totalUsers = response.tableData.totalFound;
      this.selectAll = false;
    },

    /**
     * Confirms and then deletes user
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async deleteUser(ID) {
      const IDS = Array.isArray(ID) ? ID : [ID];

      const confirm = await this.$refs.Confirm.show({
        title: __('Delete user', 'uipress-pro'),
        message: __("Deleted users can't be recovered", 'uipress-pro'),
        okButton: __('Delete', 'uipress-pro'),
      });

      // Exit now if user did not confirm
      if (!confirm) return;

      let formData = new FormData();
      formData.append('action', 'uip_delete_user');
      formData.append('security', this.AjaxSecurity);
      formData.append('IDS', JSON.stringify(IDS));

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      this.uipApp.notifications.notify(response.message, '', 'success', true);
      this.getUserData();
    },

    /**
     * Send password reset email to current user
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async sendPasswordReset(ID) {
      const IDS = Array.isArray(ID) ? ID : [ID];

      let formData = new FormData();
      formData.append('action', 'uip_reset_password');
      formData.append('security', this.AjaxSecurity);
      formData.append('IDS', JSON.stringify(IDS));

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }
      this.uipApp.notifications.notify(response.message, '', 'success', true);
    },

    /**
     * Returns users full name if it exists
     *
     * @param {object} user
     * @since 3.2.0
     */
    returnUserFullName(user) {
      let names = [];
      if (user.first_name) names.push(user.first_name);
      if (user.last_name) names.push(user.last_name);
      return names.join(' ');
    },
  },
  template: ` 
  
  
      <div class="uip-text-normal uip-flex uip-flex-column uip-row-gap-s">
      
        <!--Filters-->
        
        <div class="uip-flex uip-gap-xs uip-flex-center uip-flex-between">
        
          <!--Search-->
          <div class="uip-background-muted uip-padding-xs uip-padding-top-xxs uip-padding-bottom-xxs uip-border-rounder uip-flex uip-flex-center uip-gap-xs">
            <span class="uip-icon uip-text-muted">search</span>
            <input class="uip-blank-input uip-flex-grow uip-text-s" :placeholder="strings.search" v-model="tableFilters.search">
          </div>
          
          
          <div class="uip-flex uip-gap-xs uip-flex-center">
          
          
            <!--Batch actions-->
            <dropdown pos="bottom right" ref="bulkActions">
              
              <template #trigger>
              
                <button :disabled="!getTotalSelectedUsers" class="uip-button-default uip-text-s">{{strings.actions}} ({{getTotalSelectedUsers}})</button>
              
              </template>
              
              <template #content>
              
                <div class="uip-padding-xs uip-flex uip-flex-column uip-text-weight-normal uip-text-s">
                
                  <a @click="deSelectAllUsers();$refs.bulkActions.close()" 
                  class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
                    <span class="">{{strings.clearSelection}}</span>
                    <span class="uip-icon">backspace</span>
                  </a>
                
                  <div class="uip-border-top uip-margin-top-xs uip-margin-bottom-xs"></div>
                  
                  <a @click="sendPasswordReset(returnSelectedIDs);$refs.bulkActions.close()" 
                  class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
                    <span class="">{{strings.passwordReset}}</span>
                    <span class="uip-icon">lock</span>
                  </a>
                  
                  <a @click="uipApp.messageUser.show(returnSelectedUsers);$refs.bulkActions.close()" 
                  class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
                    <span class="">{{strings.message}}</span>
                    <span class="uip-icon">mail</span>
                  </a>
                  
                  
                  <div class="uip-border-top uip-margin-top-xs uip-margin-bottom-xs"></div>
                  
                  <a class="uip-link-danger uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder"
                  @click.prevent="deleteUser(returnSelectedIDs);$refs.bulkActions.close()">
                    <span class="">{{strings.delete}}</span>
                    <span class="uip-icon">delete</span>
                  </a>
                
                </div>
              
              </template>
            
            </dropdown>
          
            <!--User roles-->
            <div class="uip-w-200">
              <UserRoleSelect :selected="tableFilters.roles"
              :placeHolder="strings.roleFilter"
              :roleOnly="true"
              :searchPlaceHolder="strings.searchUsersRoles"
              :updateSelected="(d)=>{tableFilters.roles=d}"/>
            </div>
            
            <!--General filters-->
            <dropdown pos="left top" ref="filtersDrop">
            
              <template #trigger>
                <a class="uip-link-default hover:uip-background-grey uip-background-muted uip-border-rounder uip-icon uip-padding-xs">tune</a>
              </template>
              
              <template #content>
              
                <div class="uip-padding-s uip-flex uip-flex-column uip-row-gap-s uip-w-260">
                
                  <div class="uip-flex uip-flex-between uip-flex-center">
                    <div class="uip-text-emphasis uip-text-bold uip-text-s">{{strings.filters}}</div>
                    <div @click="$refs.filtersDrop.close()" class="uip-flex uip-flex-center uip-flex-middle uip-padding-xxs uip-link-muted hover:uip-background-muted uip-border-rounder">
                      <span class="uip-icon">close</span>
                    </div>
                  </div>
                
                  <div class="uip-grid-col-1-3 uip-padding-left-s">
                
                    <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.created}}</span></div>
                    <switch-select :options="dateOptions" style="width:160px"
                    :activeValue="tableFilters.dateCreated.type" 
                    :returnValue="(d)=>(tableFilters.dateCreated.type=d)"/>
                    
                    <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.date}}</span></div>
                    <input class="uip-input uip-w-160" type="date" v-model="tableFilters.dateCreated.date">
                  
                  </div>
                  
                  <div class="uip-border-top"></div>
                  
                  <div class="uip-grid-col-1-3 uip-padding-left-s">
                  
                  
                    <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.order}}</span></div>
                    <select v-model="tableOptions.direction" class="uip-input uip-w-160">
                      <option value="ASC">{{strings.ascending}}</option>
                      <option value="DESC">{{strings.descending}}</option>
                    </select>
                    
                    <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.perPage}}</span></div>
                    <input v-model="tableOptions.perPage" class="uip-input uip-w-160" type="number">
                    
                    
                  </div>
                  
                
                </div>
              
              </template>
            
            </dropdown>
          
          </div>
        
        </div>
      
        <table class="uip-background-transparent uip-template-table" style="border-collapse: collapse;
        border-spacing: 0;"> 
        
          <thead>
          
            <tr>
              <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-left"><input type="checkbox" class="uip-checkbox" v-model="selectAll"></th>
              <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.user}}</th>
              <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.name}}</th>
              <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.role}}</th>
              <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.registered}}</th>
              <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top"></th>
            </tr>  
          
          
          </thead>
        
          <TransitionGroup name="list" tag="tbody">
          
            <tr v-for="(user, index) in returnUsers" :key="user.user_id" @contextmenu.prevent.stop="$refs['userMenu-'+index][0].show($event)">
              
              <!--Selector-->
              <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-text-left">
                <input class="uip-checkbox" :data-id="user.user_id" type="checkbox" v-model="user.selected">
              </td>
            
              <!--Username-->
              <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-link-emphasis">
                <div class="uip-flex uip-flex-center uip-gap-s" @click="$router.push('/users/' + user.user_id + '/')">
                  <img v-if="user.image" class="uip-w-28 uip-ratio-1-1 uip-border-circle" :src="user.image" />
                  <div class="uip-flex uip-flex-column">
                    <span class="uip-text-bold uip-text-emphasis">{{user.username}}</span>
                    <span class="uip-text-muted uip-max-w-160 uip-overflow-hidden uip-text-ellipsis uip-no-wrap uip-text-s">{{user.user_email}}</span>
                  </div>
                </div>
              </td>
              
              <!--Name-->
              <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom">
                <span class="">{{returnUserFullName(user)}}</span>
              </td>
              
              <!--Role-->
              <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom">
                <div class="uip-flex uip-flex-wrap uip-gap-xs uip-row-gap-xxs">
                
                  <router-link :to="'/roles/edit/' + role" v-for="role in user.roles" 
                  class="uip-background-primary-wash uip-border-round uip-padding-left-xxs uip-padding-right-xxs uip-text-bold uip-link-default uip-no-underline uip-text-s">
                    {{role}}
                  </router-link>
                  
                </div>
              </td>
              
              <!--Created-->
              <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom">
                <span class="">{{user.user_registered}}</span>
              </td>
              
              
              <!--Actions-->
              <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-text-right">
                <div class="uip-inline-flex" @click.prevent.stop="$refs['userMenu-'+index][0].show($event)">
                  <a class="uip-link-default hover:uip-background-muted uip-border-rounder uip-icon uip-padding-xxs">more_vert</a>
                </div>
              </td>
              
            
            </tr>
            
          </TransitionGroup>  
        
        </table>
        
        <div class="uip-padding-bottom-s uip-border-bottom uip-flex uip-flex-between uip-flex-center">
          
          <div class="uip-text-muted">
            {{query.totalUsers}} {{strings.results}}
          </div>
          
          <div class="uip-flex uip-gap-xs uip-text-s">
          
            <button :disabled="tableFilters.page < 2" class="uip-button-default" @click="tableFilters.page--">{{strings.previous}}</button>
            <button :disabled="tableFilters.page >= query.totalPages" class="uip-button-default" @click="tableFilters.page++">{{strings.next}}</button>
          
          </div>
        
        
        </div>
      
      
      </div>
      
      
      <template v-for="(user, index) in returnUsers">
        <ContextMenu :ref="'userMenu-'+index">
        
          <div class="uip-padding-xs uip-flex uip-flex-column uip-text-weight-normal uip-text-s">
          
            <router-link :to="'/users/' + user.user_id + '/'" @click="$refs['userMenu-'+index][0].close()" 
            class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
              <span class="">{{strings.view}}</span>
              <span class="uip-icon">visibility</span>
            </router-link>
          
            <router-link :to="'/users/' + user.user_id + '/edit'" @click="$refs['userMenu-'+index][0].close()" 
            class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
              <span class="">{{strings.edit}}</span>
              <span class="uip-icon">edit</span>
            </router-link>
            
            <a @click="sendPasswordReset(user.user_id);$refs['userMenu-'+index][0].close()" 
            class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
              <span class="">{{strings.passwordReset}}</span>
              <span class="uip-icon">lock</span>
            </a>
            
            <a @click="uipApp.messageUser.show(user);$refs['userMenu-'+index][0].close()" 
            class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
              <span class="">{{strings.message}}</span>
              <span class="uip-icon">mail</span>
            </a>
            
            
            <div class="uip-border-top uip-margin-top-xs uip-margin-bottom-xs"></div>
            
            <a class="uip-link-danger uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder"
            @click.prevent="deleteUser(user.user_id);$refs['userMenu-'+index][0].close()">
              <span class="">{{strings.delete}}</span>
              <span class="uip-icon">delete</span>
            </a>
          
          </div>
        
        </ContextMenu>
      </template>
      
      <Confirm ref="Confirm"/>
    
  
        
        `,
};
