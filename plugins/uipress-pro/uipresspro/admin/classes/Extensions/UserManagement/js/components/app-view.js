const { __, _x, _n, _nx } = wp.i18n;
export default {
  data() {
    return {
      strings: {
        userManagemet: __('User management', 'uipress-pro'),
        newUser: __('New user', 'uipress-pro'),
        newRole: __('New role', 'uipress-pro'),
        actions: __('Actions', 'uipress-pro'),
        deleteAllEntries: __('Delete all history entries', 'uipress-lite'),
      },
      currentTab: 'users',
      tabs: {
        users: {
          value: 'users',
          label: __('Users', 'uipress-pro'),
        },
        roles: {
          value: 'roles',
          label: __('Roles', 'uipress-pro'),
        },
        activity: {
          value: 'activity',
          label: __('Activity', 'uipress-pro'),
        },
      },
    };
  },
  computed: {
    /**
     * Returns the active tab label
     *
     * @since 3.2.0
     */
    returnActiveTab() {
      return this.tabs[this.currentTab].label;
    },
  },
  methods: {
    /**
     * Returns active style for tab
     *
     * @param {object} item
     * @since 3.2.0
     */
    returnTabStyle(item) {
      if (item.value != this.currentTab) return;
      return { 'border-bottom': '2px solid var(--uip-color-accent)' };
    },
  },
  template: `
    
      <div class="uip-flex uip-flex-column uip-h-100p uip-w-100p uip-background-default" style="min-height:100dvh">
      
          
      
          <!-- Toolbar -->
          <div class="uip-padding-s uip-background-default uip-border-bottom uip-border-bottom uip-flex uip-flex-between uip-position-relative">
          
            <!-- Logo -->
            <div class="uip-flex uip-gap-xs uip-flex-center uip-border-rounder uip-background-muted uip-padding-xs uip-padding-top-xxs uip-padding-bottom-xxs">
              <div class="uip-logo uip-w-18 uip-ratio-1-1"></div>
              <div class="uip-text-bold">{{strings.userManagemet}}</div>
            </div>
                  
            
          </div>
          
          <div class="uip-flex uip-flex-column uip-flex-center uip-padding-l">
          
            <div class="uip-flex uip-flex-column uip-row-gap-m uip-w-100p uip-max-w-100p">
              
              <!--Title-->
              <div class="uip-flex uip-flex-between">
                <div class="uip-text-bold uip-text-xl uip-text-emphasis">{{returnActiveTab}}</div>
                
                <!-- New user-->
                <router-link v-if="currentTab == 'users'" to="/users/new" class="uip-button-primary uip-text-s uip-no-underline uip-flex uip-gap-xs uip-flex-center">
                  <span>{{strings.newUser}}</span>
                  <span class="uip-icon">add</span>
                </router-link>
                
                <!--New role-->
                <router-link v-if="currentTab == 'roles'" to="/roles/edit/new" class="uip-button-primary uip-text-s uip-no-underline">{{strings.newRole}}</router-link>
                
                
                <!--History actions-->
                <dropdown v-if="currentTab == 'activity'" pos="bottom right" ref="historyDrop">
                  <template #trigger>
                    <button class="uip-button-primary uip-text-s uip-flex uip-flex-center uip-gap-xxs">
                    
                      <span>{{strings.actions}}</span>
                      <span class="uip-icon">expand_more</span>
                        
                    </button>
                  </template>
                  
                  <template #content>
                  
                    <div class="uip-padding-xs uip-flex uip-flex-column uip-text-weight-normal uip-text-s">
                      
                      <a class="uip-link-danger uip-flex uip-flex-center uip-flex-between uip-gap-s uip-padding-xxs hover:uip-background-muted uip-border-rounder"
                      @click.prevent="$refs.activityTable.delateAllHistoryItems();$refs.historyDrop.close()">
                        <span class="">{{strings.deleteAllEntries}}</span>
                        <span class="uip-icon">delete</span>
                      </a>
                    
                    </div>
                    
                  </template>
                </dropdown>
                
              </div>
              
              <!--Nav-->
              <div class="uip-flex uip-gap-s">
                <template v-for="item in tabs">
                  <a class="uip-padding-bottom-s" @click="currentTab = item.value" 
                  :class="item.value == this.currentTab ? 'uip-text-bold uip-link-emphasis' : 'uip-link-muted'"
                  :style="returnTabStyle(item)">
                    {{item.label}}
                  </a>
                </template>
              </div>
                
              <UserTable v-if="currentTab == 'users'"/>
              <RoleTable v-if="currentTab == 'roles'"/>
              <ActivityTable ref="activityTable" v-if="currentTab == 'activity'"/>
              
              
              
            </div>
          
          </div>
          
          <router-view :key="$route.path"></router-view>
          
          
          
      </div>`,
};
