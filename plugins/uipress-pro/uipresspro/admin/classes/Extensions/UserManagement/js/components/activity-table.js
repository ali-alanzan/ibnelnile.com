const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    data: Object,
    dataChange: Function,
  },
  data() {
    return {
      loading: true,
      strings: {
        search: __('Search', 'uipress-lite'),
        clearSelection: __('Clear selection', 'uipress-lite'),
        delete: __('Delete', 'uipress-lite'),
        user: __('User', 'uipress-lite'),
        IPaddress: __('IP address', 'uipress-lite'),
        action: __('Action', 'uipress-lite'),
        description: __('Description', 'uipress-lite'),
        date: __('Date', 'uipress-lite'),
        time: __('Time', 'uipress-lite'),
        actions: __('Actions', 'uipress-lite'),
        results: __('results', 'uipress-lite'),
        next: __('Next', 'uipress-lite'),
        previous: __('Previous', 'uipress-lite'),
        roleFilter: __('Role filter', 'uipress-lite'),
        filters: __('Filters', 'uipress-lite'),
        created: __('Created', 'uipress-lite'),
        order: __('Order', 'uipress-lite'),
        perPage: __('Per page', 'uipress-lite'),
        ascending: __('Ascending', 'uipress-lite'),
        descending: __('Descending', 'uipress-lite'),
        searchActions: __('Search actions', 'uipress-lite'),
        actionFilter: __('Action filter', 'uipress-lite'),
      },
      tableData: {
        totalPages: 1,
        activity: [],
      },
      selectAll: false,
      queryRunning: false,
      tableFilters: {
        search: '',
        roles: [],
        status: [],
        dateCreated: {
          type: 'on',
          date: '',
        },
        action: '',
      },
      tableOptions: {
        direction: 'DESC',
        sortBy: 'username',
        perPage: 20,
        page: 1,
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
    };
  },
  mounted() {
    this.getActivityData();
  },
  watch: {
    tableFilters: {
      handler(newValue, oldValue) {
        this.getActivityData();
      },
      deep: true,
    },
    tableOptions: {
      handler(newValue, oldValue) {
        this.getActivityData();
      },
      deep: true,
    },
    selectAll: {
      handler(newValue, oldValue) {
        if (newValue) return this.selectAllActions();
        this.deSelectAllActions();
      },
    },
  },
  computed: {
    /**
     * Returns all selected actions
     *
     * @since 3.2.0
     */
    returnTotalSelectedActions() {
      return this.tableData.activity.filter((action) => action.selected === true);
    },

    /**
     * Returns count of selected items
     *
     * @since 3.2.0
     */
    getTotalSelectedActions() {
      return this.returnTotalSelectedActions.length;
    },

    /**
     * Returns ids of selected items
     *
     * @since 3.2.0
     */
    returnSelectedActionIDS() {
      return this.tableData.activity.map((action) => {
        if (action.selected === true) return action.id;
      });
    },
  },
  methods: {
    /**
     * Deletes specific history actions
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async deleteHistoryActions(IDS) {
      const confirm = await this.$refs.Confirm.show({
        title: __('Delete history actions', 'uipress-pro'),
        message: __("Deleted history actions can't be recovered", 'uipress-pro'),
        okButton: __('Delete', 'uipress-pro'),
      });

      // exit if user did not confirm
      if (!confirm) return;

      const ALLIDS = Array.isArray(IDS) ? IDS : [IDS];

      let formData = new FormData();
      formData.append('action', 'uip_delete_multiple_actions');
      formData.append('security', this.AjaxSecurity);
      formData.append('allIDS', JSON.stringify(ALLIDS));

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error');
        return;
      }

      this.uipApp.notifications.notify(response.message, '', 'success');

      this.deSelectAllActions();
      this.getActivityData();
    },

    /**
     * Deletes all history entries from server / remote db
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async delateAllHistoryItems() {
      const confirm = await this.$refs.Confirm.show({
        title: __('Delete ALL history actions', 'uipress-pro'),
        message: __("This action will remove all history actions from your database. Deleted history actions can't be recovered", 'uipress-pro'),
        okButton: __('Delete all', 'uipress-pro'),
      });

      // exit if user did not confirm
      if (!confirm) return;

      let formData = new FormData();
      formData.append('action', 'uip_delete_all_history');
      formData.append('security', this.AjaxSecurity);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);
      this.loading = false;

      // handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error');
        return;
      }

      this.uipApp.notifications.notify(response.message, '', 'success');
      this.deSelectAllActions();
      this.getActivityData();
    },

    /**
     * Selects all actions
     *
     * @since 3.2.0
     */
    selectAllActions() {
      this.tableData.activity.map((action) => (action.selected = true));
      this.selectAll = true;
    },

    /**
     * Deselects all actions
     *
     * @since 3.2.0
     */
    deSelectAllActions() {
      this.tableData.activity.map((action) => (action.selected = false));
      this.selectAll = false;
    },

    /**
     * Get's activity data for table
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async getActivityData() {
      if (this.queryRunning) return;

      this.loading = true;
      this.queryRunning = true;

      let formData = new FormData();
      formData.append('action', 'uip_get_activity_table_data');
      formData.append('security', this.AjaxSecurity);
      formData.append('filters', JSON.stringify(this.tableFilters));
      formData.append('options', JSON.stringify(this.tableOptions));

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      this.queryRunning = false;
      this.loading = false;

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error');
        return;
      }

      this.tableData.totalPages = response.tableData.totalPages;
      this.tableData.activity = response.tableData.activity;
      this.tableData.totalFound = response.tableData.totalFound;
      this.tableData.columns = response.tableData.columns;
      this.tableData.actions = response.tableData.actions;

      // Zero pages
      if (!response.tableData.totalPages) return;

      if (this.tableOptions.page > response.tableData.totalPages) {
        this.tableOptions.page = response.tableData.totalPages;
      }

      if (this.tableOptions.page < 1) {
        this.tableOptions.page = 1;
      }
    },
    /**
     * Returns a class to differentiate action types
     *
     * @param {string} type
     * @since 3.2.0
     */
    returnActionClass(type) {
      switch (type) {
        case 'primary':
          return 'uip-background-primary-wash';
        case 'warning':
          return 'uip-background-orange-wash';
        case 'danger':
          return 'uip-background-red-wash';
        default:
          return 'uip-background-primary-wash';
      }
    },

    /**
     * Clips table action descriptions to 200 chars
     *
     * @param {string} description
     * @since 3.2.0
     */
    returnLimitedDescription(description) {
      if (!description) return '';
      if (description.length < 260) return description;

      return description.substring(0, 260) + '...';
    },
  },

  template: `
  
  
  
  <div class="uip-text-normal uip-flex uip-flex-column uip-row-gap-s">
  
    <!--Filters-->
    
    <div class="uip-flex uip-gap-xs uip-flex-center uip-flex-between">
    
      <!--Search-->
      <div class="uip-background-muted uip-padding-xs uip-padding-top-xxs uip-padding-bottom-xxs uip-border-rounder uip-flex uip-flex-center uip-gap-xs">
        <span class="uip-icon uip-text-muted">search</span>
        <input class="uip-blank-input uip-text-s uip-flex-grow" :placeholder="strings.search" v-model="tableFilters.search">
      </div>
      
      <!--Filters-->
      <div class="uip-flex uip-gap-xs uip-flex-center">
        <!--Batch actions-->
        <dropdown pos="bottom right" ref="bulkActions">
          
          <template #trigger>
          
            <button :disabled="!getTotalSelectedActions" class="uip-button-default uip-text-s">{{strings.actions}} ({{getTotalSelectedActions}})</button>
          
          </template>
          
          <template #content>
          
            <div class="uip-padding-xs uip-flex uip-flex-column uip-text-weight-normal uip-text-s">
            
              <a @click="deSelectAllActions();$refs.bulkActions.close()" 
              class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
                <span class="">{{strings.clearSelection}}</span>
                <span class="uip-icon">backspace</span>
              </a>
              
              
              <div class="uip-border-top uip-margin-top-xs uip-margin-bottom-xs"></div>
              
              <a class="uip-link-danger uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder"
              @click.prevent="deleteHistoryActions(returnSelectedActionIDS);$refs.bulkActions.close()">
                <span class="">{{strings.delete}}</span>
                <span class="uip-icon">delete</span>
              </a>
            
            </div>
          
          </template>
        
        </dropdown>
        
        
        <!--Actions-->
        <div class="uip-w-160">
          <MultiSelect :selected="tableFilters.status"
          :placeHolder="strings.actionFilter"
          :availableOptions="tableData.actions"
          :searchPlaceHolder="strings.searchActions"
          :updateSelected="(d)=>{tableFilters.status=d}"/>
        </div>
        
        <!--User roles-->
        <div class="uip-w-160">
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
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-left uip-padding-right-s"><input type="checkbox" class="uip-checkbox" v-model="selectAll"></th>
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.user}}</th>
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.IPaddress}}</th>
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.action}}</th>
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.description}}</th>
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top uip-text-muted uip-text-weight-normal uip-text-left">{{strings.date}}</th>
          <th class="uip-padding-top-s uip-padding-bottom-s uip-border-bottom uip-border-top"></th>
        </tr>  
      
      
      </thead>
      
      
      
      <TransitionGroup name="list" tag="tbody">
      
        <tr v-for="(activity, index) in tableData.activity" :key="activity.id" @contextmenu.prevent.stop="$refs['activityMenu-'+index][0].show($event)">
        
          <!--Selector-->
          <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-text-left">
            <input class="uip-checkbox" :data-id="activity.id" type="checkbox" v-model="activity.selected">
          </td>
          
          <!--User column-->
          <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-text-left uip-text-bold uip-text-emphasis uip-link-emphasis">
            
              <div class="uip-flex uip-flex-center uip-gap-s" @click="$router.push('/users/' + activity.user_id + '/')">
                <img v-if="activity.image" class="uip-w-28 uip-ratio-1-1 uip-border-circle" :src="activity.image" />
                <div class="uip-flex uip-flex-column">
                  <span class="uip-text-bold uip-text-emphasis">{{activity.user}}</span>
                  <span class="uip-text-muted uip-max-w-160 uip-overflow-hidden uip-text-ellipsis uip-no-wrap uip-text-s">{{activity.user_email}}</span>
                </div>
              </div>
              
          </td>
          
          <!--IP Address-->
          <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom">
            <span class="">{{activity.ip_address}}</span>
          </td>
          
          <!--Action-->
          <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom">
            <div class="uip-flex">
              <div :class="returnActionClass(activity.type)" class="uip-border-round uip-padding-left-xxs uip-padding-right-xxs uip-text-bold uip-link-default uip-no-underline uip-text-s">
                {{activity.action}}
              </div>
            </div>
          </td>
          
          <!--Description-->
          <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-text-s">
            <dropdown :hover="true" pos="bottom left">
              <template #trigger>
                <div class="uip-max-h-80 uip-overflow-auto uip-max-w-350 uip-break-word" v-html="returnLimitedDescription(activity.description)"></div>
              </template>
              <template #content v-if="activity.description.length > 260">
                <div class="uip-padding-s uip-w-300 uip-max-w-350 uip-break-word" v-html="activity.description">
                </div>
              </template>
            </dropdown>
          </td>
          
          <!--Date-->
          <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom">
            <div class="uip-flex uip-flex-column uip-text-s">
              <span class="">{{activity.time}}</span>
              <span class="">{{activity.date}}</span>
            </div>
          </td>
          
          <!--Actions-->
          <td class="uip-padding-top-xs uip-padding-bottom-xs uip-border-bottom uip-text-right">
            <div class="uip-inline-flex" @click.prevent.stop="$refs['activityMenu-'+index][0].show($event)">
              <a class="uip-link-default hover:uip-background-muted uip-border-rounder uip-icon uip-padding-xxs">more_vert</a>
            </div>
          </td>
          
        </tr>  
      
      </TransitionGroup>
      
      
    </table>
    
    <!--Pagination-->
    <div class="uip-padding-bottom-s uip-border-bottom uip-flex uip-flex-between uip-flex-center">
      
      <div class="uip-text-muted">
        {{tableData.totalFound}} {{strings.results}}
      </div>
      
      <div class="uip-flex uip-gap-xs uip-text-s">
      
        <button :disabled="tableOptions.page < 2" class="uip-button-default" @click="tableOptions.page--">{{strings.previous}}</button>
        <button :disabled="tableOptions.page >= tableData.totalPages" class="uip-button-default" @click="tableOptions.page++">{{strings.next}}</button>
      
      </div>
    </div>
    
    
    <template v-for="(activity, index) in tableData.activity">
      <ContextMenu :ref="'activityMenu-'+index">
      
        <div class="uip-padding-xs uip-flex uip-flex-column uip-text-weight-normal uip-text-s">
          
          <a class="uip-link-danger uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder"
          @click.prevent="deleteHistoryActions(activity.id);$refs['activityMenu-'+index][0].close()">
            <span class="">{{strings.delete}}</span>
            <span class="uip-icon">delete</span>
          </a>
        
        </div>
      
      </ContextMenu>
    </template>
  
  </div>
  
  <Confirm ref="Confirm"/>
  
  
  
  
  `,
};
