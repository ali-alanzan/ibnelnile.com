const { __, _x, _n, _nx } = wp.i18n;
export default {
  name: 'content-folder',
  props: {
    folder: Object,
    removeSelf: Function,
    updateID: Function,
  },
  data() {
    return {
      loading: false,
      open: false,
      counter: 0,
      strings: {
        placeholder: __('Input placeholder...', 'uipress-pro'),
        new: __('New', 'uipress-pro'),
        loadMore: __('Load more', 'uipress-pro'),
        search: __('Search', 'uipress-pro'),
        view: __('View', 'uipress-pro'),
        editFolder: __('Edit folder', 'uipress-pro'),
        deleteFolder: __('Delete folder', 'uipress-pro'),
        folders: __('Folders', 'uipress-pro'),
        duplicate: __('Duplicate', 'uipress-pro'),
        folderName: __('Folder name', 'uipress-pro'),
        folderColor: __('Folder colour', 'uipress-pro'),
        update: __('Update', 'uipress-pro'),
        edit: __('Edit', 'uipress-pro'),
        updateFolder: __('Update folder', 'uipress-pro'),
        newFolder: __('New folder', 'uipress-pro'),
      },
    };
  },
  computed: {
    /**
     * Request new folder screen with parent
     *
     * @since 3.2.0
     */
    requestNewFolderScreen() {
      return {
        component: 'NewFolder',
        label: this.strings.newFolder,
        list: this.folder.content,
        parent: this.folder.id,
      };
    },
    /**
     * Requests update folder screen
     *
     * @since 3.2.0
     */
    requestUpdateFolderScreen() {
      return {
        component: 'UpdateFolder',
        label: this.strings.updateFolder,
        folder: this.folder,
        returnData: (d) => {
          this.folder.title = d.title;
          this.folder.color = d.color;
          this.$emit('go-back');
        },
      };
    },
  },
  beforeUnmount() {
    document.removeEventListener(`uipress/folders/${this.folder.id}/content/removed`, this.handleItemRemoved);
  },
  mounted() {
    document.addEventListener(`uipress/folders/${this.folder.id}/content/removed`, this.handleItemRemoved);
  },
  methods: {
    /**
     * Handles items removed event
     *
     * @param {object} event
     * @since 3.2.08
     */
    handleItemRemoved(event) {
      const itemsRemoved = event.detail.removedCount;
      this.folder.count = this.folder.count - itemsRemoved;
    },

    /**
     * Gets folder content
     *
     * @param {boolean} showLoad
     * @since 3.2.0
     */
    async getFolderContent(showLoad) {
      // Id we should show loading state
      if (showLoad) this.folder.loading = true;

      // Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_folders_get_folder_content');
      formData.append('security', this.AjaxSecurity);
      formData.append('limitToAuthor', this.limitToAuthor);
      formData.append('postType', this.postType);
      formData.append('id', this.folder.id);
      formData.append('limitToType', this.limitToType);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);
      this.folder.loading = false;

      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      this.folder.totalFound = response.totalFound;
      this.folder.count = response.folderCount;
      this.folder.content = response.content;
    },

    /**
     * Deletes the current folder
     *
     * @since 3.2.0
     */
    async deleteFolder() {
      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_folders_delete_folder');
      formData.append('security', this.AjaxSecurity);
      formData.append('postType', this.postType);
      formData.append('folderId', this.folder.id);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);
      this.folder.loading = false;

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }

      if (response.success) {
        this.removeSelf(this.folder.id);
        this.uipApp.notifications.notify(__('Folder deleted', 'uipress-pro'), '', 'success', true);
      }
    },

    /**
     * Adds drop class to folders when posts are dragged over
     *
     * @param {object} evt - the drag event
     * @since 3.2.0
     */
    addDropClass(evt) {
      evt.preventDefault();
      const target = evt.currentTarget;
      target.classList.add('uip-background-muted');
      this.counter++;
    },

    /**
     * Removes drop class to folders when posts are dragged away
     *
     * @param {object} evt - the drag event
     * @since 3.2.0
     */
    removeDropClass(evt, folder) {
      evt.preventDefault();
      this.counter--;
      if (this.counter === 0) {
        const target = evt.currentTarget;
        target.classList.remove('uip-background-muted');
      }
    },

    /**
     * Finishes drag and removes classes
     *
     * @param {object} evt - the drag event
     * @since 3.2.0
     */
    finishDrag(evt) {
      evt.preventDefault();
      const target = evt.currentTarget;
      target.classList.remove('uip-background-muted');
      this.folderMove.showRemoveFromFolder = false;
    },

    /**
     * Sets drag data on drag start
     *
     * @param {object} evt - drag start event
     * @since 3.2.0
     */
    setFolderDataTransfer(evt) {
      evt.dataTransfer.setData('itemID', JSON.stringify([this.folder.id]));
      evt.dataTransfer.setData('parentFolder', this.folder.parent);
    },

    /**
     * Handles posts / images dragged into folders
     *
     * @param {object} evt - the drop event
     * @param {object} folder - the folder object
     * @since 3.2.0
     */
    async addToFolder(evt, folder) {
      // Remove classes and finish drag event
      this.finishDrag(evt);

      let itemIDs = evt.dataTransfer.getData('itemID');

      // Not set / incompatible drag
      if (!itemIDs) return;

      // Parse and check for length. Exit early if no ids
      itemIDs = JSON.parse(itemIDs);
      if (itemIDs.length < 1) return;

      const parentFolder = evt.dataTransfer.getData('parentFolder');

      // Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_folders_add_item_to_folder');
      formData.append('security', this.AjaxSecurity);
      formData.append('IDS', JSON.stringify(itemIDs));
      formData.append('newParent', this.folder.id);
      formData.append('parentFolder', parentFolder);
      formData.append('postType', this.postType);
      formData.append('limitToType', this.limitToType);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);
      this.folder.loading = false;

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      this.folder.count += itemIDs.length;
      this.uipApp.notifications.notify(response.message, '', 'success', true);
    },

    /**
     * Deletes a folder by id
     *
     * @param {number} id
     * @since 3.2.0
     */
    deleteFromList(id) {
      const index = this.folder.content.findIndex((item) => item.id === id);
      if (index < 0) return;
      this.folder.content.splice(index, 1);
    },
  },
  template: `
  
  
      <div :data-id="folder.id" :data-parent-folder="folder.parent" class="uip-folder">
      
        <div @contextmenu.prevent="$refs.folderOptions.show($event)" class="uip-flex uip-gap-xs uip-flex-center uip-text-s uip-padding-xxs uip-border-rounder" 
        @click="open=true;getFolderContent(true);activeFolder.id = folder.id"
        :class="activeFolder.id === folder.id ? 'uip-background-muted uip-text-emphasis' : 'hover:uip-background-muted uip-link-default'"
        @drop.prevent.stop="addToFolder($event)" 
        @dragenter="addDropClass($event, folder)"
        @dragleave="removeDropClass($event, folder)"
        @dragenter.prevent @dragover.prevent>
          
          <div @click.prevent.stop="open = !open;getFolderContent(true)" class="uip-link-muted">
            <div class="uip-icon" v-if="!open">chevron_right</div>
            <div class="uip-icon" v-if="open">expand_more</div>
          </div>
          
          <div class="uip-w-8 uip-ratio-1-1" :style="'border-radius:3px;background:' + folder.color"></div>
          
          <div class="uip-flex-grow">{{folder.title}}</div>
          
          <div class="uip-text-muted uip-padding-right-xxs">{{folder.count}}</div>
          
          <ContextMenu ref="folderOptions">
            
            <div class="uip-padding-xs uip-flex uip-flex-column uip-text-weight-normal uip-w-160" style="text-size:15px">
              
              <a @click="$emit('request-screen', requestNewFolderScreen);$refs.folderOptions.close()"
              class="uip-link-default uip-padding-xxs uip-border-rounder hover:uip-background-muted uip-no-underline uip-flex uip-flex-center uip-flex-between uip-gap-s uip-text-s">
                <span class="">{{strings.newFolder}}</span>
                <span class="uip-icon">add</span>
              </a>
              
              <a @click="$emit('request-screen', requestUpdateFolderScreen);$refs.folderOptions.close()"
              class="uip-link-default uip-padding-xxs uip-border-rounder hover:uip-background-muted uip-no-underline uip-flex uip-flex-center uip-flex-between uip-gap-s uip-text-s">
                <span class="">{{strings.editFolder}}</span>
                <span class="uip-icon">edit</span>
              </a>
              
            
              <a @click="deleteFolder();$refs.folderOptions.close()"
              class="uip-link-danger uip-padding-xxs uip-border-rounder hover:uip-background-muted uip-no-underline uip-flex uip-flex-center uip-flex-between uip-gap-s uip-text-s">
                <span class="">{{strings.deleteFolder}}</span>
                <span class="uip-icon">delete</span>
              </a>
            
            </div>
            
          </ContextMenu>
        
        </div>
        
        <uipDraggable v-if="open"
        class="uip-flex uip-flex-column uip-max-w-100p uip-margin-left-s uip-margin-top-xxs uip-min-h-18"
        :group="{ name: 'uip-folders', pull: true, put: true }" 
        :list="folder.content"
        @change="(evt) => folderMove.handler(evt, folder)"
        ghostClass="uip-canvas-ghost"
        animation="300"
        :sort="false">
        
          <template v-for="(subfolder, index) in folder.content" 
          :key="subfolder.id" :index="index">
          
            <content-folder @go-back="$emit('go-back')" 
            @request-screen="(d)=> $emit('request-screen', d)" :folder="subfolder" :removeSelf="(id)=>{deleteFromList(id)}"/>
          
          </template>
        
        </uipDraggable>
      
      
      </div>
      
     
      
      
      
      `,
};
