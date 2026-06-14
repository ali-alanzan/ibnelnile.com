const { __, _x, _n, _nx } = wp.i18n;

export default {
  props: {},
  data() {
    return {};
  },
  computed: {
    /**
     * Returns array of default items
     *
     * @since 3.2.0
     */
    returnDefaultitems() {
      const ID = this.createUID();
      const itemName = __('Custom link', 'uipress-pro');

      // Build menu item;
      const newItem = {
        0: itemName,
        1: 'read',
        2: ID,
        uip_uid: ID,
        type: 'custom',
        cleanName: itemName,
        customItem: true,
        custom: {
          name: itemName,
          icon: 'favorite',
          url: '',
        },
      };

      const sep = { ...newItem };
      const sepName = __('New separator', 'uipress-pro');
      sep.type = 'sep';
      sep.cleanName = sepName;
      sep.custom = {
        name: '',
      };
      sep[4] = 'wp-menu-separator';

      return [newItem, sep];
    },
  },
  methods: {
    /**
     * Returns whether the link is a separator
     *
     * @returns {boolean}
     * @since 3.2.0
     */
    isSeparator(item) {
      return item.type == 'sep' ? true : false;
    },

    /**
     * Returns items name or sep depending on type
     *
     * @since 3.2.0
     */
    returnItemName(item) {
      if (this.isSeparator(item)) return __('Separator', 'uipress-pro');
      return item.cleanName;
    },

    /**
     * Returns whether the current menu item has a submenu
     *
     * @since 3.2.0
     */
    returnItemSubmenu(item) {
      const id = item[2] ? item[2] : item.uip_uid;
      return this.uipGlobalMenu.submenu[id] ? this.uipGlobalMenu.submenu[id] : false;
    },
  },
  template: `
  
  
  <div class="uip-flex uip-flex-column uip-gap-s">
  
	<uipDraggable
	class="uip-flex uip-flex-column uip-max-w-100p uip-flex-grow"
	:group="{ name: 'uip-menu-items', pull: 'clone', put: false, revertClone: true }" 
	:list="returnDefaultitems"
	ghostClass="uip-canvas-ghost"
	dragHandle=".uip-drag-handle"
	animation="300"
	:sort="false">	  
	 
	    <template v-for="(item, index) in returnDefaultitems" :key="index" :index="index">
		 
			<div class="uip-drag-handle uip-flex uip-gap-xs uip-flex-center uip-link-emphasis uip-padding-xxs uip-border-rounder hover:uip-background-muted uip-transition-all">
			
				{{item.cleanName}}
			
			</div>
				
		</template>
			 
    </uipDraggable>
	  
	  
	<div class="uip-border-top"></div>
	  
	  	<uipDraggable
		class="uip-flex uip-flex-column uip-max-w-100p uip-flex-grow uip-max-h-300"
		style="overflow:auto" 
		:group="{ name: 'uip-menu-items', pull: 'clone', put: false, revertClone: true }" 
		:list="uipGlobalMenu.menu"
		ghostClass="uip-canvas-ghost"
		dragHandle=".uip-drag-handle"
		animation="300"
		:sort="false">
		
		  <template v-for="(item, index) in uipGlobalMenu.menu" :key="index" :index="index">
			
			<div class="uip-flex uip-flex-column uip-row-gap-xs">
			
				<div class="uip-drag-handle uip-flex uip-gap-xs uip-flex-center uip-link-emphasis uip-padding-xxs uip-border-rounder hover:uip-background-muted uip-transition-all">
			  	
			  		<div class="uip-flex-grow" :class="{'uip-text-muted' : isSeparator(item)}">{{returnItemName(item)}}</div>
				
				</div>
				
				
				<!--Submenu-->
				<uipDraggable
				v-if="returnItemSubmenu(item)"
				class="uip-flex uip-flex-column uip-max-w-100p uip-flex-grow uip-padding-left-s"
				:group="{ name: 'uip-menu-items', pull: 'clone', put: false, revertClone: true }" 
				:list="returnItemSubmenu(item)"
				ghostClass="uip-canvas-ghost"
				dragHandle=".uip-drag-handle"
				animation="300"
				:sort="false">
					
					<template v-for="(subitem, subindex) in returnItemSubmenu(item)" :key="subindex" :index="subindex">
					
						<div class="uip-drag-handle uip-flex uip-gap-xs uip-flex-center uip-link-emphasis uip-padding-xxs uip-border-rounder hover:uip-background-muted uip-transition-all">
						  
							<div class="uip-flex-grow" :class="{'uip-text-muted' : isSeparator(subitem)}">{{returnItemName(subitem)}}</div>
						
						</div>
					
					</template>
					
				</uipDraggable>	
			
			</div>
		  
		  </template>
		
		</uipDraggable>
		
  
  </div>
  
  
  `,
};
