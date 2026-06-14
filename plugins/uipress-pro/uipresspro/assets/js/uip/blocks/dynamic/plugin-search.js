const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    display: String,
    name: String,
    block: Object,
  },
  data() {
    return {
      loading: false,
      search: '',
      plugins: [],
      page: 0,
      totalFound: 0,
      totalPages: 0,
      wpVersion: this.uipApp.data.dynamicOptions.wpversion.value,
      hasSearched: false,
      image: {
        pos: {},
      },
      strings: {
        placeholder: __('Input placeholder...', 'uipress-pro'),
        update: __('Update', 'uipress-pro'),
        install: __('Install', 'uipress-pro'),
        details: __('Details', 'uipress-pro'),
        newVersion: __('New verasion', 'uipress-pro'),
        watchOut: __('Watch out', 'uipress-pro'),
        watchOutDescription: __('This plugin has not been tested with your platform version', 'uipress-pro'),
        nothingFound: __('No plugins found for query', 'uipress-pro'),
        results: __('Results', 'uipress-pro'),
        activate: __('Activate', 'uipress-pro'),
        rating: __('Rating', 'uipress-pro'),
        lastUpdated: __('Last updated', 'uipress-pro'),
        downloads: __('Downloads', 'uipress-pro'),
        activeInstalls: __('Active installs', 'uipress-pro'),
        requiresWP: __('Requires wp', 'uipress-pro'),
        requiresPHP: __('Requires PHP', 'uipress-pro'),
        orHigher: __('or higher', 'uipress-pro'),
        images: __('Images', 'uipress-pro'),
      },
    };
  },
  computed: {
    /**
     * Returns plugin searchbar placeholder
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
     * Returns plugin list
     *
     * @since 3.2.0
     */
    returnPlugins() {
      return this.plugins;
    },
  },
  methods: {
    /**
     * Handles mouse move for navigating list
     *
     * @param {object} e - keydown event
     * @since 3.2.0
     */
    mouseMoveHandler(e) {
      const scoller = document.getElementById('uip-image-scroller');

      const dx = e.clientX - this.image.pos.x;
      const dy = e.clientY - this.image.pos.y;

      // Scroll the element
      scoller.scrollTop = this.image.pos.top - dy;
      scoller.scrollLeft = this.image.pos.left - dx;
    },

    /**
     * Handles mouse up for navigating list
     *
     * @param {object} e - keydown event
     * @since 3.2.0
     */
    mouseUpHandler() {
      const scoller = document.getElementById('uip-image-scroller');

      scoller.removeEventListener('mousemove', this.mouseMoveHandler);
      scoller.removeEventListener('mouseup', this.mouseUpHandler);

      scoller.style.cursor = 'grab';
      scoller.style.removeProperty('user-select');
    },

    /**
     * Handles mouse down for navigating list
     *
     * @param {object} e - keydown event
     * @since 3.2.0
     */
    mouseDownHandler(e) {
      const scoller = document.getElementById('uip-image-scroller');

      this.image.pos = {
        // The current scroll
        left: scoller.scrollLeft,
        top: scoller.scrollTop,
        // Get the current mouse position
        x: e.clientX,
        y: e.clientY,
      };

      scoller.style.cursor = 'grabbing';
      scoller.style.userSelect = 'none';

      scoller.addEventListener('mousemove', this.mouseMoveHandler);
      scoller.addEventListener('mouseup', this.mouseUpHandler);
    },

    /**
     * Get plugin updates
     *
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
     * Search plugins list
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async searchPlugins() {
      if (this.search == '') {
        this.plugins = [];
        return;
      }
      this.hasSearched = false;
      this.loading = true;
      let formData = new FormData();
      formData.append('action', 'uip_search_directory');
      formData.append('security', uip_ajax.security);
      formData.append('search', this.search);
      formData.append('page', this.page);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }
      this.loading = false;
      this.hasSearched = true;
      this.plugins = response.plugins;
      this.totalFound = response.totalFound;
      this.totalPages = response.totalPages;
    },

    /**
     * Returns a star rating string based on the provided rating.
     *
     * @param {number} rating - The rating to format.
     * @returns {string} - A string of HTML representing the star rating.
     */
    returnRating(rating) {
      const formattedRating = rating > 0 ? (rating / 20).toFixed(1) : 0;
      let stars = '';

      for (let x = 0; x < 5; x++) {
        if (formattedRating - x >= 1) {
          stars += '<span class="uip-icon-star"></span>';
        } else if (formattedRating - x >= 0.5) {
          stars += '<span class="uip-icon">star_half</span>';
        } else {
          stars += '<span class="uip-icon">star</span>';
        }
      }

      return stars;
    },

    /**
     * Get's list of plugin updates
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
     * Goes back in plugin list pagination
     *
     * @since 3.2.0
     */
    goBack() {
      if (this.page > 1) {
        this.page = this.page - 1;
        this.searchPlugins();
      }
    },

    /**
     * Goes forward in plugin list pagination
     *
     * @since 3.2.0
     */
    goForward() {
      if (this.page < this.totalPages) {
        this.page = this.page + 1;
        this.searchPlugins();
      }
    },

    /**
     * Installs a plugin
     *
     * @param {object} data - the plugin object
     * @returns {Promise}
     * @since 3.2.0
     */
    async installPlugin(data) {
      data[0].loading = true;
      let dlLink = data[0].download_link;

      let formData = new FormData();
      formData.append('action', 'uip_install_plugin');
      formData.append('security', uip_ajax.security);
      formData.append('downloadLink', dlLink);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData, true);

      // handle error
      if (response.error) return;

      data[0].loading = false;
      data[0].activateAvailable = true;
      const message = data[0].name + ' ' + __('was succesfully installed', 'uipress-pro');
      this.uipApp.notifications.notify(__('Success', 'uipress-pro'), message, 'success', true);
    },

    /**
     * Activates a plugin
     *
     * @param {object} data - plugin object
     * @since 3.2.0
     */
    async activatePlugin(data) {
      data[0].loading = true;
      let slug = data[0].slug;

      let formData = new FormData();
      formData.append('action', 'uip_activate_plugin');
      formData.append('security', uip_ajax.security);
      formData.append('slug', slug);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData, true);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        return;
      }

      data[0].loading = false;
      data[0].finished = true;
      data[0].activateAvailable = false;

      const message = data[0].name + ' ' + __('was succesfully activated. You may need to refresh the page for any menu links to update', 'uipress-pro');
      this.uipApp.notifications.notify(__('Success', 'uipress-pro'), message, 'success', true);
    },

    /**
     * Format plugin search results count
     *
     * @param {number} results
     * @since 3.2.0
     */
    formatResults(results) {
      return new Intl.NumberFormat(this.uipApp.data.options.locale).format(results);
    },

    /**
     * Formats date to a readable data
     *
     * @param {string} thedate
     * @since 3.2.0
     */
    formatToReadable(thedate) {
      let dateString = thedate.split(' ')[0];
      let timeString = thedate.split(' ')[1];
      let timeZone = thedate.split(' ')[2];

      let startDate = new Date(Date.parse(dateString));
      return this.timeSince(startDate, new Date());
    },

    /**
     * Returns whether the plugin is installed
     *
     * @param {string} slug
     * @returns {boolean}
     * @since 3.2.0
     */
    isInstalled(slug) {
      let pluginString = JSON.stringify(this.uipApp.data.options.installedPlugins);
      return pluginString.includes(slug) ? true : false;
    },

    /**
     * Returns whether the current plugin is active
     *
     * @param {string} slug
     * @returns {boolean}
     * @since 3.2.0
     */
    isActive(slug) {
      let pluginString = JSON.stringify(this.uipApp.data.options.activePlugins);
      return pluginString.includes(slug) ? true : false;
    },

    /**
     * Returns a human-readable string representing the time difference between two dates.
     *
     * @param {Date} date1 - The earlier date.
     * @param {Date} date2 - The later date.
     * @returns {string} - A string representing the time difference.
     * @since 3.2.0
     */
    timeSince(date1, date2) {
      const seconds = Math.floor((date2 - date1) / 1000);

      const timeIntervals = [
        { name: 'year', seconds: 31536000 },
        { name: 'month', seconds: 2592000 },
        { name: 'day', seconds: 86400 },
        { name: 'hour', seconds: 3600 },
        { name: 'minute', seconds: 60 },
      ];

      for (const { name, seconds: intervalSeconds } of timeIntervals) {
        const interval = Math.floor(seconds / intervalSeconds);
        if (interval >= 1) {
          return `${interval} ${name}${interval > 1 ? 's' : ''}`;
        }
      }

      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    },
  },

  template: `
    <div>
      <div class="uip-flex uip-flex-column uip-row-gap-s uip-max-h-viewport">
        
        <div class="uip-flex uip-padding-xxs uip-border uip-border-round uip-search-block uip-flex-grow uip-gap-xs uip-flex-center uip-search-input">
          <span class="uip-icon uip-text-muted ">search</span>
          <input v-model="search" class="uip-blank-input uip-flex-grow uip-text-s" type="text" :placeholder="returnPlaceHolder" autofocus="" v-on:keyup.enter="searchPlugins">
          <span class="uip-icon uip-text-muted  uip-text-muted">keyboard_return</span>
        </div>
        
        <div v-if="loading" class="uip-padding-m uip-flex uip-flex-center uip-flex-middle"><loading-chart></loading-chart></div>
        <div v-else-if="returnPlugins.length > 0" class="uip-grid-col-4 uip-grid-min-width-medium uip-grid-gap-m uip-padding-xxs uip-max-h-viewport uip-overflow-hidden uip-scrollbar">
        
          <div class="uip-flex uip-flex-center uip-gap-xs uip-text-muted" v-if="returnPlugins.length < 1 && search != '' && !loading && hasSearched">
            <span>{{strings.nothingFound}}</span>
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
          
            <div v-for="(item, index) in returnPlugins" class="uip-flex uip-flex-column uip-row-gap-xs uip-border-round " :key="item.name">
              <div class="uip-flex uip-flex-row uip-gap-s uip-flex-no-wrap uip-flex-center uip-cursor-pointer" @click="item.open = !item.open">
              
                <img :src="Object.values(item.icons)[0]" class="uip-border uip-border-circle uip-w-28 uip-ratio-1-1"> 
                
                <div class=" uip-flex-grow">
                  <div class=" uip-line-height-1 uip-overflow-hidden uip-no-wrap uip-text-ellipsis uip-margin-bottom-xxs" v-html="item.name"></div>
                  
                  <div class="uip-flex uip-flex-row uip-no-wrap uip-text-m uip-text-muted" v-html="returnRating(item.rating)"></div>
                  
                </div>
                
              </div>
              
              <template v-if="item.open">
              
                <div class="uip-text-muted uip-text-s uip-scale-in-center" v-html="item.short_description">
                </div>
                
                
                
                <div class="uip-flex uip-flex-row uip-flex-center uip-gap-xs uip-scale-in-center">
                
                  <template v-if="!item.finished">
                  
                    <div v-if="!item.activateAvailable && !isInstalled(item.slug)" class="">
                      <uip-save-button :saving="item.loading" size="small"
                      :saveFunction="installPlugin" :saveArg="[item, index]" :buttonText="strings.install">
                      </uip-save-button>
                    </div>
                    
                    <div v-if="item.activateAvailable || (!isActive(item.slug) && isInstalled(item.slug))" class="">
                      <uip-save-button :saving="item.loading" size="small" :buttonSecondary="true"
                      :saveFunction="activatePlugin" :saveArg="[item, index]" :buttonText="strings.activate">
                      </uip-save-button>
                    </div>
                    
                  </template>
                  
                  
                    <button @click="$refs['detailsModal'+index][0].open()" class="uip-button-default uip-flex uip-gap-xxs uip-no-underline uip-background-grey uip-link-default">
                      <span class="uip-text-s uip-line-height-1">{{strings.details}}</span>
                    </button>
                    
                    <uipModal :ref="'detailsModal'+index">
                      
                        <div class="uip-flex uip-flex-column uip-row-gap-m uip-max-width-100p uip-overflow-hidden uip-scrollbar-hidden  uip-max-w-700" style="overflow-y:auto">
                      
                          <div class="uip-padding-m uip-padding-remove-bottom uip-flex uip-flex-column uip-row-gap-m">
                            <div class="uip-flex uip-flex-row uip-gap-s uip-flex-no-wrap uip-flex-center uip-cursor-pointer">
                            
                              <img :src="Object.values(item.icons)[0]" class="uip-border uip-border-circle uip-w-50 uip-ratio-1-1"> 
                              
                              <div class=" uip-flex-grow">
                                <div class="uip-text-l" v-html="item.name"></div>
                                <a class="uip-text-muted uip-link-muted uip-no-underline" :href="item.homepage" target="_BLANK">{{item.author.replace(/<[^>]*>?/gm, '')}}</a>
                              </div>
                              
                            </div>
                            
                            <!--Meta-->
                            <div class="uip-flex uip-flex-row uip-gap-xs">
                            
                              <div class="uip-flex uip-flex-column uip-row-gap-xxxs uip-flex-center">
                                <div class="uip-text-muted uip-text-s uip-text-center">{{strings.rating}}</div>
                                <span class="uip-flex uip-flex-row uip-no-wrap uip-text-m uip-text-muted" v-html="returnRating(item.rating)"></span>
                              </div>
                              
                              <div class="uip-border-right"></div>
                              
                              <div class="uip-flex uip-flex-column uip-row-gap-xxxs uip-flex-center">
                                <div class="uip-text-muted uip-text-s uip-line-height-1 uip-text-center">{{strings.lastUpdated}}</div>
                                <span class="uip-text-m uip-text-muted">{{formatToReadable(item.last_updated)}}</span>
                              </div>
                              
                              <div class="uip-border-right"></div>
                              
                              <div class="uip-flex uip-flex-column uip-row-gap-xxxs uip-flex-center">
                                <div class="uip-text-muted uip-text-s uip-line-height-1 uip-text-center">{{strings.activeInstalls}}</div>
                                <span class="uip-text-m uip-text-muted uip-text-bold">{{formatResults(item.active_installs)}}+</span>
                              </div>
                              
                              <div class="uip-border-right"></div>
                              
                              <div class="uip-flex uip-flex-column uip-row-gap-xxxs uip-flex-center">
                                <div class="uip-text-muted uip-text-s uip-line-height-1 uip-text-center">{{strings.downloads}}</div>
                                <span class="uip-text-m uip-text-muted uip-text-bold">{{formatResults(item.downloaded)}}</span>
                              </div>
                              
                              <div class="uip-border-right"></div>
                              
                              <div class="uip-flex uip-flex-column uip-row-gap-xxxs uip-flex-center">
                                <div class="uip-text-muted uip-text-s uip-line-height-1 uip-text-center">{{strings.requiresWP}}</div>
                                <span class="uip-text-m uip-text-muted uip-text-bold">{{item.requires}} {{strings.orHigher}}</span>
                              </div>
                              
                              <div class="uip-border-right"></div>
                              
                              <div class="uip-flex uip-flex-column uip-row-gap-xxxs uip-flex-center">
                                <div class="uip-text-muted uip-text-s uip-line-height-1 uip-text-center">{{strings.requiresPHP}}</div>
                                <span class="uip-text-m uip-text-muted uip-text-bold">{{item.requires_php}} {{strings.orHigher}}</span>
                              </div>
                              
                              
                            </div>
                            <!--End Meta-->
                            
                            <div v-if="!item.finished" class="uip-flex uip-flex-row uip-gap-s">
                            
                                <div v-if="!item.activateAvailable && !isInstalled(item.slug)" class="">
                                  <uip-save-button :saving="item.loading" size="small"
                                  :saveFunction="installPlugin" :saveArg="[item, index]" :buttonText="strings.install">
                                  </uip-save-button>
                                </div>
                                
                                <div v-if="item.activateAvailable || (!isActive(item.slug) && isInstalled(item.slug))" class="">
                                  <uip-save-button :saving="item.loading" size="small" :buttonSecondary="true"
                                  :saveFunction="activatePlugin" :saveArg="[item, index]" :buttonText="strings.activate">
                                  </uip-save-button>
                                </div>
                                
                            </div>
                          </div>
                          
                          
                          <div class="uip-padding-m uip-padding-remove-top uip-padding-remove-bottom uip-max-h-500 uip-overflow-auto uip-scrollbar">
                          
                            <!-- Description -->
                            <div v-if="!item.showFull" class="uip-fade-bottom uip-cursor-pointer uip-max-h-150 uip-overflow-hidden" @click="item.showFull = true">
                              <div class="uip-text-muted uip-text-s uip-scale-in-center" v-html="item.description">
                              </div>
                            </div>
                            
                            <div v-if="item.showFull" class="uip-text-muted uip-text-s uip-scale-in-center uip-max-w-100p uip-scale-in" v-html="item.description">
                            </div>
                            <!--End description -->
                          
                          </div>
                          
                         
                          
                          
                          <div class="uip-padding-left-m uip-padding-right-m uip-text-bold">{{strings.images}}</div>
                          
                          <div id="uip-image-scroller" class="uip-max-w-100p uip-overflow-auto uip-scrollbar-hidden uip-flex uip-padding-bottom-m" @mousedown="mouseDownHandler" @mouseup="mouseUpHandler">
                          
                            <template v-for="img in item.screenshots">
                              <img :src="img.src" :alt="img.caption" class="uip-max-h-200 uip-border-round uip-border uip-margin-left-m uip-remove-drag">
                            </template>
                          
                          </div>
                          
                        
                        
                        </div>
                      
                    </uipModal>
                    
                </div>
                
                
                
                <div v-if="wpVersion > item.tested" class="uip-background-orange-wash uip-padding-xs uip-border-round uip-scale-in-center">
                  <div class="uip-text-bold">{{strings.watchOut}}</div>
                  <div class="uip-text-muted uip-text-s">{{strings.watchOutDescription}}</div>
                </div>
              
              </template>
              
            </div>
          
          </TransitionGroup>
        </div>
        
        <div v-if="hasSearched" class="uip-flex uip-flex-between uip-flex-center uip-w-100p">
          <div class="uip-padding-xxs uip-post-count">{{formatResults(totalFound)}} {{strings.results}}</div>
          <div class="uip-flex uip-gap-xs uip-padding-xs" v-if="totalPages > 1">
            <button @click="goBack" class="uip-button-default uip-icon uip-nav-button">chevron_left</button>
            <button @click="goForward" v-if="page < totalPages" class="uip-button-default uip-icon uip-nav-button">chevron_right</button>
          </div>
        </div>
        
      </div>
    </div>`,
};
