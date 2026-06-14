const { __, _x, _n, _nx } = wp.i18n;
export default {
  data() {
    return {
      userID: this.$route.params.id,
      panelData: [],
      userFetched: false,
      strings: {
        viewUserProfile: __('Profile image', 'uipress-lite'),
        profileImage: __('Profile image', 'uipress-lite'),
        imageURL: __('Image URL', 'uipress-lite'),
        changeImage: __('Change image', 'uipress-lite'),
        firstName: __('First name', 'uipress-lite'),
        lastName: __('Last name', 'uipress-lite'),
        email: __('Email', 'uipress-lite'),
        roles: __('Roles', 'uipress-lite'),
        assignRoles: __('Assign roles', 'uipress-lite'),
        searchRoles: __('Search roles', 'uipress-lite'),
        userNotes: __('User notes', 'uipress-lite'),
        cancel: __('Cancel', 'uipress-lite'),
        updateUser: __('Update user', 'uipress-lite'),
        editUser: __('Edit user', 'uipress-lite'),
      },
      user: {
        editData: [],
      },
    };
  },

  mounted() {
    this.getUserData();
  },
  computed: {},
  methods: {
    /**
     * Fetches user data
     *
     * @since 3.2.0
     */
    async getUserData() {
      let formData = new FormData();
      formData.append('action', 'uip_get_user_data');
      formData.append('security', this.AjaxSecurity);
      formData.append('userID', this.$route.params.id);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      if (response.error) {
        this.uipApp.notifications.notify(response.error, '', 'error', true);
        return;
      }

      this.panelData = response;
      this.userFetched = true;
      this.user.editData = { ...this.panelData.user };
      this.user.editData.roles = this.returnFormattedRoles(this.user.editData.roles);
    },

    /**
     * Saves user data
     *
     * @since 3.2.0
     */
    async updateUser() {
      let formData = new FormData();
      formData.append('action', 'uip_update_user');
      formData.append('security', this.AjaxSecurity);
      formData.append('user', JSON.stringify(this.user.editData));

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      this.uipApp.notifications.notify(response.message, '', 'success', true);
    },

    /**
     * Returns a formatted list of user roles
     *
     * @since 3.2.0
     */
    returnFormattedRoles(roles) {
      return roles.map((role) => {
        if (this.isObject(role)) return role;
        return { name: role };
      });
    },
  },
  template: ` 
      <FloatingPanel :startOpen="true" :closer="()=>$router.push('/')">
      
        <div class="uip-flex uip-flex-grow uip-flex-column uip-max-h-100p uip-row-gap-s uip-padding-m uip-h-100p" v-if="userFetched">
        
          <!--Header-->
          <div class="uip-flex uip-flex-column uip-row-gap-xs" >
            
            <!-- OVERVIEW -->
            <div class="uip-flex uip-flex-center uip-gap-s">
              
              <div class="uip-flex uip-flex-column uip-flex-grow">
                <div class="uip-text-bold uip-text-l uip-text-emphasis">{{strings.editUser}}</div>
                <div class="uip-text-muted uip-max-w-250 uip-overflow-hidden uip-no-wrap uip-text-ellipsis">{{panelData.user.username}}</div>
              </div>
              
              <div class="uip-flex uip-text-l uip-self-flex-start">
                
                <a @click="$router.push('/');$refs.userPanel.close()" class="uip-link-muted hover:uip-background-muted uip-border-rounder uip-icon uip-padding-xxs">close</a>
                
              </div>
            </div>
            
          </div>
          
          <!--Spacer-->
          <div></div>
          
          <!--Details-->
          <div class="uip-flex-grow">
            <div class="uip-grid-col-1-3 uip-padding-left-s">
                
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.profileImage}}</span>
              </div>
              <InlineImageSelect :value="{url:user.editData.uip_profile_image}" :returnData="(d)=>{user.editData.uip_profile_image = d.url}"
              :args="{hasPositioning:false}"/>
              
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.firstName}}</span>
              </div>
              <input type="text" class="uip-input uip-w-100p" v-model="user.editData.first_name">
              
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.lastName}}</span>
              </div>
              <input type="text" class="uip-input uip-w-100p" v-model="user.editData.last_name">
              
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.email}}</span>
              </div>
              <input type="text" class="uip-input uip-w-100p" v-model="user.editData.user_email">
              
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.roles}}</span>
              </div>
              
              <UserRoleSelect :selected="this.user.editData.roles"
              :roleOnly="true"
              :placeHolder="strings.assignRoles"
              :searchPlaceHolder="strings.searchRoles"
              :updateSelected="(d)=>{user.editData.roles=d}"/>
              
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs uip-flex-start uip-padding-top-xxs">
                <span>{{strings.userNotes}}</span>
              </div>
              <textarea type="text" class="uip-input uip-w-100p" rows="4" v-model="user.editData.notes"></textarea>
              
            </div>
          </div>
          
          
          <div class="uip-flex uip-flex-between uip-gap-s">
            <router-link :to="'/'" class="uip-button-default uip-no-underline uip-flex-grow uip-text-center">{{strings.cancel}}</router-link>
            <button class="uip-button-primary uip-flex-grow" @click="updateUser()">{{strings.updateUser}}</button>
          </div>
          
        
        </div>  
      
      </FloatingPanel>`,
};
