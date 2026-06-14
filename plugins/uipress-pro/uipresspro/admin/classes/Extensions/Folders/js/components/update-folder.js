const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    folder: Object,
    returnData: Function,
  },
  data() {
    return {
      currentFolder: this.returnDefault,
      strings: {
        newFolder: __('New folder', 'uipress-pro'),
        name: __('Name', 'uipress-pro'),
        colour: __('Colour', 'uipress-pro'),
        update: __('Update', 'uipress-pro'),
      },
    };
  },
  created() {
    this.injectProp();
  },
  watch: {
    folder: {
      handler() {
        this.injectProp();
      },
      deep: true,
    },
  },
  computed: {
    /**
     * Returns default folder
     *
     * @since 3.2.0
     */
    returnDefault() {
      return {
        name: '',
        color: 'rgb(108, 76, 203)',
      };
    },
  },
  methods: {
    /**
     * Injects prop value into app
     *
     * @since 3.2.0
     */
    injectProp() {
      this.currentFolder = this.isObject(this.folder) ? { ...this.folder } : this.returnDefault;
    },

    /**
     * Updates folder
     *
     * @since 3.2.0
     */
    async updateFolder() {
      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_folders_update_folder_details');
      formData.append('security', this.AjaxSecurity);
      formData.append('folderId', this.currentFolder.id);
      formData.append('title', this.currentFolder.title);
      formData.append('color', this.currentFolder.color);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      this.uipApp.notifications.notify(__('Folder updated', 'uipress-pro'), '', 'success', true);

      this.returnData(this.currentFolder);
    },
  },
  template: `
  
  <div class="uip-flex uip-flex-column uip-row-gap-xs">
  
    <div class="uip-grid-col-1-3 uip-padding-left-s">
    
      <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.name}}</span></div>
      <input type="text" v-model="currentFolder.title" class="uip-text-s uip-input-small">
      
      <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.colour}}</span></div>
      <color-picker :value="{value: currentFolder.color}"
      :args="{dropPosition:'right center', hasStyleManager:false}"
      class="uip-text-s"
      :returnData="(d)=>{currentFolder.color = d.value}"/>
    
    </div>
    
    <button :disabled="!currentFolder.title" class="uip-button-primary uip-text-s uip-margin-top-s" @click="updateFolder()">{{strings.update}}</button>
  
  </div>
		
		`,
};
