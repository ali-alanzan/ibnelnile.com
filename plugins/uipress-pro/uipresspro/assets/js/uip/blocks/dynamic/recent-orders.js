const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    display: String,
    name: String,
    block: Object,
  },
  data() {
    return {
      searchString: '',
      results: [],
      page: 1,
      totalPages: 0,
      perPage: this.block.settings.block.options.postsPerPage.value,
      postTypes: ['shop_order'],
      limitToAuthor: false,
      loading: false,
      strings: {
        nothingFound: __('No posts found', 'uipress-lite'),
        by: __('By', 'uipress-lite'),
        order: __('Order', 'uipress-lite'),
        status: __('Status', 'uipress-lite'),
        total: __('Total', 'uipress-lite'),
        searchOrders: __('Search orders', 'uipress-lite'),
      },
      searching: false,
    };
  },
  mounted() {
    this.getRecentOrders();
  },
  watch: {
    /**
     * Watches changes to page and updates list
     *
     * @since 3.2.0
     */
    page: {
      handler(newValue, oldValue) {
        this.getRecentOrders();
      },
      deep: true,
    },

    /**
     * Watches changes to per page and updates list
     *
     * @since 3.2.0
     */
    perPage: {
      handler(newValue, oldValue) {
        this.getRecentOrders();
      },
      deep: true,
    },

    /**
     * Watches changes to search and updates list
     *
     * @since 3.2.0
     */
    searchString: {
      handler(newValue, oldValue) {
        if (this.page != 1) {
          this.page = 1;
        } else {
          this.getRecentOrders();
        }
      },
      deep: true,
    },

    /**
     * Watches changes to per page and updates list
     *
     * @since 3.2.0
     */
    'block.settings.block.options.postsPerPage.value': {
      handler(newValue, oldValue) {
        this.getRecentOrders();
      },
      deep: true,
    },
  },
  computed: {
    /**
     * Returns items per page
     *
     * @since 3.2.0
     */
    returnPerPage() {
      return this.block.settings.block.options.postsPerPage.value;
    },

    /**
     * Returns whether the block has search
     *
     * @returns {boolean}
     * @since 3.2.0
     */
    hasSearch() {
      return this.get_block_option(this.block, 'block', 'hideSearch');
    },
  },
  methods: {
    async getRecentOrders() {
      //Query already running
      if (this.loading) return;

      this.loading = true;

      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_get_recent_orders');
      formData.append('security', uip_ajax.security);
      formData.append('search', this.searchString);
      formData.append('page', this.page);
      formData.append('perPage', this.returnPerPage);
      formData.append('searchString', this.searchString);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        this.searching = false;
        this.loading = false;
      }
      if (response.success) {
        this.loading = false;
        this.results = response.posts;
        this.totalPages = response.totalPages;
      }
    },

    /**
     * Handles backwards pagination
     *
     * @since 3.2.0
     */
    goBack() {
      if (this.page > 1) {
        this.page = this.page - 1;
      }
    },

    /**
     * Handles forwards pagination
     *
     * @since 3.2.0
     */
    goForward() {
      if (this.page < this.totalPages) {
        this.page = this.page + 1;
      }
    },

    /**
     * Returns status bg color
     *
     * @param {string} status
     * @since 3.2.0
     */
    returnStatusBG(status) {
      let claslList = 'uip-background-orange-wash';
      switch (status) {
        case 'completed':
          claslList = 'uip-background-primary-wash';
          break;
        case 'processing':
          claslList = 'uip-background-green-wash';
          break;
        case 'failed':
          claslList = 'uip-background-red-wash';
          break;
      }

      return claslList;
    },
  },
  template: `
			<div class="uip-flex uip-flex-column uip-row-gap-s">
			  <div class="uip-flex uip-flex-column uip-row-gap-xs uip-list-area">
			  
			  
			  	<div v-if="!hasSearch" class="uip-flex uip-padding-xxs uip-border uip-search-block uip-border-round uip-margin-bottom-s">
					  <span class="uip-icon uip-text-muted uip-margin-right-xs uip-text-l uip-icon uip-icon-medium">search</span>
					  <input class="uip-blank-input uip-flex-grow uip-text-s" type="search" :placeholder="strings.searchOrders" v-model="searchString">
				</div>
				  
				  
				<div v-if="loading" class="uip-flex uip-flex-center uip-flex-middle uip-padding-m"><loading-chart></loading-chart></div>
				
				
				
				
				
				<div v-if="!loading" class="uip-max-w-100p uip-overflow-auto uip-scrollbar">
					<table class="uip-min-w-250 uip-w-100p uip-table">
					  <thead>
						<tr class="">
						  <th class="uip-text-muted uip-text-weight-normal uip-text-left uip-padding-bottom-xxs">{{strings.order}}</th>
						  <th class="uip-text-muted uip-text-weight-normal uip-text-right uip-padding-bottom-xxs">{{strings.status}}</th>
						  <th class="uip-text-right uip-text-muted uip-text-weight-normal uip-padding-bottom-xxs">{{strings.total}}</th>
						</tr>
					  </thead>
					  <tbody>
						<tr v-for="item in results">
						  <td class="uip-text-bold uip-padding-bottom-xxs"><a class="uip-link-default uip-no-underline" :href="item.editLink">{{item.name}}</a></td>
						  
						  <td class="uip-text-right uip-padding-bottom-xxs uip-flex uip-flex-right">
						  	<div class="uip-text-s uip-border-round uip-padding-xxxs uip-post-type-label" :class="returnStatusBG(item.status)">{{item.status}}</div>
						  </td>
						  
						  <td class="uip-text-right uip-padding-bottom-xxs">
							<div class=" uip-background-orange-wash uip-border-round uip-padding-xxxs uip-post-type-label uip-flex uip-gap-xxs uip-flex-center uip-text-bold uip-tag-label uip-inline-flex">
							  <span class="" v-html="item.total"></span>
							</div>
						  </td>
						</tr>
					  </tbody>
					</table>
				</div>
				
				
				
				<div v-if="results.length == 0 && searchString.length > 0" class="uip-text-muted uip-text-s">
				  {{strings.nothingFound}}
				</div>
			  </div>
			  <div class="uip-flex uip-gap-xs" v-if="totalPages > 1">
				<button @click="goBack" class="uip-button-default uip-icon uip-nav-button">chevron_left</button>
				<button @click="goForward" v-if="page < totalPages" class="uip-button-default uip-icon uip-nav-button">chevron_right</button>
			  </div>
			</div>`,
};
