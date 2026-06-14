const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    closePanel: Function,
    sendmessage: Function,
    groups: Object,
  },
  data() {
    return {
      strings: {
        previous: __('Previous', 'uipress-pro'),
        next: __('Next', 'uipress-pro'),
        results: __('results', 'uipress-pro'),
        details: __('Details', 'uipress-pro'),
        editUser: __('Edit user', 'uipress-pro'),
        passwordReset: __('Send password reset', 'uipress-pro'),
        sendMessage: __('Send message', 'uipress-pro'),
        logoutEverywhere: __('Logout everywhere', 'uipress-pro'),
        edit: __('Edit', 'uipress-pro'),
        delete: __('Delete user', 'uipress-pro'),
        name: __('Name', 'uipress-pro'),
        email: __('Email', 'uipress-pro'),
        accountCreated: __('Account created', 'uipress-pro'),
        lastLogin: __('Last login', 'uipress-pro'),
        lastLoginCountry: __('Login location', 'uipress-lite'),
        totalPosts: __('Total posts', 'uipress-lite'),
        totalComments: __('Total commends', 'uipress-lite'),
        userNotes: __('User notes', 'uipress-lite'),
        recentPageViews: __('Recent page views', 'uipress-lite'),
        noActivity: __('No activity', 'uipress-lite'),
        recentActivity: __('Recent activity', 'uipress-lite'),
        role: __('Role', 'uipress-lite'),
      },
      userID: this.$route.params.id,
      panelData: [],
      userFetched: false,
      recentActivity: {
        page: 1,
        totalPages: 0,
      },
      user: {
        editData: [],
      },
      ui: {
        editing: false,
        activityOpen: true,
        pageViewsOpen: true,
        userNotesOpen: true,
      },
    };
  },

  async mounted() {
    this.getUserData();

    // Exit if accessed with no ID
    if (!this.$route.params.id || typeof this.$route.params.id === 'undefined') {
      this.$router.push('/');
    }
  },
  methods: {
    /**
     * Get's user data object from ID
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async getUserData() {
      let formData = new FormData();
      formData.append('action', 'uip_get_user_data');
      formData.append('security', this.AjaxSecurity);
      formData.append('userID', this.$route.params.id);
      formData.append('activityPage', JSON.stringify(this.recentActivity.page));

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      if (response.error) {
        this.uipApp.notifications.notify(response.error, '', 'error', true);
        return;
      }

      this.panelData = response;
      this.userFetched = true;
      this.recentActivity.totalPages = this.panelData.history.totalPages;
      this.user.editData = JSON.parse(JSON.stringify(this.panelData.user));
    },

    /**
     * Send password reset email to curent user
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async sendPasswordReset() {
      const IDS = [this.panelData.user.user_id];
      let formData = new FormData();
      formData.append('action', 'uip_reset_password');
      formData.append('security', this.AjaxSecurity);
      formData.append('IDS', JSON.stringify(IDS));

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }
      this.uipApp.notifications.notify(response.message, '', 'success', true);
    },

    /**
     * Confirms and then deletes user
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async deleteUser() {
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
      formData.append('userID', this.panelData.user.user_id);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      this.uipApp.notifications.notify(response.message, '', 'success', true);
      this.uipApp.refreshTable();
      this.$router.push('/');
    },

    /**
     * Logs the current user out everywhere
     *
     * @since 3.2.0
     */
    async logoutEverywhere() {
      let formData = new FormData();
      formData.append('action', 'uip_logout_user_everywhere');
      formData.append('security', this.AjaxSecurity);
      formData.append('userID', this.panelData.user.user_id);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }
      this.uipApp.notifications.notify(response.message, '', 'success', true);
    },

    /**
     * Changes page of current activity data
     *
     * @param {string} direction
     * @since 3.2.0
     */
    changeActivityPage(direction) {
      if (direction == 'next') this.recentActivity.page++;
      if (direction == 'previous') this.recentActivity.page = this.recentActivity.page--;
      this.getUserData();
    },

    /**
     * Returns the display title for a recent page view
     *
     * @param {object} view
     * @since 3.2.0
     */
    returnViewTitle(view) {
      return view.title ? view.title : view.url;
    },

    /**
     * Attempts to remove UIP params from a URL
     *
     * @param {string} link
     * @since 3.2.0
     */
    returnFormattedLink(link) {
      try {
        return this.stripUIPparams(link);
      } catch (err) {
        return link;
      }
    },
  },
  template: ` 
  
      <FloatingPanel ref="userPanel" :startOpen="true" :closer="()=>$router.push('/')">
        
        
        <div class="uip-flex uip-flex-grow uip-flex-column uip-max-h-100p uip-row-gap-s uip-padding-m" v-if="userFetched">
        
        
          <div class="uip-flex uip-flex-column uip-row-gap-xs" >
            
            <!-- OVERVIEW -->
            <div class="uip-flex uip-flex-center uip-gap-s">
            
              <div class="">
                <img :src="panelData.user.image" class="uip-border-circle uip-w-38 uip-ratio-1-1">
              </div>
              
              <div class="uip-flex uip-flex-column uip-flex-grow">
                <div class="uip-text-bold uip-text-l uip-text-emphasis">{{panelData.user.username}}</div>
                <div class="uip-text-muted uip-max-w-250 uip-overflow-hidden uip-no-wrap uip-text-ellipsis">{{panelData.user.user_email}}</div>
              </div>
              
              <div class="uip-flex uip-text-l uip-self-flex-start">
                
                <!-- Edit dropdown-->
                <dropdown pos="left top" ref="userOptions">
                  <template #trigger>
                    <a class="uip-link-muted hover:uip-background-muted uip-border-rounder uip-icon uip-padding-xxs">more_vert</a>
                  </template>
                  <template #content>
                   
                   
                   <div class="uip-padding-xs uip-flex uip-flex-column uip-text-weight-normal uip-text-s">
                   
                    <router-link :to="'/users/' + panelData.user.user_id + '/edit'"
                    class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
                      <span class="">{{strings.edit}}</span>
                      <span class="uip-icon">edit</span>
                    </router-link>
                    
                    <router-link :to="'/message/' + panelData.user.user_email" class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
                      <div>{{strings.sendMessage}}</div>
                      <div class="uip-icon">email</div>
                    </router-link>
                    
                    <a @click="sendPasswordReset();$refs.userOptions.close()" 
                    class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
                      <span class="">{{strings.passwordReset}}</span>
                      <span class="uip-icon">lock</span>
                    </a>
                    
                    <a @click="logoutEverywhere();$refs.userOptions.close()" class="uip-link-default uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-underline">
                      <div>{{strings.logoutEverywhere}}</div>
                      <div class="uip-icon">logout</div>
                    </a>
                    
                    <div class="uip-border-top uip-margin-top-xs uip-margin-bottom-xs"></div>
                    
                    <a class="uip-link-danger uip-flex uip-flex-center uip-flex-between uip-gap-m uip-padding-xxs hover:uip-background-muted uip-border-rounder"
                    @click.prevent="deleteUser();$refs.userOptions.close()">
                      <span class="">{{strings.delete}}</span>
                      <span class="uip-icon">delete</span>
                    </a>
                   
                   </div>
                    
                   
                  </template>
                </dropdown>
                
                <a @click="$router.push('/');$refs.userPanel.close()" class="uip-link-muted hover:uip-background-muted uip-border-rounder uip-icon uip-padding-xxs">close</a>
                
              </div>
            </div>
            
          </div>
          
          <!--Spacer-->
          <div class=""></div>
          
          <!--User details-->
          <ToggleSection :title="strings.details" :startOpen="true">
          
            <div class="uip-grid-col-1-3">
                  
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.role}}</span>
              </div>
              <div class="uip-flex uip-gap-xs uip-flex-wrap uip-flex-right">
                <router-link :to="'/roles/edit/' + role" v-for="role in panelData.user.roles" 
                class="uip-background-primary-wash uip-border-round uip-padding-left-xxs uip-padding-right-xxs uip-text-bold uip-link-default uip-no-underline uip-text-s">
                  {{role}}
                </router-link>
              </div>
                
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.name}}</span>
              </div>
              <div class="uip-text-right uip-max-w-100p uip-overflow-hidden uip-no-wrap uip-text-ellipsis">{{panelData.user.name}}</div>
              
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.email}}</span>
              </div>
              <div class="uip-text-right uip-max-w-100p uip-overflow-hidden uip-no-wrap uip-text-ellipsis">{{panelData.user.user_email}}</div>
              
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.accountCreated}}</span>
              </div>
              <div class="uip-text-right uip-max-w-100p uip-overflow-hidden uip-no-wrap uip-text-ellipsis">{{panelData.user.user_registered}}</div>
                
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.lastLogin}}</span>
              </div>
              <div class="uip-text-right uip-max-w-100p uip-overflow-hidden uip-no-wrap uip-text-ellipsis">{{panelData.user.uip_last_login_date}}</div>
              
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.lastLoginCountry}}</span>
              </div>
              <div class="uip-text-right uip-max-w-100p uip-overflow-hidden uip-no-wrap uip-text-ellipsis">{{panelData.user.uip_last_login_country}}</div>
              
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.totalPosts}}</span>
              </div>
              <div class="uip-text-right uip-max-w-100p uip-overflow-hidden uip-no-wrap uip-text-ellipsis">{{panelData.user.totalPosts}}</div>
              
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.totalComments}}</span>
              </div>
              <div class="uip-text-right uip-max-w-100p uip-overflow-hidden uip-no-wrap uip-text-ellipsis">{{panelData.user.totalComments}}</div>
              
            </div>
          
          </ToggleSection>
          <!--End user details-->
          
          <div class="uip-border-top"></div>
          
          
          <!--Recent page views-->
          <ToggleSection :title="strings.recentPageViews" :startOpen="false">
          
            <div v-if="!panelData.recentPageViews.length">{{strings.noActivity}}</div>
            
            <table v-else class="uip-border-collapse">
              <tbody>
                <tr v-for="(view, index) in panelData.recentPageViews">
                
                  <td class="uip-no-wrap uip-text-right uip-vertical-align-top">
                    <div class="uip-text-muted  uip-text-s">{{view.human_time}}</div>
                  </td>
                  
                  
                  <td class="uip-h-12 uip-w-12 uip-no-wrap uip-padding-left-s uip-padding-right-s uip-padding-top-xs">
                    <div class="uip-h-100p uip-position-relative uip-flex uip-flex-column uip-flex-center uip-row-gap-xs">
                    
                      <div class="uip-w-4 uip-h-4 uip-border-circle uip-background-primary"></div>
                      
                      <div v-if="index != panelData.recentPageViews.length - 1" class="uip-background-muted uip-w-2 uip-flex uip-flex-middle uip-overflow-visible uip-flex-grow uip-flex-start">
                        
                      </div>
                    </div>
                  </td>
                  
                  <td class="uip-w-90p uip-padding-bottom-s uip-vertical-align-top">
                    <a class="uip-link-muted uip-text-bold uip-text-normal uip-no-underline" :href="returnFormattedLink(view.url)">{{returnViewTitle(view)}}</a>
                  </td>
                
                </tr>
              </tbody>
            </table>
          
          </ToggleSection>
          
          <div class="uip-border-top"></div>
          
          <!--Recent activity-->
          <ToggleSection :title="strings.recentActivity" :startOpen="false">
          
            <div v-if="panelData.history.totalFound == 0">{{strings.noActivity}}</div>
              
            <table v-else class="uip-border-collapse">
              <tbody>
                <tr v-for="(view, index) in panelData.history.list">
                
                  <td class="uip-no-wrap uip-text-right uip-vertical-align-top">
                    <div class="uip-text-muted  uip-text-s">{{view.human_time}}</div>
                  </td>
                  
                  <td class="uip-h-12 uip-w-12 uip-no-wrap uip-padding-left-s uip-padding-right-s uip-padding-top-xs">
                    <div class="uip-h-100p uip-position-relative uip-flex uip-flex-column uip-flex-center uip-row-gap-xs">
                    
                      <div class="uip-w-4 uip-h-4 uip-border-circle"
                      :class="[{'uip-background-primary' : view.type == 'primary'}, {'uip-background-orange' : view.type == 'warning'}, {'uip-background-red' : view.type == 'danger'}]"></div>
                      
                      <div v-if="index != panelData.history.list.length - 1" class="uip-background-muted uip-w-2 uip-flex uip-flex-middle uip-overflow-visible uip-flex-grow uip-flex-start">
                        
                      </div>
                    </div>
                  </td>
                  
                  <td class="uip-w-90p">
                    <div class="uip-padding-bottom-xs">
                      <div class="uip-text-bold uip-text-normal uip-no-underline" >{{view.title}}</div>
                      <div class="uip-text-muted uip-text-s" v-html="view.meta"></div>
                      <div class="uip-flex uip-gap-xxs uip-text-s" >
                        <template v-for="link in view.links">
                          <a :href="returnFormattedLink(link.url)" class="uip-link-muted uip-link-no-underline">{{link.name}}</a>
                        </template>
                      </div>
                    </div>
                  </td>
                
                </tr>
              </tbody>
            </table>
              
            
            <div class="uip-flex uip-gap-xs uip-margin-top-s" v-if="recentActivity.totalPages > 1">
              <button v-if="recentActivity.page > 1" class="uip-button-default" @click="changeActivityPage('previous')">{{strings.previous}}</button>
              <button class="uip-button-default" @click="changeActivityPage('next')">{{strings.next}}</button>
            </div>
          
          </ToggleSection>
            
          <div class="uip-border-top"></div>  
          
        </div>
        
        <Confirm ref="Confirm"/>
        
      </FloatingPanel>`,
};
