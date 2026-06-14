const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    parent: [String, Number],
    list: Array,
    incrementCount: Function,
  },
  data() {
    return {
      loading: false,
      rendered: true,
      baseFolders: [],
      foldersOpen: true,
      dragging: false,
      foldersFor: false,
      allFiles: 0,
      count: 0,
      table: false,
      mediaBrowser: false,
      newFolder: {
        name: '',
        color: 'rgb(108, 76, 203)',
      },
      strings: {
        newFolder: __('New folder', 'uipress-pro'),
        folderName: __('Folder name', 'uipress-pro'),
        folderColor: __('Folder colour', 'uipress-pro'),
        create: __('Create', 'uipress-pro'),
        allItems: __('All items', 'uipress-pro'),
        folders: __('Folders', 'uipress-pro'),
        removeFromFolder: __('Remove from folder', 'uipress-pro'),
      },
    };
  },
  watch: {
    activeFolder: {
      handler() {
        if (this.foldersFor == 'posts') this.filterTableByFolder();
        if (this.foldersFor == 'wpmedia') this.filterMediaByFolder();
      },
      deep: true,
    },
  },
  async created() {
    // Wait for app to render before checking for base folders
    await this.$nextTick();
    this.getBaseFolders(true);
    this.folderMove.handler = this.handleFolderDrag;
  },
  /**
   * Removes event listeners before unload
   *
   * @since 3.2.0
   */
  beforeUnmount() {
    if (this.table) {
      this.table.removeEventListener('dragstart', this.handlePostTableItemDrag);
      this.table.addEventListener('dragend', this.handlePostTableItemDragEnd);
    }
    if (this.mediaBrowser) {
      this.mediaBrowser.removeEventListener('dragstart', this.handleMediaDragEvent);
      this.mediaBrowser.addEventListener('dragend', this.handlePostTableItemDragEnd);
    }
    document.removeEventListener('uipress/mediamodal/upload/before', this.handleBeforeModalUpload);
    document.removeEventListener('uipress/mediamodal/upload/added', this.handleAddedModalUpload);
    document.removeEventListener('uipress/mediamodal/upload/finished', this.handleFinishedModalUpload);
  },
  mounted() {
    this.mountEventListeners();
  },
  computed: {
    /**
     * Request new folder screen
     *
     * @since 3.2.0
     */
    requestNewFolderScreen() {
      return {
        component: 'NewFolder',
        label: this.strings.newFolder,
        value: [],
        list: this.baseFolders,
        parent: 'uipfalse',
      };
    },

    /**
     * Returns list of base folders
     *
     * @since 3.2.0
     */
    returnFolders() {
      return this.baseFolders;
    },
  },
  methods: {
    /**
     * Mounts events listeners
     *
     * @since 3.2.0
     */
    mountEventListeners() {
      if (this.postType == 'attachment' && wp.media) {
        this.foldersFor = 'wpmedia';
        this.mountMediaLibraryListeners();
      } else {
        this.foldersFor = 'posts';
        this.mounPostTableListeners();
      }
    },

    /**
     * Attaches listeners to drag events on posts table
     *
     * @since 3.2.0
     */
    mounPostTableListeners() {
      const postTable = document.querySelector('.wp-list-table');

      // If no post table exit
      if (!postTable) return;

      this.table = postTable;
      this.table.addEventListener('dragstart', this.handlePostTableItemDrag);
      this.table.addEventListener('dragend', this.handlePostTableItemDragEnd);
    },

    /**
     * Handles post items drag end event from table
     *
     * @param {DragEvent} event - The drag event object
     * @since 3.2.0
     */
    handlePostTableItemDragEnd(event) {
      this.folderMove.showRemoveFromFolder = false;
    },

    /**
     * Handles post items drag event from table
     *
     * @param {DragEvent} event - The drag event object
     * @since 3.2.0
     */
    handlePostTableItemDrag(event) {
      const allIds = this.getSelectedFileIds(event);

      if (allIds.length === 0) return;

      this.folderMove.showRemoveFromFolder = true;

      const folderID = event.target.getAttribute('data-folder-id');
      event.dataTransfer.setData('itemID', JSON.stringify(allIds));
      event.dataTransfer.setData('parentFolder', folderID);

      this.createDragImage(event, allIds);
    },

    /**
     * Retrieves selected file IDs from the event target or selected checkboxes.
     *
     * @param {Event} event - The event object
     * @returns {string[]} - An array of selected file IDs
     */
    getSelectedFileIds(event) {
      const selectedFiles = document.querySelectorAll('tbody .check-column input[type=checkbox]:checked');

      if (selectedFiles.length > 0) {
        return Array.from(selectedFiles).map((file) => file.value);
      }

      const singleFileId = event.target.getAttribute('data-id');
      return singleFileId ? [singleFileId] : [];
    },

    /**
     * Creates drag preview image for post tables items
     *
     * @param {object} event
     * @param {array} allIDS
     * @since 3.2.0
     */
    createDragImage(event, allIDS) {
      const itemMessage = __('item', 'uipress-pro');
      const itemsMessage = __('items', 'uipress-pro');
      const length = allIDS.length;
      const message = length > 1 ? `${length} ${itemsMessage}` : `${length} ${itemMessage}`;

      const elem = document.createElement('div');
      elem.id = 'uip-content-drag';
      elem.innerHTML = message;
      elem.style.position = 'absolute';
      elem.style.top = '-1000px';
      document.body.appendChild(elem);
      event.dataTransfer.setDragImage(elem, 0, 0);
    },

    /**
     * Mounts listeners on media library to watch for drag events
     *
     * @since 3.2.0
     */
    mountMediaLibraryListeners() {
      document.addEventListener('uipress/mediamodal/upload/before', this.handleBeforeModalUpload);
      document.addEventListener('uipress/mediamodal/upload/finished', this.handleFinishedModalUpload);
      document.addEventListener('uipress/mediamodal/upload/added', this.handleAddedModalUpload);

      this.mediaBrowser = document.querySelector('.attachments-browser');

      if (!this.mediaBrowser) return;
      this.mediaBrowser.addEventListener('dragstart', this.handleMediaDragEvent);
      this.mediaBrowser.addEventListener('dragend', this.handlePostTableItemDragEnd);
    },

    /**
     * Handles drag event on media files
     *
     * @since 3.2.0
     */
    handleMediaDragEvent(event) {
      let allIDS = [];

      this.folderMove.showRemoveFromFolder = true;

      // First let's check if we are dragging a single file or multiple
      let files = document.querySelectorAll('.attachments-browser .attachments .attachment[aria-checked=true]');
      if (files && files.length > 0) {
        files.forEach((div) => {
          allIDS.push(div.getAttribute('data-id'));
        });
      } else {
        let id = event.target.getAttribute('data-id');
        //No id so lets exit
        if (!id) return;
        allIDS.push(id);
      }

      let folderID = event.target.getAttribute('data-folder-id');

      event.dataTransfer.setData('itemID', JSON.stringify(allIDS));
      event.dataTransfer.setData('parentFolder', folderID);

      // Create drag image
      this.createDragImage(event, allIDS);
    },

    /**
     * Handles pre upload events from wp.uploader
     *
     * @param {object} evt - upload event
     * @since 3.2.0
     */
    handleBeforeModalUpload(evt) {
      const uploader = evt.detail.uploader;
      const file = evt.detail.file;
      uploader.settings.multipart_params.uip_folder_id = this.activeFolder.id;
    },

    /**
     * Handles finished upload events from wp.uploader
     *
     * @param {object} evt - upload event
     * @since 3.2.0
     */
    handleFinishedModalUpload(evt) {
      const uploader = evt.detail.uploader;
      const file = evt.detail.file;
      this.uipApp.notifications.notify(__('Upload finished ', 'uipress-lite'), '', 'success', true);
      //this.filterMediaByFolder();
    },

    /**
     * Handles individual file upload events from wp.uploader
     *
     * @param {object} evt - upload event
     * @since 3.2.0
     */
    handleAddedModalUpload(evt) {
      // If we are not in a folder then we don't need to do anything here, files will update automatically
      if (this.activeFolder.id == 'all') return;
      const uploader = evt.detail.uploader;
      const file = evt.detail.file;

      // Get modal attachment and push into list
      const attachment = wp.media.attachment(file.attachment.id);
      wp.media.frame.state().get('library').add(attachment);

      // Push notification about upload success
      this.uipApp.notifications.notify(__('File uploaded ', 'uipress-lite'), file.name, 'success', true);
    },

    /**
     * Get's top level folders
     *
     * @param {boolean} showLoad - whether to show loading state
     * @since 3.2.0
     */
    async getBaseFolders(showLoad) {
      // Query already running so exit
      if (this.loading) return;

      if (showLoad) this.loading = true;

      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_folders_get_base_folders');
      formData.append('security', this.AjaxSecurity);
      formData.append('limitToAuthor', this.limitToAuthor);
      formData.append('postType', this.postType);
      formData.append('limitToType', this.limitToType);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);
      this.loading = false;

      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }
      if (response.success) {
        this.baseFolders = [...response.baseFolders];
        this.allFiles = response.total;
      }
    },

    /**
     * Sets folder back to all
     *
     * @since 3.2.0
     */
    removeFilters() {
      this.activeFolder.id = 'all';
    },

    /**
     * Deletes item by id
     *
     * @param {string} id
     * @since 3.2.0
     */
    deleteFromList(id) {
      let index = this.baseFolders.findIndex((item) => item.id === id);
      if (index < 0) return;
      this.baseFolders.splice(index, 1);
    },

    /**
     * Handles changes to folders being moved by draggable
     *
     * @param {object} evt - the drag event
     * @param {array} list - the folders origin list
     * @since 3.2.0
     */
    handleFolderDrag(evt, list) {
      if (evt.added) this.handleFolderAdded(evt, list);
    },

    /**
     * Handles folder added event
     *
     * @param {object} evt - the drag event
     * @param {array} list - the folders origin list
     * @since 3.2.0
     */
    handleFolderAdded(evt, parent) {
      const folder = evt.added.element;
      const updateID = this.isObject(parent) ? parent.id : 'uipfalse';
      this.updateItemFolder(folder, updateID);
    },

    /**
     * Updates a folders parent folder
     *
     * @param {object} folder - the folder to update
     * @param {number} parentID - the new parent
     * @since 3.2.0
     */
    async updateItemFolder(folder, parentID) {
      // Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_folders_update_item_folder');
      formData.append('security', this.AjaxSecurity);
      formData.append('item', JSON.stringify(folder));
      formData.append('newParent', parentID);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      folder.parent = parentID;
    },

    /**
     * Filters pages result by folder ID
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async filterTableByFolder() {
      let searchParams = new URLSearchParams(window.location.search);
      let current = window.location.origin;
      searchParams.set('uip_folder', this.activeFolder.id);
      let newRelativePathQuery = current + window.location.pathname + '?' + searchParams.toString();

      fetch(newRelativePathQuery)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok' + response.statusText);
          }
          return response.text();
        })
        .then((data) => {
          let parser = new DOMParser();
          let newData = data.trim();
          let doc = parser.parseFromString(newData, 'text/html');
          let newContent = doc.querySelector('#wpbody-content .wrap');

          document.querySelector('#wpbody-content .wrap').replaceWith(newContent);
          this.mounPostTableListeners();
        })
        .catch((error) => {
          console.error('Fetch error: ', error);
          this.uipApp.notifications.notify(error.message, '', 'error', true);
        });
    },

    /**
     * Filters media result by folder ID
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async filterMediaByFolder() {
      // Exit early if no media frame
      if (!wp.media) return;

      let collection = this.returnMediaFrameCollection();
      // Exit early if collection is undefined
      if (!collection || typeof collection === 'undefined') return;

      // Update collections props to filter by id
      collection.props.set({ ignore: +new Date(), uip_folder_id: this.activeFolder.id });
    },

    /**
     * Returns the current collection for the media modal
     *
     * @since 3.2.0
     */
    returnMediaFrameCollection() {
      if (wp.media.frames.browse) {
        return wp.media.frames.browse.content.get().collection;
      }
      if (wp.media.frame) {
        return wp.media.frame.content.get().collection;
      }
    },

    /**
     * Handles posts / images being removed from folders
     *
     * @param {object} evt - the drop event
     * @param {object} folder - the folder object
     * @since 3.2.0
     */
    async removeFromFolder(evt) {
      const activeFolderID = this.activeFolder.id;

      let itemIDs = evt.dataTransfer.getData('itemID');

      // Not set / incompatible drag
      if (!itemIDs) return;

      // Parse and check for length. Exit early if no ids
      itemIDs = JSON.parse(itemIDs);
      if (itemIDs.length < 1) return;

      const parentFolder = evt.dataTransfer.getData('parentFolder');

      // Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_folders_remove_item_from_folder');
      formData.append('security', this.AjaxSecurity);
      formData.append('IDS', JSON.stringify(itemIDs));
      formData.append('currentFolder', activeFolderID);

      const response = await this.sendServerRequest(this.AjaxUrl, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      this.dispatchItemRemoveEvent(itemIDs.length);
      this.folderMove.showRemoveFromFolder = false;

      if (this.foldersFor == 'wpmedia') this.filterMediaByFolder();
      if (this.foldersFor == 'posts') this.filterTableByFolder();

      //this.folder.count += itemIDs.length;
      this.uipApp.notifications.notify(response.message, '', 'success', true);
    },

    /**
     * Dispatches a custom event to folders about removal
     *
     * @since 3.2.08
     */
    dispatchItemRemoveEvent(removedCount) {
      const activeFolderID = this.activeFolder.id;
      // Create a custom event with custom detail
      const customEvent = new CustomEvent(`uipress/folders/${activeFolderID}/content/removed`, {
        detail: { removedCount: removedCount },
      });

      document.dispatchEvent(customEvent);
    },
  },
  template: `
    <div class="uip-max-w-100p uip-flex uip-flex-column uip-row-gap-xs uip-transition-all uip-flex-grow">
      
        <div @click="removeFilters()" class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-link-default uip-padding-xxs hover:uip-background-muted uip-border-rounder uip-no-text-select uip-text-s" :class="{'uip-text-emphasis uip-background-muted' : activeFolder.id == 'all'}">
        
          <div @click.prevent.stop="$emit('request-screen', requestNewFolderScreen)"
          class="uip-icon uip-link-default">add</div>
          
          <div class="uip-flex-grow">{{strings.allItems}}</div>
          
          <div class="uip-text-muted uip-padding-right-xxs">{{allFiles}}</div>
          
        </div>
        
        
        
        
        <div ref="removeFromFolder"
        @drop.prevent.stop="removeFromFolder($event)" 
        @dragenter.prevent @dragover.prevent
        v-if="folderMove.showRemoveFromFolder && activeFolder.id && activeFolder.id != 'all'"
        class="uip-flex uip-flex-column uip-max-w-100p uip-padding-xxs uip-background-muted uip-border-rounder uip-text-muted uip-text-s uip-text-center uip-fade-in">
        
         {{strings.removeFromFolder}}
        
        </div>
      
      
        <!--Loading-->
        <div class="uip-padding-xs uip-flex uip-flex-middle uip-flex-center" v-if="loading"><loading-chart/></div>
          
        <template v-else>  
          
          <uipDraggable ref="folderList"
          class="uip-flex uip-flex-column uip-max-w-100p" 
          :group="{ name: 'uip-folders', pull: true, put: true, revertClone: false }" 
          :list="baseFolders"
          @change="(evt) => folderMove.handler(evt, false)"
          ghostClass="uip-canvas-ghost"
          animation="300"
          :sort="false">
          
            <template v-for="(folder, index) in returnFolders" 
            :key="folder.id" :index="index">
            
              <content-folder @request-screen="(d)=> $emit('request-screen', d)" 
              @go-back="$emit('go-back')" 
              :folder="folder" :removeSelf="(id)=>{deleteFromList(id)}"/>
            
            </template>
          
          </uipDraggable>
                  
        
        </template>
        
        
        
      
    </div>
		`,
};
