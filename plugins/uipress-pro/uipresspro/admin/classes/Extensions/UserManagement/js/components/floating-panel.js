export default {
  props: {
    startOpen: Boolean,
    closer: Function,
  },
  data() {
    return {
      open: false,
    };
  },
  created() {
    this.open = this.startOpen ? true : false;
  },
  computed: {
    /**
     * Returns max height if set
     *
     * @since 3.2.13
     */
    returnClass() {
      if (this.constrainHeight) return 'uip-h-100p';
    },
  },
  methods: {
    /**
     * Closes the floating panel
     *
     * @since 3.2.13
     */
    show() {
      this.open = true;
    },
    /**
     * Closes the floating panel
     *
     * @since 3.2.13
     */
    close() {
      this.open = false;
      if (this.closer) this.closer();
    },
  },

  template: `
	  
	  
	  
	  <div v-if="open"
	  class="uip-position-fixed uip-w-100p uip-top-0 uip-bottom-0 uip-text-normal uip-flex uip-fade-in uip-transition-all uip-flex uip-flex-right"
	  style="background:rgba(0,0,0,0.3);z-index:9;top:0;left:0;right:0;max-height:100%;backdrop-filter: blur(1px);" @click="close($event)">
		
		<component is="style"> #wpadminbar{z-index:8;}#adminmenuwrap{z-index:7;} </component>
		  
		  
		  <div ref="offCanvasBody" @click.prevent.stop class="uip-w-440 uip-position-relative uip-padding-s uip-padding-right-remove uip-margin-right-s" 
		  style="max-height: 100%;min-height: 100%;height:100%">
	  
			<div class="uip-background-default uip-overflow-hidden uip-position-relative uip-shadow uip-h-100p"  
            style="max-height: 100%;min-height: 100%;height:100%;border-radius:calc(var(--uip-border-radius-large) + var(--uip-padding-xs));">
			  
			  <slot></slot>
			  
			</div>
			
		  </div>
		  
		
	  </div>
			  
			  
			  
			  `,
};
