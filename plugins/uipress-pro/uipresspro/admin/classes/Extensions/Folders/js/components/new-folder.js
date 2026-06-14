const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    list: Array,
    parent: [Boolean, String, Number],
  },
  data() {
    return {
      newFolder: {
        name: '',
        color: 'rgb(108, 76, 203)',
      },
      strings: {
        newFolder: __('New folder', 'uipress-pro'),
        folderName: __('Name', 'uipress-pro'),
        folderColor: __('Colour', 'uipress-pro'),
        create: __('Create', 'uipress-pro'),
      },
    };
  },
  methods: {
    /**
     * Creates new folder
     *
     * @since 3.2.0
     */
    async createNewFolder() {
      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_folders_create_folder');
      formData.append('security', this.AjaxSecurity);
      formData.append('folderParent', this.parent);
      formData.append('folderName', this.newFolder.name);
      formData.append('folderColor', this.newFolder.color);
      formData.append('limitToType', this.limitToType);
      formData.append('postType', this.postType);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      this.uipApp.notifications.notify(__('Folder created', 'uipress-pro'), '', 'success', true);
      if (this.isObject(response.folder)) this.list.push(response.folder);

      this.$emit('go-back');
    },
  },
  template: `
  
  <div class="uip-flex uip-flex-column uip-row-gap-xs">
  
    <div class="uip-grid-col-1-3 uip-padding-left-s">
    
      <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.folderName}}</span></div>
      <input type="text" v-model="newFolder.name" class="uip-text-s uip-input-small">
      
      <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.folderColor}}</span></div>
      
      <color-picker :value="{value: newFolder.color}"
      :args="{dropPosition:'right center', hasStyleManager:false}"
      class="uip-text-s"
      :returnData="(d)=>{newFolder.color = d.value}"/>
    
    </div>
    
    <button :disabled="!newFolder.name" class="uip-button-primary uip-text-s uip-margin-top-s" @click="createNewFolder()">{{strings.create}}</button>
  
  </div>
		
		`,
};
