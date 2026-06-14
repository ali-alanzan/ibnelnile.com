const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    display: String,
    name: String,
    block: Object,
  },
  data() {
    return {
      loading: true,
      updates: [],
      wpVersion: this.uipApp.data.dynamicOptions.wpversion.value,
      strings: {
        placeholder: __('Input placeholder...', 'uipress-pro'),
        update: __('Update', 'uipress-pro'),
        details: __('Details', 'uipress-pro'),
        newVersion: __('New verasion', 'uipress-pro'),
        watchOut: __('Watch out', 'uipress-pro'),
        watchOutDescription: __('This plugin has not been tested with your platform version', 'uipress-pro'),
        noPluginUpdates: __('Plugins are all up to date', 'uipress-pro'),
      },
    };
  },
  mounted() {
    this.getPluginupdates();
  },
  computed: {
    /**
     * Returns plugin search bar placeholder
     *
     * @since 3.2.0
     */
    returnPlaceHolder() {
      const item = this.get_block_option(this.block, 'block', 'inputPlaceHolder', true);
      if (!item) return '';

      if (!this.isObject(item)) return item;
      if (item.string) return item.string;
      return '';
    },

    /**
     * Returns list of plugin updates
     *
     * @since 3.2.0
     */
    returnUpdates() {
      return this.updates;
    },
  },
  methods: {
    /**
     * Get's plugin updates
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async getPluginupdates() {
      let formData = new FormData();
      formData.append('action', 'uip_get_plugin_updates');
      formData.append('security', uip_ajax.security);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }
      this.loading = false;
      this.updates = response.updates;
    },

    /**
     * Updates a plugin
     *
     * @param {object} data - plugin object
     * @since 3.2.0
     */
    async updatePlugin(data) {
      data[0].loading = true;
      let slug = data[0].update.slug;

      let formData = new FormData();
      formData.append('action', 'uip_update_plugin');
      formData.append('security', uip_ajax.security);
      formData.append('slug', data[1]);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData, true);

      // Handle error
      if (response.error) return;

      delete this.updates[data[1]];
      data[0].loading = true;
      const message = data[0].Title + ' ' + __('was succesfully updated', 'uipress-pro');
      this.uipApp.notifications.notify(__('Success', 'uipress-pro'), message, 'success', true);
    },

    /**
     * Returns plugin icon
     *
     * @param {object} update
     * @since 3.2.0
     */
    returnIcon(update) {
      if (!('icons' in update)) return false;

      if (!('1x' in update.icons)) return false;

      return update.icons['1x'];
    },
  },

  template: `
      <div ref="uipmedialibrary">
        <div v-if="loading" class="uip-padding-m uip-flex uip-flex-center uip-flex-middle"><loading-chart></loading-chart></div>
        <div v-else class="uip-grid-col-4 uip-grid-min-width-medium uip-grid-gap-m">
        
          <div class="uip-flex uip-flex-center uip-gap-xs uip-text-muted" v-if="returnUpdates.length < 1">
            <span class="uip-icon">check_circle</span>
            <span>{{strings.noPluginUpdates}}</span>
          </div>
        
          <component is="style" scoped>
            .plugin-list-enter-active,
            .plugin-list-leave-active {
              transition: all 0.5s ease;
            }
            .plugin-list-enter-from,
            .plugin-list-leave-to {
              opacity: 0;
              transform: translateX(30px);
            }
          </component>
        
          <TransitionGroup name="plugin-list">
          
            <div v-for="(item, index) in returnUpdates" class="uip-flex uip-flex-column uip-row-gap-xs uip-border-round " :key="item.Title">
              <div class="uip-flex uip-flex-row uip-gap-s uip-flex-no-wrap uip-flex-center uip-cursor-pointer" @click="item.open = !item.open">
              
                <img v-if="returnIcon(item.update)" :src="returnIcon(item.update)" class="uip-border uip-border-circle uip-w-28 uip-ratio-1-1"> 
                <div v-else  class="uip-border uip-border-circle uip-w-28 uip-ratio-1-1 uip-background-primary"> </div>
                
                <div class=" uip-flex-grow">
                  <div class="uip-text-emphasis uip-line-height-1" >{{item.Title}}</div>
                  <a class="uip-text-muted uip-text-s uip-link-muted uip-no-underline" :href="item.PluginURI" target="_BLANK">{{item.Author}}</a>
                </div>
                
                <uip-tooltip :message="strings.newVersion" :delay="200">
                  <div class="uip-background-orange-wash uip-border-round uip-text-s uip-border-round uip-line-height-1 uip-padding-xxs uip-flex uip-flex-row uip-gap-xxxs uip-text-muted">
                    <span class="uip-icon">upgrade</span>
                    <span>{{item.update.new_version}}</span>
                  </div>
                </uip-tooltip>
                
              </div>
              
              <template v-if="item.open">
              
                <div class="uip-text-muted uip-text-s uip-scale-in-center" v-html="item.Description">
                </div>
                
                
                
                <div class="uip-flex uip-flex-row uip-flex-center uip-gap-xs uip-scale-in-center">
                  <div class="">
                    <uip-save-button :saving="item.loading" size="small"
                    :saveFunction="updatePlugin" :saveArg="[item, index]" :buttonText="strings.update">
                    </uip-save-button>
                  </div>
                  
                  <div class="">
                    <a :href="item.update.url" target="_BLANK" class="uip-button-default uip-flex uip-gap-xxs uip-no-underline uip-background-grey uip-link-default">
                    <span class=" uip-text-s uip-line-height-1">{{strings.details}}</span>
                    </a>
                  </div>
                </div>
                
                <div v-if="wpVersion > item.update.tested" class="uip-background-orange-wash uip-padding-xs uip-border-round uip-scale-in-center">
                  <div class="uip-text-bold">{{strings.watchOut}}</div>
                  <div class="uip-text-muted uip-text-s">{{strings.watchOutDescription}}</div>
                </div>
              
              </template>
              
            </div>
          
          </TransitionGroup>
          
          
        </div>
      </div>`,
};
