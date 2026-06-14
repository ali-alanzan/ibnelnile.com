const { __, _x, _n, _nx } = wp.i18n;
export default {
  data() {
    return {
      userID: this.$route.params.id,
      user: {
        editData: {
          username: '',
          first_name: '',
          last_name: '',
          roles: [],
          user_email: '',
          userNotes: '',
          passWord: '',
          uip_profile_image: '',
          uip_user_group: [],
        },
      },
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
        saveUser: __('Save user', 'uipress-lite'),
        newUser: __('New user', 'uipress-lite'),
        username: __('Username', 'uipress-lite'),
        password: __('Password', 'uipress-lite'),
      },
    };
  },

  methods: {
    /**
     * Saves user data
     *
     * @since 3.2.0
     */
    async saveUser() {
      let formData = new FormData();
      formData.append('action', 'uip_add_new_user');
      formData.append('security', this.AjaxSecurity);
      formData.append('user', JSON.stringify(this.user.editData));

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      this.uipApp.notifications.notify(response.message, '', 'success', true);

      this.uipApp.refreshTable();
      this.$router.push('/users/' + response.userID);
    },
  },
  template: ` 
      <FloatingPanel :startOpen="true" :closer="()=>$router.push('/')">
      
        <div class="uip-flex uip-flex-grow uip-flex-column uip-max-h-100p uip-row-gap-s uip-padding-m uip-h-100p">
        
          <!--Header-->
          <div class="uip-flex uip-flex-column uip-row-gap-xs" >
            
            <!-- OVERVIEW -->
            <div class="uip-flex uip-flex-center uip-gap-s">
              
              <div class="uip-flex uip-flex-column uip-flex-grow">
                <div class="uip-text-bold uip-text-l uip-text-emphasis">{{strings.newUser}}</div>
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
                <span>{{strings.username}}</span>
              </div>
              <input type="text" class="uip-input uip-w-100p" v-model="user.editData.username">
              
              <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
                <span>{{strings.password}}</span>
              </div>
              <input type="password" class="uip-input uip-w-100p" v-model="user.editData.password">
              
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
              <UserRoleSelect :selected="user.editData.roles"
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
            <button class="uip-button-primary uip-flex-grow" @click="saveUser()">{{strings.saveUser}}</button>
          </div>
          
        
        </div>  
      
      </FloatingPanel>`,
};
