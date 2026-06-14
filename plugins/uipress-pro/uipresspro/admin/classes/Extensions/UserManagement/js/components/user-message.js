const { __, _x, _n, _nx } = wp.i18n;

export default {
  data() {
    return {
      quillEditor: '',
      showAllRecipients: false,
      strings: {
        newMessage: __('New message', 'uipress-lite'),
        recipients: __('Recipients', 'uipress-lite'),
        replyTo: __('Reply to', 'uipress-lite'),
        subject: __('Subject', 'uipress-lite'),
        message: __('Message', 'uipress-lite'),
        cancel: __('Cancel', 'uipress-lite'),
        sendMessage: __('Send message', 'uipress-lite'),
        others: __('Others', 'uipress-lite'),
      },
      message: {
        recipients: [],
        subject: '',
        message: '',
        replyTo: '',
      },
    };
  },
  created() {
    this.uipApp.messageUser = this;
  },
  computed: {
    /**
     * Returns blank message object
     *
     * @since 3.2.0
     */
    returnBlankMessage() {
      return {
        recipients: [],
        subject: '',
        message: '',
        replyTo: '',
      };
    },
  },
  methods: {
    /**
     * Opens the message panel;
     *
     * @param {Array} users
     * @since 3.2.0
     */
    show(users) {
      this.message = this.returnBlankMessage;

      const recipients = Array.isArray(users) ? users : [users];
      this.message.recipients = recipients;

      this.$refs.messagePanel.show();
    },

    /**
     * Sends message to selected users
     *
     * @since 3.2.0
     */
    async sendMessage() {
      let formData = new FormData();
      formData.append('action', 'uip_send_message');
      formData.append('security', this.AjaxSecurity);
      formData.append('message', JSON.stringify(this.message));

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error');
        return;
      }

      this.uipApp.notifications.notify(response.message, '', 'success');
      this.$refs.messagePanel.close();
    },
  },
  template: `
  
    <FloatingPanel ref="messagePanel" :startOpen="false">
    
      <div class="uip-flex uip-flex-grow uip-flex-column uip-max-h-100p uip-row-gap-s uip-padding-m uip-h-100p">
      
        <!--Header-->
        <div class="uip-flex uip-flex-center uip-gap-s">
          

          <div class="uip-text-bold uip-text-l uip-text-emphasis uip-flex-grow">{{strings.newMessage}}</div>
          
          
          <div class="uip-flex uip-text-l uip-self-flex-start">
            
            <a @click="$refs.messagePanel.close()" class="uip-link-muted hover:uip-background-muted uip-border-rounder uip-icon uip-padding-xxs">close</a>
            
          </div>
        
        </div>
        
        
        <!--Spacer-->
        <div></div>
        
        <!--Message Details-->
        <div class="uip-flex-grow">
          <div class="uip-grid-col-1-3 uip-padding-left-s">
          
            <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs uip-flex-start uip-padding-top-xxs">
              <span>{{strings.recipients}}</span>
            </div>
            
            <div v-if="message.recipients.length > 2 && !showAllRecipients" class="uip-flex uip-gap-xs uip-flex-wrap uip-max-h-280 uip-overflow-auto uip-margin-left-xxs uip-flex-center uip-margin-bottom-xs uip-overflow-visible" @click.stop.prevent="showAllRecipients = !showAllRecipients">
            
              <template v-for="(item, index) in message.recipients">
                
                <div v-if="index < 10" class="uip-background-primary-wash uip-border-round uip-padding-left-xxs uip-padding-right-xxs uip-text-bold uip-flex uip-gap-xxs uip-flex-center">
                  <span class="uip-text-s uip-max-w-100 uip-overflow-hidden uip-text-ellipsis uip-no-wrap">{{item.user_email}}</span>
                  <span class="uip-icon uip-link-muted uip-cursor-icon" @click.prevent.stop="message.recipients.splice(index, 1)">close</span>
                </div>
                
                <div v-else-if="index < 11" class="uip-link-muted uip-text-s uip-margin-left-xs">+{{message.recipients.length - 10}} {{strings.others}}</div>
                
              </template>
            </div>
            
            <div v-if="showAllRecipients || message.recipients.length < 3" class="uip-flex uip-flex-wrap uip-gap-xxs uip-row-gap-xxs uip-max-h-280 uip-overflow-auto">
            
              <template v-for="(item, index) in message.recipients">
              
                <div class="uip-background-primary-wash uip-border-round uip-padding-left-xxs uip-padding-right-xxs uip-text-bold uip-flex uip-gap-xxs uip-flex-center">
                  <span class="uip-text-s uip-max-w-100 uip-overflow-hidden uip-text-ellipsis uip-no-wrap">{{item.user_email}}</span>
                  <span class="uip-icon uip-link-muted uip-cursor-icon" @click.prevent.stop="message.recipients.splice(index, 1)">close</span>
                </div>
                
              </template>
              
            </div>
            
            <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
              <span>{{strings.replyTo}}</span>
            </div>
            <input type="email" class="uip-input uip-w-100p" v-model="message.replyTo">
            
            <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs">
              <span>{{strings.subject}}</span>
            </div>
            <input type="email" class="uip-input uip-w-100p" v-model="message.subject">
            
            <div class="uip-text-muted uip-flex uip-flex-center uip-gap-xs uip-flex-start uip-padding-top-xxs">
              <span>{{strings.message}}</span>
            </div>
            <RichTextEditor :value="message.message" :returnData="(d)=>message.message=d"/>
            
          
          </div>
        </div>  
        
        <div class="uip-flex uip-flex-between uip-gap-s">
          <router-link :to="'/'" class="uip-button-default uip-no-underline uip-flex-grow uip-text-center">{{strings.cancel}}</router-link>
          <button class="uip-button-primary uip-flex-grow" @click="sendMessage()">{{strings.sendMessage}}</button>
        </div>
        
        
      
      </div>
    
    </FloatingPanel>
    
   
      `,
};
