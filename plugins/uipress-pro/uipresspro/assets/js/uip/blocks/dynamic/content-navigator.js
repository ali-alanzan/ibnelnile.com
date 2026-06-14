const { __, _x, _n, _nx } = wp.i18n;
import { VueDraggableNext } from '../../../libs/VueDraggableNext.js';

const newFolder = {
  props: {
    parent: [String, Number],
    list: Array,
    incrementCount: Function,
  },
  data() {
    return {
      newFolder: {
        name: '',
        color: 'rgb(108, 76, 203)',
      },
      strings: {
        newFolder: __('New folder', 'uipress-pro'),
        folderName: __('Folder name', 'uipress-pro'),
        folderColor: __('Folder colour', 'uipress-pro'),
        create: __('Create', 'uipress-pro'),
      },
    };
  },
  methods: {
    /**
     * Creates a new folder
     *
     * @since 3.2.13
     */
    async createNewFolder() {
      // Bail if no folder name
      if (this.newFolder.name == '') {
        this.uipApp.notifications.notify(__('Folder name can not be blank', 'uipress-pro'), '', 'error', true);
        return;
      }

      let formData = new FormData();
      formData.append('action', 'uip_create_folder');
      formData.append('security', uip_ajax.security);
      formData.append('folderParent', this.parent);
      formData.append('folderName', this.newFolder.name);
      formData.append('folderColor', this.newFolder.color);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }
      if (response.success) {
        if (typeof this.incrementCount !== 'undefined') {
          this.incrementCount(1);
        }
        this.uipApp.notifications.notify(__('Folder created', 'uipress-pro'), '', 'success', true);
        if (this.isObject(response.folder)) {
          this.list.push(response.folder);
        }
      }
    },
  },
  template: `
    <dropdown pos="right top">
      <template v-slot:trigger>
        <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-link-muted uip-border-round uip-no-text-select uip-max-w-100p uip-padding-xxs uip-padding-top-xxxs uip-padding-bottom-xxxs">
          <div class="uip-icon uip-text-l">add</div>
          <div class="uip-overflow-hidden uip-text-ellipsis uip-no-wrap uip-flex-grow">{{strings.newFolder}}</div>
        </div>
      </template>
      <template v-slot:content>
        <div class="uip-padding-s uip-flex uip-flex-column uip-row-gap-xxs">
          <div class="uip-text-muted">{{strings.folderName}}</div>
          <input type="text" v-model="newFolder.name" class="uip-text-s uip-input-small">
          
          <div class="uip-text-muted uip-margin-top-xs">{{strings.folderColor}}</div>
          <div class="uip-background-muted uip-border-round uip-overflow-hidden uip-padding-xxs">
            <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
              <color-select :value="{value:newFolder.color}" :returnData="(data)=>{ newFolder.color = data.value}"/>
            </div>
          </div>
          
          <button class="uip-button-primary uip-text-s uip-margin-top-s" @click="createNewFolder()">{{strings.create}}</button>
        </div>
      </template>
    </dropdown>
    `,
};

const contentFolder = {
  name: 'ContentFolder',
  components: {
    UipDraggable: VueDraggableNext,
    NewFolder: newFolder,
  },
  props: {
    folder: Object,
    removeSelf: Function,
    currentID: [Number, String, Boolean],
    updateID: Function,
  },
  data() {
    return {
      loading: false,
      defaults: [],
      newFolder: {
        name: '',
        color: 'rgb(108, 76, 203)',
      },
      strings: {
        placeholder: __('Input placeholder...', 'uipress-pro'),
        new: __('New', 'uipress-pro'),
        loadMore: __('Load more', 'uipress-pro'),
        search: __('Search', 'uipress-pro'),
        view: __('View', 'uipress-pro'),
        edit: __('Edit', 'uipress-pro'),
        delete: __('Delete', 'uipress-pro'),
        folders: __('Folders', 'uipress-pro'),
        duplicate: __('Duplicate', 'uipress-pro'),
        folderName: __('Folder name', 'uipress-pro'),
        folderColor: __('Folder colour', 'uipress-pro'),
        update: __('Update', 'uipress-pro'),
        edit: __('Edit', 'uipress-pro'),
      },
    };
  },
  inject: ['limitToauthor', 'defaultLinkType', 'postTypes'],
  methods: {
    /**
     * Opens folder and get's folders content
     *
     * @param {boolean} showLoad - whether to show the loading icon
     * @since 3.2.13
     */
    async getFolderContent(showLoad) {
      //Its closed so we don't need to fetch content
      if (!this.folder.open) {
        return;
      }

      if (!('page' in this.folder)) {
        this.folder.page = 1;
      }

      if (showLoad) {
        this.folder.loading = true;
      }

      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_get_folder_content');
      formData.append('security', uip_ajax.security);
      formData.append('limitToauthor', this.limitToauthor);
      formData.append('postTypes', JSON.stringify(this.postTypes));
      formData.append('page', this.folder.page);
      formData.append('search', this.folder.search);
      formData.append('id', this.folder.id);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);
      this.folder.loading = false;

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }

      if (response.success) {
        this.folder.totalFound = response.totalFound;
        if (this.folder.page > 1) {
          this.folder.content = this.folder.content.concat(response.content);
        } else {
          this.folder.content = response.content;
        }
      }
    },

    /**
     * Updates a folders params
     *
     * @param {object} item - the folder to update
     * @since 3.2.0
     */
    async updateItemFolder(item) {
      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_update_item_folder');
      formData.append('security', uip_ajax.security);
      formData.append('item', JSON.stringify(item));
      formData.append('newParent', this.folder.id);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);
      this.folder.loading = false;

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }
      if (response.success) {
        item.parent = this.folder.id;
      }
    },

    /**
     * Deletes a folder
     *
     * @since 3.2.13
     */
    async deleteFolder() {
      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_delete_folder');
      formData.append('security', uip_ajax.security);
      formData.append('postTypes', JSON.stringify(this.postTypes));
      formData.append('folderId', this.folder.id);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);
      this.folder.loading = false;

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }
      if (response.success) {
        this.removeSelf();
        this.uipApp.notifications.notify(__('Folder deleted', 'uipress-pro'), '', 'sucess', true);
      }
    },

    /**
     * Updates folder
     *
     * @since 3.2.13
     */
    async updateFolder() {
      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_update_folder');
      formData.append('security', uip_ajax.security);
      formData.append('folderId', this.folder.id);
      formData.append('title', this.folder.title);
      formData.append('color', this.folder.color);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }
      if (response.success) {
        this.uipApp.notifications.notify(__('Folder updated', 'uipress-pro'), '', 'sucess', true);
        this.folder.showEdit = false;
      }
    },

    /**
     * Duplicates a folder
     *
     * @param {object} item - folder object
     * @param {number} index - current index of folder
     * @since 3.2.0
     */
    async duplicateItem(item, index) {
      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_duplicate_post');
      formData.append('security', uip_ajax.security);
      formData.append('postID', item.id);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }
      if (response.success) {
        this.uipApp.notifications.notify(__('Item duplicated', 'uipress-pro'), '', 'sucess', true);
        let newItem = JSON.parse(JSON.stringify(item));
        newItem.id = response.newID;
        newItem.title = response.newTitle;
        newItem.draft = 'draft';
        this.folder.content.splice(index, 0, newItem);
      }
    },

    /**
     * Deletes post from folder
     *
     * @param {object} item - the item to delete
     * @param {number} index - items current index
     * @since 3.2.0
     */
    async deleteItem(item, index) {
      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_delete_post_from_folder');
      formData.append('security', uip_ajax.security);
      formData.append('postID', item.id);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }
      if (response.success) {
        this.uipApp.notifications.notify(__('Item deleted', 'uipress-pro'), '', 'sucess', true);
        this.folder.content.splice(index, 1);
        this.folder.totalFound -= 1;
        this.folder.count -= 1;
      }
    },

    /**
     * Handles new items added event
     *
     * @param {object} evt - the item added event
     * @since 3.2.0
     */
    itemAdded(evt) {
      if (evt.added) {
        //CHECK IF ITEM ALREADY EXISTS IN FOLDER
        let index = this.folder.content.filter((x) => x.id === evt.added.element.id);
        //It exists so remove it
        if (index.length > 1) {
          this.folder.content.splice(evt.added.newIndex, 1);
          return;
        }

        this.folder.content.sort(function (a, b) {
          let textA = a.title.toUpperCase();
          let textB = b.title.toUpperCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        });

        this.folder.count += 1;
        this.updateItemFolder(evt.added.element);
      }
      if (evt.removed) {
        this.folder.count -= 1;
        this.folder.totalFound -= 1;
      }
    },

    /**
     * Updates a post or page
     *
     * @param {Object} item - the item to update
     * @since 3.2.0
     */
    updatePage(item) {
      this.updateID(item.id);
      if (this.defaultLinkType == 'editPost') {
        this.updateAppPage(item.edit_href);
      } else {
        this.updateAppPage(item.view_href);
      }
    },

    /**
     * Loads more items from folder
     *
     * @param {object} folder - the folder object
     * @since 3.2.0
     */
    loadMore(folder) {
      folder.page += 1;
      this.getFolderContent();
    },

    /**
     * Checks for blank search
     *
     * @param {string} type
     * @since 3.2.0
     */
    checkForBlank(type) {
      if (type.search == '') {
        type.page = 1;
        this.getFolderContent(true);
      }
    },
  },
  template: `
    
    <div :data-id="folder.id">
  
  
      <!-- top folder -->
      <div class="uip-flex uip-flex-column uip-row-gap-xxs uip-max-w-100p">
      
        <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-link-default uip-padding-xxs uip-padding-top-xxxs uip-padding-bottom-xxxs hover:uip-background-muted uip-border-round uip-no-text-select" 
        :class="folder.open ? 'uip-background-muted' : ''">
          <div class="uip-icon uip-text-l" v-if="!folder.open" :style="'color:' + folder.color" @click="folder.open = !folder.open;getFolderContent(true)">folder</div>
          <div class="uip-icon uip-text-l" v-if="folder.open" :style="'color:' + folder.color" @click="folder.open = !folder.open;getFolderContent(true)">folder_open</div>
          <div class="uip-flex-grow" @click="folder.open = !folder.open;getFolderContent(true)">{{folder.title}}</div>
          <div class="uip-text-muted">{{folder.count}}</div>
          <dropdown pos="right top">
            <template v-slot:trigger>
              <div class="uip-icon uip-padding-xxxs uip-text-l hover:uip-background-muted uip-link-muted uip-border-round">more_vert</div>
            </template>
            <template v-slot:content>
              
              <div class="uip-flex uip-flex-column uip-w-200 uip-max-w-200">
              
                
                <!-- Update folders -->
                <div class="uip-padding-xs uip-border-bottom uip-flex uip-flex-column uip-gap-xxs" v-if="folder.showEdit">
                
                  <div class="uip-text-muted">{{strings.folderName}}</div>
                  <input type="text" v-model="folder.title" class="uip-text-s uip-input-small">
                  
                  <div class="uip-text-muted uip-margin-top-xs">{{strings.folderColor}}</div>
                  <div class="uip-background-muted uip-border-round uip-overflow-hidden uip-padding-xxs">
                    <div class="uip-flex uip-flex-row uip-gap-xxs uip-flex-center">
                      <color-select :value="{value:folder.color}" :returnData="(data)=>{ folder.color = data.value}"/>
                    </div>
                  </div>
                  
                  <button class="uip-button-primary uip-text-s uip-margin-top-s" @click="updateFolder()">{{strings.update}}</button>
                
                </div>
                
                <div class="uip-padding-xs uip-border-bottom uip-flex uip-flex-column uip-gap-xxs uip-flex-start">
                  <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-link-muted" @click="folder.showEdit = !folder.showEdit">
                    <div class="uip-icon uip-text-l">edit</div>
                    <div class="">{{strings.edit}}</div>
                  </div>
                </div>
                
                <div v-if="folder.canDelete"  class="uip-padding-xs uip-border-bottom uip-flex uip-flex-column uip-gap-xxxs uip-flex-start">
                  <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-link-danger" @click="deleteFolder()">
                    <div class="uip-icon uip-text-l">delete</div>
                    <div class="">{{strings.delete}}</div>
                  </div>
                </div>
                
              </div>
              
            </template>
          </dropdown>
        </div>
        
      </div> 
      
      <!-- Folder contents -->
      
      <div v-if="folder.open" class="uip-max-w-100p uip-scale-in-top-center">
        
        <div class="uip-flex uip-flex-column uip-row-gap-xxs uip-max-w-100p uip-padding-xxxs uip-margin-bottom-xs uip-margin-left-xs uip-padding-left-xs uip-padding-bottom-remove uip-before-border">
          
          
          <div class="uip-padding-s uip-flex uip-flex-middle uip-flex-center" v-if="folder.loading"><loading-chart></loading-chart></div>
          
          
          <template v-if="folder.count > 10">
          
            <!-- Search post types -->
            <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-text-muted uip-padding-xxs uip-padding-top-xxxs uip-padding-bottom-xxxs">
              <div class="uip-icon uip-text-l">search</div>
              <input class="uip-text-s uip-blank-input uip-flex-grow" :placeholder="strings.search" v-model="folder.search" @keyup="checkForBlank(folder)" v-on:keyup.enter="folder.page = 1; getFolderContent( true)">
              <div class="uip-icon uip-padding-xxxs uip-text-l uip-text-muted">keyboard_return</div>
            </div>
            
          
          </template>
          
          <NewFolder :list="folder.content" :incrementCount="function(e){folder.count += e}" :parent="folder.id"/>
          
          <!-- Loop through type content -->
          <UipDraggable v-if="folder.content && folder.content.length > 0" 
          :list="folder.content" 
          class="uip-flex uip-flex-column uip-max-w-100p"
          :group="{ name: 'post-defaults', pull: true, put: true, revertClone: true }"
          animation="300"
          @start="drag = true" 
          @end="drag = false" 
          @change="itemAdded"
          :sort="false"
          itemKey="id">
            
            
            <template v-for="(item, index) in folder.content" :key="item.id" :index="index">
            
              <ContentFolder v-if="item.type == 'uip-ui-folder'" :folder="item" :removeSelf="function(){folder.content.splice(index, 1)}" :currentID="currentID" :updateID="updateID"/>
            
              <div v-else class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-border-round uip-no-text-select uip-max-w-100p uip-padding-left-xxs uip-padding-right-xxs"
              :class="currentID == item.id ? 'uip-cursor-pointer' : 'uip-link-default'">
                
                
                <!-- Post status -->
                <div class="uip-flex uip-flex-center uip-flex-middle uip-w-16">
                  <div v-if="item.status == 'draft'" class="uip-w-5 uip-ratio-1-1 uip-border-circle uip-background-orange uip-display-block"></div>
                  <div v-else-if="item.status == 'publish' || item.status == 'inherit'" class="uip-w-5 uip-ratio-1-1 uip-border-circle uip-background-green uip-display-block"></div>
                  <div v-else class="uip-w-5 uip-ratio-1-1 uip-border-circle uip-background-accent uip-display-block"></div>
                </div>
                
                <div class="uip-overflow-hidden uip-text-ellipsis uip-no-wrap uip-flex-grow" @click="updatePage(item)" :class="currentID == item.id ? 'uip-text-accent' : ''">{{item.title}}</div>
                
                <dropdown pos="right top">
                  <template v-slot:trigger>
                    <div class="uip-icon uip-padding-xxxs uip-text-l hover:uip-background-muted uip-link-muted uip-border-round">more_vert</div>
                  </template>
                  <template v-slot:content>
                    
                    <div class="uip-flex uip-flex-column uip-w-200 uip-max-w-200">
                      
                      <div class="uip-padding-xs uip-border-bottom uip-flex uip-flex-column uip-gap-xs uip-flex-start">
                        <div class="uip-padding-xxs uip-border-round uip-text-xs uip-background-primary-wash uip-line-height-1">{{item.type}}</div>
                        <div class="">{{item.title}}</div>
                      </div>
                      
                      <div class="uip-padding-xs uip-border-bottom uip-flex uip-flex-column uip-gap-xxs uip-flex-start">
                        <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-link-muted" @click="updateID(item.id);updateAppPage(item.view_href)">
                          <div class="uip-icon uip-text-l">visibility</div>
                          <div class="">{{strings.view}}</div>
                        </div>
                        <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-link-muted" @click="updateID(item.id);updateAppPage(item.edit_href)">
                          <div class="uip-icon uip-text-l">edit</div>
                          <div class="">{{strings.edit}}</div>
                        </div>
                        <div v-if="item.type != 'attachment'" class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-link-muted" @click="duplicateItem(item, index)">
                          <div class="uip-icon uip-text-l">content_copy</div>
                          <div class="">{{strings.duplicate}}</div>
                        </div>
                      </div>
                      
                      <div v-if="item.canDelete" class="uip-padding-xs uip-border-bottom uip-flex uip-flex-column uip-gap-xxxs uip-flex-start">
                        <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-link-danger" @click="deleteItem(item, index)">
                          <div class="uip-icon uip-text-l">delete</div>
                          <div class="">{{strings.delete}}</div>
                        </div>
                      </div>
                      
                    </div>
                    
                  </template>
                </dropdown>
                
              </div>
            
            </template>
            
            <!--FOOTER-->
            <template v-if="folder.content" >
            
              <div v-if="folder.content.length > 1 && folder.content.length < folder.totalFound" class="uip-padding-right-xs">
                <div class="uip-text-s uip-link-muted uip-border-round uip-padding-xxs uip-padding-left-remove uip-display-inline-flex" @click="loadMore(folder)">{{strings.loadMore}}</div>
              </div>
              
            </template>
            
            
            
          </UipDraggable>
            
        </div>
        
      </div>
      <!--End folder contents -->
      
    </div>
    
    
    
    `,
};

export default {
  components: {
    UipDraggable: VueDraggableNext,
    ContentFolder: contentFolder,
    NewFolder: newFolder,
  },
  props: {
    display: String,
    name: String,
    block: Object,
  },
  data() {
    return {
      loading: false,
      defaults: [],
      currentID: false,
      baseFolders: [],
      limitToauthor: this.get_block_option(this.block, 'block', 'limitToAuthor'),
      strings: {
        placeholder: __('Input placeholder...', 'uipress-pro'),
        new: __('New', 'uipress-pro'),
        loadMore: __('Load more', 'uipress-pro'),
        search: __('Search', 'uipress-pro'),
        view: __('View', 'uipress-pro'),
        edit: __('Edit', 'uipress-pro'),
        duplicate: __('Duplicate', 'uipress-pro'),
        delete: __('Delete', 'uipress-pro'),
        folders: __('Folders', 'uipress-pro'),
        newFolder: __('New folder', 'uipress-pro'),
        folderName: __('Folder name', 'uipress-pro'),
        folderColor: __('Folder colour', 'uipress-pro'),
        create: __('Create', 'uipress-pro'),
      },
    };
  },
  provide() {
    return {
      limitToauthor: this.limitToauthor,
      currentID: this.currentID,
      defaultLinkType: this.getDefaultLinkType,
      postTypes: this.getPostTypes,
    };
  },
  inject: ['uiTemplate'],
  async mounted() {
    await this.$nextTick();
    this.getDefaults();
  },
  computed: {
    /**
     * Returns default link type
     *
     * @since 3.2.0
     */
    getDefaultLinkType() {
      let pos = this.get_block_option(this.block, 'block', 'defaultLink');
      pos = this.isObject(pos) ? pos.value : pos;
      if (!pos) return 'editPost';
      return pos;
    },

    /**
     * Returns chosen post types for block
     *
     * @since 3.2.0
     */
    getPostTypes() {
      return this.get_block_option(this.block, 'block', 'searchPostTypes');
    },

    /**
     * Returns current id
     *
     * @since 3.2.0
     */
    returnCurrentID() {
      return JSON.stringify(this.currentID);
    },
  },
  methods: {
    /**
     * Get's default post type lists
     *
     * @since 3.2.0
     */
    async getDefaults() {
      //Query already running
      if (this.loading) return;

      this.loading = true;
      let postTypes = [];
      if (typeof this.getPostTypes != 'undefined') {
        if (Array.isArray(this.getPostTypes)) {
          postTypes = this.getPostTypes;
        }
      }

      postTypes = JSON.stringify(postTypes);
      let limitToauthor = this.get_block_option(this.block, 'block', 'limitToAuthor');

      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_get_navigator_defaults');
      formData.append('security', uip_ajax.security);
      formData.append('limitToauthor', limitToauthor);
      formData.append('postTypes', postTypes);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);
      this.loading = false;

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }
      if (response.success) {
        this.baseFolders = response.baseFolders;
        this.defaults = response.postTypes;
      }
    },
    /**
     * Get's default content for given post type
     *
     * @param {string} type - post type
     * @param {boolean} showLoad - whether to show loading indicator
     * @since 3.2.0
     */
    async getDefaultContent(type, showLoad) {
      //Its closed so we don't need to fetch content
      if (!type.open) return;

      if (!('page' in type)) type.page = 1;

      if (showLoad) type.loading = true;

      let limitToauthor = this.get_block_option(this.block, 'block', 'limitToAuthor');
      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_get_default_content');
      formData.append('security', uip_ajax.security);
      formData.append('limitToauthor', limitToauthor);
      formData.append('postType', type.type);
      formData.append('page', type.page);
      formData.append('search', type.search);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);
      type.loading = false;

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }

      if (response.success) {
        type.totalFound = response.totalFound;
        if (type.page > 1) {
          type.content = type.content.concat(response.content);
        } else {
          type.content = response.content;
        }
      }
    },

    /**
     * Updates items folders
     *
     * @param {object} item - the item to update
     * @since 3.2.0
     */
    async updateItemFolder(item) {
      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_update_item_folder');
      formData.append('security', uip_ajax.security);
      formData.append('item', JSON.stringify(item));
      formData.append('newParent', 'uipfalse');

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }
      if (response.success) {
        item.parent = 'uipfalse';
      }
    },

    /**
     * Duplicates an item
     *
     * @param {object} item - the item to update
     * @param {number} index - the current index of the item
     * @param {array} list - the current list
     * @since 3.2.0
     */
    async duplicateItem(item, index, list) {
      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_duplicate_post');
      formData.append('security', uip_ajax.security);
      formData.append('postID', item.id);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }
      if (response.success) {
        this.uipApp.notifications.notify(__('Item duplicated', 'uipress-pro'), '', 'sucess', true);
        let newItem = JSON.parse(JSON.stringify(item));
        newItem.id = response.newID;
        newItem.title = response.newTitle;
        newItem.status = 'draft';
        list.splice(index, 0, newItem);
      }
    },

    /**
     * Deletes an item
     *
     * @param {object} item - the item to update
     * @param {number} index - the current index of the item
     * @param {array} list - the current list
     * @since 3.2.0
     */
    async deleteItem(item, index, list) {
      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_delete_post_from_folder');
      formData.append('security', uip_ajax.security);
      formData.append('postID', item.id);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);
      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
      }
      if (response.success) {
        this.uipApp.notifications.notify(__('Item deleted', 'uipress-pro'), '', 'sucess', true);
        list.content.splice(index, 1);
        list.totalFound -= 1;
      }
    },

    /**
     * Handles item added
     *
     * @param {object} evt - item added event
     * @since 3.2.0
     */
    itemAdded(evt) {
      if (evt.added) {
        if (evt.added.element.type !== 'uip-ui-folder') {
          this.baseFolders.splice(evt.added.newIndex, 1);
          this.uipApp.notifications.notify(__('Item removed from folder', 'uipress-pro'), '', 'error');
        }
        //CHECK IF ITEM ALREADY EXISTS IN FOLDER
        let index = this.baseFolders.filter((x) => x.id === evt.added.element.id);
        //It exists so remove it
        if (index.length > 1) {
          this.baseFolders.splice(evt.added.newIndex, 1);
          return;
        }

        this.baseFolders.sort(function (a, b) {
          let textA = a.title.toUpperCase();
          let textB = b.title.toUpperCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        });

        this.updateItemFolder(evt.added.element);
      }
    },

    /**
     * Updates the current page
     *
     * @param {object} item - the current item
     * @since 3.2.0
     */
    updatePage(item) {
      this.currentID = item.id;
      if (this.getDefaultLinkType == 'editPost') {
        this.updateAppPage(item.edit_href);
      } else {
        this.updateAppPage(item.view_href);
      }
    },

    /**
     * Adds a new post type
     *
     * @param {object} type - the type
     * @since 3.2.0
     */
    newPostType(type) {
      this.currentID = false;
      this.updateAppPage(type.new_href);
    },

    /**
     * Loads more content
     *
     * @param {object} type
     * @since 3.2.0
     */
    loadMore(type) {
      type.page += 1;
      this.getDefaultContent(type);
    },

    /**
     * Checks whether there is a search
     *
     * @param {object} type
     * @since 3.2.0
     */
    checkForBlank(type) {
      if (type.search == '') {
        type.page = 1;
        this.getDefaultContent(type, true);
      }
    },
  },
  template: `
    
    <div>
    
      <div class="uip-padding-s uip-flex uip-flex-middle uip-flex-center" v-if="loading"><loading-chart></loading-chart></div>
      
      <div class="uip-flex uip-flex-column uip-max-w-100p" v-else>
        <template v-for="type in defaults">
        
          <div class="uip-flex uip-flex-column uip-row-gap-xxs uip-max-w-100p">
          
            <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-link-default uip-padding-xxs hover:uip-background-muted uip-border-round uip-no-text-select" 
            :class="type.open ? 'uip-background-muted' : ''" @click="type.open = !type.open;getDefaultContent(type, true)">
              <div class="uip-icon uip-text-l">database</div>
              <div class="uip-flex-grow">{{type.label}}</div>
              <div class="uip-text-muted">{{type.count}}</div>
            </div>
            
            <div v-if="type.open" class="uip-max-w-100p uip-scale-in-top-center">
              
              
              <div class="uip-flex uip-flex-column uip-row-gap-xxs uip-max-w-100p uip-padding-xxxs uip-margin-bottom-xs uip-margin-left-s">
                
                <!-- Search post types -->
                <div v-if="type.count > 10" class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-no-text-select uip-max-w-100p">
                  <div class="uip-w-5 uip-ratio-1-1 uip-position-relative"><div class="uip-icon uip-position-absolute uip-top-50p uip-left-50p uip-translate-all-50p">search</div></div>
                  <input class="uip-text-s uip-blank-input uip-flex-grow" :placeholder="strings.search" v-model="type.search" @keyup="checkForBlank(type)" v-on:keyup.enter="type.page = 1; getDefaultContent(type, true)">
                  <div class="uip-icon uip-padding-xxxs uip-text-l uip-text-muted uip-border-round">keyboard_return</div>
                </div>
                
                <!-- new post type -->
                <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-link-default uip-border-round uip-no-text-select uip-max-w-100p" @click="newPostType(type)">
                  <div class="uip-w-5 uip-ratio-1-1 uip-position-relative"><div class="uip-icon uip-position-absolute uip-top-50p uip-left-50p uip-translate-all-50p">add</div></div>
                  <div class="uip-overflow-hidden uip-text-ellipsis uip-no-wrap uip-flex-grow">{{strings.new}} {{type.name}}</div>
                </div>
                
                <div class="uip-padding-s uip-flex uip-flex-middle uip-flex-center" v-if="type.loading"><loading-chart></loading-chart></div>
                
                <!-- Loop through type content -->
                <UipDraggable v-if="type.content && type.content.length > 0" 
                :list="type.content" 
                class="uip-flex uip-flex-column uip-max-w-100p"
                :group="{ name: 'post-defaults', pull: 'clone', put: false, revertClone: true }"
                animation="300"
                @start="drag = true" 
                @end="drag = false" 
                :sort="false"
                itemKey="id">
                
                  <template v-for="(item, index) in type.content" :key="type.id" :index="index">
                  
                    <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center uip-border-round uip-no-text-select uip-max-w-100p"
                    :class="currentID == item.id ? 'uip-cursor-pointer' : 'uip-link-default'">
                      
                      <div v-if="1==2" class="uip-cursor-pointer uip-background-muted uip-icon uip-border-round uip-block-drag">drag_indicator</div>
                      
                      <!-- Post status -->
                      <div v-if="item.status == 'draft'" class="uip-w-5 uip-ratio-1-1 uip-border-circle uip-background-orange uip-display-block"></div>
                      <div v-else-if="item.status == 'publish' || item.status == 'inherit'" class="uip-w-5 uip-ratio-1-1 uip-border-circle uip-background-green uip-display-block"></div>
                      <div v-else class="uip-w-5 uip-ratio-1-1 uip-border-circle uip-background-accent uip-display-block"></div>
                      
                      <div class="uip-overflow-hidden uip-text-ellipsis uip-no-wrap uip-flex-grow" @click="updatePage(item)" :class="currentID == item.id ? 'uip-text-accent' : ''">{{item.title}}</div>
                      
                      <dropdown pos="right top">
                        <template v-slot:trigger>
                          <div class="uip-icon uip-padding-xxxs uip-text-l hover:uip-background-muted uip-link-muted uip-border-round">more_vert</div>
                        </template>
                        <template v-slot:content>
                          
                          <div class="uip-flex uip-flex-column uip-max-w-200 uip-text-default">
                            
                            <div class="uip-padding-xs uip-border-bottom uip-flex uip-flex-column uip-gap-xs uip-flex-start">
                              <div class="uip-padding-xxs uip-border-round uip-text-xs uip-background-primary-wash uip-line-height-1">{{item.type}}</div>
                              <div class="">{{item.title}}</div>
                            </div>
                            
                            <div class="uip-padding-xs uip-border-bottom uip-flex uip-flex-column uip-gap-xxs">
                            
                              <a :href="item.view_href" 
                              class="uip-no-underline uip-flex uip-flex-row uip-gap-s uip-flex-center uip-link-muted uip-flex-reverse uip-flex-between" 
                              @click="currentID = item.id;updateAppPage(item.view_href)">
                                <div class="uip-icon uip-text-l">visibility</div>
                                <div class="">{{strings.view}}</div>
                              </a>
                              
                              <a :href="item.edit_href" 
                              class="uip-no-underline uip-flex uip-flex-row uip-gap-s uip-flex-center uip-link-muted uip-flex-reverse uip-flex-between" 
                              @click="currentID = item.id;updateAppPage(item.edit_href)">
                                <div class="uip-icon uip-text-l">edit</div>
                                <div class="">{{strings.edit}}</div>
                              </a>
                              
                              <div v-if="item.type != 'attachment'" class="uip-flex uip-flex-row uip-gap-s uip-flex-center uip-link-muted uip-flex-reverse uip-flex-between" @click="duplicateItem(item, index, type.content)">
                                <div class="uip-icon uip-text-l">content_copy</div>
                                <div class="">{{strings.duplicate}}</div>
                              </div>
                              
                            </div>
                            
                            <div v-if="item.canDelete" class="uip-padding-xs uip-border-bottom uip-flex uip-flex-column uip-gap-xxxs ">
                            
                              <div class="uip-flex uip-flex-row uip-gap-s uip-flex-center uip-link-danger uip-flex-reverse uip-flex-between" @click="deleteItem(item, index, type)">
                                <div class="uip-icon uip-text-l">delete</div>
                                <div class="">{{strings.delete}}</div>
                              </div>
                            </div>
                            
                          </div>
                          
                        </template>
                      </dropdown>
                      
                    </div>
                  
                  </template>
                  
                </UipDraggable>
                
                <div v-if="type.content.length < type.totalFound" class="uip-padding-right-xs">
                  <div class="uip-text-s uip-link-muted uip-border-round uip-padding-xxs uip-padding-left-remove uip-display-inline-flex" @click="loadMore(type)">{{strings.loadMore}}</div>
                </div>
                  
              </div>
              
            </div>
          
          </div>
          
        </template>
        
        <!-- End base folders -->
        
        <!-- User folders -->
        
        <div class="uip-text-muted uip-padding-xxs uip-margin-bottom-xxxs uip-margin-top-xxs">{{strings.folders}}</div>
        
        <!-- Loop through top level folders -->
        <div class="uip-max-w-100p">
        
          <UipDraggable v-if="baseFolders.length > 0"
          :list="baseFolders" 
          class="uip-flex uip-flex-column uip-max-w-100p"
          :group="{ name: 'user-folders', pull: true, put: true}"
          animation="300"
          @start="drag = true" 
          @end="drag = false" 
          @change="itemAdded"
          :sort="false"
          itemKey="id">
          
            <template v-for="(folder, index) in baseFolders" :key="folder.id" :index="index">
            
              <ContentFolder :folder="folder" :removeSelf="function(){baseFolders.splice(index, 1)}" :currentID="currentID" :updateID="function(d){currentID = d}"/>
            
            </template>
            

          
          </UipDraggable>
          
          <!--FOOTER-->
          <template>
            <NewFolder :list="baseFolders" parent="uipfalse"/>
          </template>
        
        </div>
        
      </div>
      
    </div>
    
    
    
    `,
};
