const { __, _x, _n, _nx } = wp.i18n;
import { VueDraggableNext } from '../../../libs/VueDraggableNext.js';

const orderList = {
  components: {
    uipDraggable: VueDraggableNext,
  },
  props: {
    parent: Object,
    search: String,
    fetchMore: Function,
  },
  data() {
    return {
      cancelNotes: '',
      strings: {
        loadMore: __('Load more', 'uipress-pro'),
        cancelOrder: __('Cancel order', 'uipress-pro'),
        cancellationNotes: __('Cancellation notes', 'uipress-pro'),
        emptyColumn: __('No orders found with this status'),
      },
    };
  },
  methods: {
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

    /**
     * Returns color for state
     *
     * @param {string} state
     * @since 3.2.0
     */
    returnStateColor(state) {
      return 'background-color:' + this.parent.color;
    },

    /**
     * Item added event
     *
     * @param {object} evt
     * @since 3.2.0
     */
    itemAdded(evt) {
      if (evt.added) {
        this.parent.found = parseInt(this.parent.found) + 1;
        this.updateOrderStatus(evt.added.element);
      }
      if (evt.removed) {
        if (parseInt(this.parent.found) > 0) {
          this.parent.found = parseInt(this.parent.found) - 1;
        }
        setTimeout(() => {
          this.fetchMore(this.parent, true);
        }, 1000);
      }
    },

    /**
     * Updates an order status
     *
     * @param {object} order
     * @param {string} status
     * @param {number} index
     * @since 3.2.0
     */
    async updateOrderStatus(order, status, index) {
      if (typeof status === 'undefined') {
        status = this.parent.name;
      }

      let formData = new FormData();
      formData.append('action', 'uip_update_order_status');
      formData.append('security', uip_ajax.security);
      formData.append('orderID', order.ID);
      formData.append('newStatus', status);
      formData.append('cancelNotes', this.cancelNotes);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error');
      }
      if (response.success) {
        this.uipApp.notifications.notify(__('Order updated', 'uipress-pro'), '', 'success');
        if (status == 'cancelled') {
          this.parent.orders.splice(index, 1);
        }
      }
    },

    /**
     * Returns quick edit url
     *
     * @param {string} link
     * @since 3.2.0
     */
    returnQuickEdit(link) {
      let url = new URL(link);
      url.searchParams.set('uip-framed-page', 1);
      return url.href;
    },
  },
  template: `
    
    
    <div>
      
      <!--HEADER-->
      <div class="uip-border-dashed uip-border-round uip-padding-xs uip-text-center uip-text-muted" v-if="parent.orders.length < 1" style="border-color:var(--uip-border-color)">
        {{strings.emptyColumn}}
      </div>
      
      <uipDraggable v-if="parent.orders" 
      :class="parent.orders.length < 1 ? 'uip-min-h-32' : ''"
      :list="parent.orders" 
      class="uip-flex uip-flex-column uip-max-w-100p"
      :group="{ name: 'uip-orders', pull: true, put: true, revertClone: true }"
      animation="300"
      @start="drag = true" 
      @end="drag = false" 
      @change="itemAdded"
      handle=".uip-drag-handle"
      :sort="false"
      itemKey="id">
      
        <template v-for="(order, index) in parent.orders" :key="order.id" :index="index">
      
          
          <div class="uip-border-round uip-padding-xs uip-border uip-shadow-small uip-background-default uip-cursor-drag uip-order-card">
          
            <div class="uip-flex uip-flex-row uip-gap-xs">
            
              <div class="uip-flex uip-gap-s uip-flex-start uip-drag-handle uip-flex-grow">
                <div class="uip-border-circle uip-w-22 uip-ratio-1-1 uip-background-cover" :style="'background-image:url(' + order.img + ')'"></div>
                
                <div class="uip-flex-grow uip-flex uip-flex-column uip-row-gap-xxs">
                
                  <div class="uip-text-emphasis">{{order.customerName}}</div>
                  
                  <div class="uip-flex uip-gap-xxs uip-flex-center uip-text-s uip-text-muted uip-flex-wrap">
                  
                    <div class="" v-html="order.total"></div>
                    
                    <div class="">{{order.modified}}</div>
                    
                  </div>
                
                </div>
                
                <div class="uip-border-round uip-padding-xxxs uip-post-type-label uip-flex uip-gap-xxs uip-flex-center uip-text-bold uip-tag-label uip-text-s" :style="returnStateColor(parent)">{{order.orderID}}</div>
              </div>
              
              <div class="">
              
                <dropdown pos="bottom right">
                
                  <template v-slot:trigger>
                    <div class="uip-icon uip-text-l uip-link-default">more_vert</div>
                  </template>
                  
                  <template v-slot:content>
                    
                    <div class="uip-padding-xs uip-flex uip-flex-column uip-row-gap-xxs uip-border-bottom">
                      
                      <uip-offcanvas position="right" style="padding:0;width:600px;max-width:90%">
                        <template v-slot:trigger>
                          <div class="uip-flex uip-gap-xs uip-link-default">
                            <div class="uip-icon uip-text-l">visibility</div>
                            <div class="">Quick view</div>
                          </div>
                        </template>
                        <template v-slot:content>
                          
                          <iframe class="uip-w-100p uip-h-viewport" :src="returnQuickEdit(order.editLink)"></iframe>
                          
                        </template>
                      </uip-offcanvas>
                      
                      <a class="uip-flex uip-gap-xs uip-link-default uip-no-underline" :href="order.editLink">
                        <div class="uip-icon uip-text-l">edit</div>
                        <div class="">Edit</div>
                      </a>
                    
                    </div>
                    
                    
                    <div class="uip-padding-xs uip-flex uip-flex-column uip-row-gap-xxs">
                    
                      <div class="uip-flex uip-gap-xs uip-link-danger uip-no-underline">
                        <div class="uip-icon uip-text-l">cancel</div>
                        
                        <dropdown pos="bottom right">
                          <template v-slot:trigger>
                            <div class="">{{strings.cancelOrder}}</div>
                          </template>
                          <template v-slot:content>
                            <div class="uip-padding-xs uip-flex uip-flex-column uip-row-gap-xs">
                              <textarea rows="4" class="uip-input" v-model="cancelNotes" :placeholder="strings.cancellationNotes + '...'"></textarea>
                              <button class="uip-button-danger" @click="updateOrderStatus(order, 'cancelled', index)">{{strings.cancelOrder}}</button>
                            </div>
                          </template>
                        </dropdown>    
                      </div>
                    
                    </div>
                    
                  </template>
                 
                </dropdown>  
              
              </div>
              
            </div>
            
          </div>
          
        </template>
        
        <!--FOOTER-->
        <template #footer >
          
          <div class="uip-flex uip-flex-center uip-flex-middle uip-padding-s" v-if="parent.loading"><loading-chart></loading-chart></div>
        
          <div class="uip-flex uip-gap-xxs uip-link-muted uip-margin-top-xs uip-flex-center" v-if="parent.orders.length < parent.found" @click="fetchMore(parent)">
            <div class="uip-icon">add</div>
            <div>{{strings.loadMore}}</div>
          </div>
          
        </template>
      
      </uipDraggable>
    
    </div>
    `,
};

export default {
  components: {
    OrderList: orderList,
  },
  props: {
    display: String,
    name: String,
    block: Object,
  },
  data() {
    return {
      searchString: '',
      globalLoading: false,
      strings: {
        nothingFound: __('No posts found', 'uipress-pro'),
        by: __('By', 'uipress-pro'),
        order: __('Order', 'uipress-pro'),
        status: __('Status', 'uipress-pro'),
        total: __('Total', 'uipress-pro'),
        searchOrders: __('Search by customer name or email', 'uipress-pro'),
        loadMore: __('Load more', 'uipress-pro'),
      },
      searching: false,
      states: {
        onHold: {
          page: 1,
          totalPages: 0,
          found: 0,
          label: __('On hold', 'uipress-pro'),
          name: 'on-hold',
          orders: [],
          color: 'var(--uip-color-red-lighter)',
        },
        pendingPayment: {
          page: 1,
          totalPages: 0,
          found: 0,
          label: __('Payment pending', 'uipress-pro'),
          name: 'pending',
          orders: [],
          color: 'var(--uip-color-orange-lighter)',
        },
        processing: {
          page: 1,
          totalPages: 0,
          found: 0,
          label: __('Processing', 'uipress-pro'),
          name: 'processing',
          orders: [],
          color: 'var(--uip-color-green-lighter)',
        },
        completed: {
          page: 1,
          totalPages: 0,
          found: 0,
          label: __('Completed', 'uipress-pro'),
          name: 'completed',
          orders: [],
          color: 'var(--uip-color-primary-lighter)',
        },
      },
    };
  },
  mounted() {
    this.getOrders();
  },
  watch: {
    /**
     * Watches search string
     *
     * @since 3.2.0
     */
    searchString: {
      handler(newValue, oldValue) {
        if (newValue != '') return;
        for (let state in this.states) {
          this.states[state].page = 1;
        }
        this.getOrders();
      },
      deep: true,
    },
  },
  computed: {
    /**
     * Returns current page
     *
     * @since 3.2.0
     */
    returnPerPage() {
      return this.block.settings.block.options.postsPerPage.value;
    },

    /**
     * Returns states
     *
     * @since 3.2.0
     */
    returnStates() {
      return this.states;
    },

    /**
     * Returns whether search exists
     *
     * @returns {boolean}
     * @since 3.2.0
     */
    returnSearch() {
      return this.get_block_option(this.block, 'block', 'hideSearch');
    },
  },
  methods: {
    /**
     * Fire order search
     *
     * @since 3.2.0
     */
    fireFromSearch() {
      for (let state in this.states) {
        this.states[state].page = 1;
      }
      this.getOrders();
    },

    /**
     * Get's orders
     *
     * @returns {Promise}
     * @since 3.2.0
     */
    async getOrders() {
      // Query already running
      if (this.globalLoading) return;

      this.globalLoading = true;

      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_get_orders_for_kanban');
      formData.append('security', uip_ajax.security);
      formData.append('states', JSON.stringify(this.returnStates));
      formData.append('search', this.searchString);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handle error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        this.globalLoading = false;
      }
      if (response.success) {
        this.globalLoading = false;
        this.states = response.states;
      }
    },

    /**
     * Get's orders by state
     *
     * @param {string} state - description
     * @param {boolean} keepPage - keeps current page
     * @since 3.2.0
     */
    async getStateOrders(state, keepPage) {
      // Update page
      if (!keepPage) {
        state.loading = true;
        state.page = parseInt(state.page) + 1;
      }

      //Build form data for fetch request
      let formData = new FormData();
      formData.append('action', 'uip_get_orders_for_kanban_by_state');
      formData.append('security', uip_ajax.security);
      formData.append('state', JSON.stringify(state));
      formData.append('search', this.searchString);

      const response = await this.sendServerRequest(uip_ajax.ajax_url, formData);

      // Handles error
      if (response.error) {
        this.uipApp.notifications.notify(response.message, '', 'error', true);
        state.loading = false;
      }
      if (response.success) {
        state.loading = false;
        state.orders = response.state.orders;
        state.found = response.state.found;
      }
    },
  },
  template: `
      <div class="uip-flex uip-flex-column uip-row-gap-s">
        
        
        <div class="uip-flex uip-margin-bottom-xs" v-if="!returnSearch">
          <div class="uip-flex uip-padding-xxs uip-border uip-search-block uip-border-round uip-min-w-300">
              <span class="uip-icon uip-text-muted uip-margin-right-xs uip-text-l uip-icon uip-icon-medium">search</span>
              <input class="uip-blank-input uip-flex-grow uip-text-s" type="text" :placeholder="strings.searchOrders" v-model="searchString" v-on:keyup.enter="fireFromSearch()">
              <span class="uip-icon uip-text-muted uip-margin-right-xs uip-text-l uip-icon uip-icon-medium" v-if="searchString != ''">keyboard_return</span>
          </div>
        </div>
        
        <div class="uip-grid-col-4 uip-list-area" style="--grid-layout-gap:var(--uip-margin-m);--grid-item--min-width:220px">
        
           <template v-for="state in returnStates">
                
                <div class="uip-flex-grow uip-flex uip-flex-column uip-gap-s">
                
                  <!--title area-->
                  <div class="uip-flex uip-gap-xs uip-flex-center">
                    <div class="uip-text-muted uip-status-title">{{state.label}}</div>
                    <div class="uip-border-round uip-padding-left-xxs uip-padding-right-xxs uip-text-s uip-background-muted" >
                      {{state.found}}
                    </div>
                  </div>
                  <!--title area-->
                  
                  
                  <!--Order area-->
                  <div class="uip-flex uip-flex-column uip-row-gap-xs">
                  
                    <div class="uip-flex uip-flex-center uip-flex-middle uip-padding-s" v-if="globalLoading"><loading-chart/></div>
                    <OrderList v-else :parent="state" :updateOrders="function(d){state.orders == d}" :fetchMore="getStateOrders"/>
                    
                  </div>
                  <!--End of order area-->
                  
                </div>
                
           </template>
        
        </div>
          
      </div>`,
};
