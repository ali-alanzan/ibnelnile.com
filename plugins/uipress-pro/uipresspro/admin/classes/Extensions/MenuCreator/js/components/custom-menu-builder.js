const { __, _x, _n, _nx } = wp.i18n;

const MenuItem = {
  name: 'MenuItem',
  props: {
    menuItem: { type: Object, default: {} },
    submenu: { type: Object, default: {} },
    topLevel: { type: Boolean, default: false },
    index: { type: Number, default: 0 },
    depth: { type: Number, default: 0 },
    list: { type: Array, default: [] },
  },
  data() {
    return {
      open: false,
      hover: false,
    };
  },
  async mounted() {
    await this.$nextTick();
  },
  computed: {
    /**
     * Returns menu links for cntext menu
     *
     * @since 3.2.0
     */
    returnMenuLinks() {
      return [
        {
          label: __('Edit', 'uipress-pro'),
          icon: 'edit',
          action: () => {
            this.requestEditScreen();
          },
        },
        {
          label: __('Duplicate', 'uipress-pro'),
          icon: 'content_copy',
          action: () => {
            const newItem = { ...this.menuItem };
            this.list.splice(this.index, 0, newItem);
          },
        },
        { name: 'divider' },
        {
          label: __('Delete', 'uipress-pro'),
          icon: 'delete',
          danger: true,
          action: () => {
            this.list.splice(this.index, 1);
          },
        },
      ];
    },
    /**
     * Returns the correct chevron icon depending on open status
     *
     * @since 32.0
     */
    returnChevronIcon() {
      if (this.isSeparator) return 'remove';
      return this.open ? 'expand_more' : 'chevron_right';
    },

    /**
     * Returns whether the current menu item has a submenu
     *
     * @since 3.2.0
     */
    returnItemSubmenu() {
      // Handle top level items submenu slightly differently
      if (this.topLevel) {
        let id = this.menuItem[2] ? this.menuItem[2] : this.menuItem.uip_uid;
        id = this.switchOutHtmlEntities(id);
        if (!this.submenu[id]) this.submenu[id] = [];
        return this.submenu[id];
      }

      // Handle non top level items
      if (!this.topLevel) {
        if (!Array.isArray(this.menuItem.submenu)) this.menuItem.submenu = [];
        return this.menuItem.submenu;
      }
    },

    /**
     * Returns whether the link is a separator
     *
     * @returns {boolean}
     * @since 3.2.0
     */
    isSeparator() {
      return this.menuItem.type == 'sep' ? true : false;
    },

    /**
     * Returns items name or sep depending on type
     *
     * @since 3.2.0
     */
    returnItemName() {
      if (this.isSeparator) return __('Separator', 'uipress-pro');
      return this.menuItem.custom.name ? this.menuItem.custom.name : this.menuItem.cleanName;
    },

    /**
     * Returns custom icon if exists, else returns false
     *
     * @since 3.2.0
     */
    returnCustomIcon() {
      return this.menuItem.custom.icon ? this.menuItem.custom.icon : false;
    },

    /**
     * Returns icon to represent current items visibility
     *
     * @since 3.2.0
     */
    returnVisibilityIcon() {
      return this.menuItem.custom.hidden ? 'visibility_off' : 'visibility';
    },
  },
  methods: {
    /**
     * Decodes html entities by adding to a text area
     *
     * @param {string} encodedString
     * @since 3.3.09
     */
    switchOutHtmlEntities(encodedString) {
      if (typeof encodedString !== 'string') return encodedString;

      let textArea = document.createElement('textarea');
      textArea.innerHTML = encodedString;
      let value = textArea.value;
      textArea.remove();
      return value;
    },
    /**
     * Request menu item editor screen
     *
     * @since 3.2.0
     */
    requestEditScreen() {
      const itemName = this.isSeparator ? __('separator', 'uipress-pro') : this.menuItem.cleanName;
      const editScreen = {
        component: 'ItemEditor',
        menuItem: this.menuItem,
        label: __('Edit', 'uipress-pro') + ' ' + itemName,
        returnData: (d) => {
          this.menuItem.custom = { ...d };
        },
      };
      this.$emit('request-screen', editScreen);
    },
  },
  template: `
          <div class="uip-flex uip-flex-column uip-row-gap-xs">
          
            <div @dblclick.prevent.stop="requestEditScreen()"
            @mouseenter="hover = true" @mouseleave="hover = false"
            @contextmenu.prevent.stop="$refs.contextMenu.show($event)"
            class="uip-flex uip-gap-xs uip-flex-center uip-link-emphasis uip-padding-xxs uip-border-rounder hover:uip-background-muted uip-transition-all" @click="open = !open">
            
              <div class="uip-icon uip-text-muted">{{ returnChevronIcon }}</div>
              
              <div class="uip-icon" v-if="returnCustomIcon">{{ returnCustomIcon }}</div>
              <div class="uip-flex-grow" :class="{'uip-text-muted' : isSeparator, 'uip-opacity-20' : menuItem.custom.hidden}">{{returnItemName}}</div>
              
              <div @click.prevent.stop="menuItem.custom.hidden = !menuItem.custom.hidden" class="uip-icon uip-link-default" v-if="hover">{{returnVisibilityIcon}}</div>
              <div @click.prevent.stop="$refs.contextMenu.show($event)" class="uip-icon uip-link-default">more_vert</div>
            
            </div>
            
            <div v-if="open && returnItemSubmenu && !isSeparator" class="uip-margin-left-s">
            
              <uipDraggable 
              class="uip-flex uip-flex-column uip-row-gap-xxxs uip-max-w-100p uip-min-h-18" 
              :group="{ name: 'uip-menu-items', pull: true, put: true }" 
              :list="returnItemSubmenu"
              ghostClass="uip-canvas-ghost"
              animation="300"
              :sort="true">
              
                <template v-for="(menu, index) in returnItemSubmenu" :key="index" :index="index">
                  
                  <MenuItem :depth="depth + 1"
                  @request-screen="(e)=>$emit('request-screen', e)"
                  @go-back="(e)=>$emit('go-back', e)"
                  :menuItem="menu" :topLevel="false" :submenu="submenu" :index="index" :list="returnItemSubmenu"/>
                
                </template>
              
              </uipDraggable>
            
            
            </div>
            
            <ContextMenu ref="contextMenu">
            
              <div class="uip-padding-xs uip-flex uip-flex-column uip-text-weight-normal uip-text-s">
              
                <template v-for="item in returnMenuLinks">
                
                  <div v-if="item.name == 'divider'" class="uip-border-top uip-margin-top-xxs uip-margin-bottom-xxs"></div>
                  
                  <a v-else
                  @click.prevent="item.action();$refs.contextMenu.close()"
                  class="uip-link-default uip-padding-xxs uip-border-rounder hover:uip-background-muted uip-no-underline uip-flex uip-flex-center uip-flex-between uip-gap-s"
                  :class="{ 'uip-link-danger' : item.danger }">
                  
                    <span class="">{{item.label}}</span>
                    
                    <span v-if="item.icon" class="uip-flex-no-shrink uip-icon" 
                    :class="{ 'uip-link-muted' : !item.danger }">{{item.icon}}</span>
                    
                   </a>
                </template>
               
              </div>   
            
            </contextMenu>
          
          
          </div>
  `,
};

/**
 * Toggle section
 *
 * @since 3.2.13
 */
const ToggleSection = {
  props: {
    title: String,
    startOpen: Boolean,
  },
  data() {
    return {
      open: false,
    };
  },
  mounted() {
    if (this.startOpen) this.open = true;
  },
  computed: {
    /**
     * Returns the icon depending on open status
     *
     * @since 3.2.13
     */
    returnVisibilityIcon() {
      return this.open ? 'expand_more' : 'chevron_left';
    },
  },
  methods: {
    /**
     * Toggles section visibility
     *
     * @since 3.2.13
     */
    toggleVisibility() {
      this.open = !this.open;
    },
  },
  template: `
  
    <div class="uip-flex uip-flex-column uip-row-gap-s">
    
      <!-- Title -->
      <div class="uip-flex uip-gap-s uip-flex-center uip-flex-between">
        
       
        <div class="uip-flex uip-gap-xxs uip-flex-center uip-cursor-pointer uip-flex-between uip-flex-grow"
        @click="toggleVisibility()">
          
          
          <span class="uip-text-bold uip-text-emphasis">{{ title }}</span> 
          
          <a class="uip-link-default uip-icon">{{ returnVisibilityIcon }}</a>
          
          
        </div>
      
      </div>
      
      <div v-if="open" class="uip-padding-left-s">
        <slot></slot>
      </div>
      
    </div>
  
  `,
};

export default {
  components: { MenuItem: MenuItem, ToggleSection: ToggleSection },
  props: {
    adminMenu: { type: Array },
    submenu: { type: Object, default: [] },
    menuObject: Object,
    resetMenuToDefault: Function,
  },
  data() {
    return {
      rendered: false,
      topLevelItems: [],
      activePanel: 'menuItems',
      strings: {
        settings: __('Settings', 'uipress-pro'),
        menu: __('Menu', 'uipress-pro'),
        name: __('Name', 'uipress-pro'),
        active: __('Active', 'uipress-pro'),
        for: __('For', 'uipress-pro'),
        excludes: __('Excludes', 'uipress-pro'),
        newMenuItem: __('New menu item', 'uipress-pro'),
        applyToSubsites: __('Apply to subsites', 'uipress-pro'),
      },
      panels: {
        menuItems: {
          value: 'menuItems',
          label: __('Menu items', 'uipress-pro'),
        },
        settings: {
          value: 'settings',
          label: __('Settings', 'uipress-pro'),
        },
      },
      activeOptions: {
        false: {
          value: false,
          label: __('Disabled', 'uipress-pro'),
        },
        true: {
          value: true,
          label: __('Enabled', 'uipress-pro'),
        },
      },
    };
  },
  async mounted() {
    await this.$nextTick();
    this.rendered = true;
  },
  methods: {
    /**
     * Resets the menu to it's default state
     *
     * @since 3.2.0
     */
    resetMenu() {
      this.resetMenuToDefault();
    },

    /**
     * Adds top level submenu as attribute
     *
     * @since 3.2.09
     */
    cloneItem(item) {
      const id = item[2] ? this.switchOutHtmlEntities(item[2]) : item.uip_uid;
      let submenu = this.submenu[id] && Array.isArray(this.submenu[id]) ? this.submenu[id] : [];
      item.submenu = submenu;
      return item;
    },

    /**
     * Decodes html entities by adding to a text area
     *
     * @param {string} encodedString
     * @since 3.3.09
     */
    switchOutHtmlEntities(encodedString) {
      if (typeof encodedString !== 'string') return encodedString;

      let textArea = document.createElement('textarea');
      textArea.innerHTML = encodedString;
      let value = textArea.value;
      textArea.remove();
      return value;
    },
  },
  template: `
    <div class="uip-flex uip-flex-column uip-row-gap-s uip-position-relative uip-h-100p uip-margin-top-s">
      
      <ToggleSection :title="strings.settings" :startOpen="true">
      
      
        <div class="uip-grid-col-1-3">
        
          <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.name}}</span></div>
          <input class="uip-input uip-input-small" type="text" v-model="menuObject.name">
          
          <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.active}}</span></div>
          <switch-select :options="activeOptions" 
          :activeValue="menuObject.status" 
          :returnValue="(d)=>(menuObject.status=d)"/>
          
          <template v-if="isPrimarySite && isMultisite">
            <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.applyToSubsites}}</span></div>
            <switch-select :options="activeOptions" 
            :activeValue="menuObject.multisite" 
            :returnValue="(d)=>(menuObject.multisite=d)"/>
          </template>
          
          <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.for}}</span></div>
          <user-role-select :selected="menuObject.for"
          @click.stop
          :placeHolder="strings.for"
          :updateSelected="(d)=>{menuObject.for = d}"/>
          
          <div class="uip-text-muted uip-flex uip-flex-center uip-text-s"><span>{{strings.excludes}}</span></div>
          <user-role-select :selected="menuObject.excludes"
          @click.stop
          :placeHolder="strings.excludes"
          :updateSelected="(d)=>{menuObject.excludes = d}"/>
        
        </div>
        
      
      </ToggleSection>
      
      <div class="uip-border-top"></div>
      
      <div class="uip-flex uip-gap-xs uip-flex-center uip-cursor-pointer uip-flex-between">
        
        <span class="uip-text-bold uip-text-emphasis uip-flex-grow">{{ strings.menu }}</span> 
        
        <a class="uip-link-default uip-icon uip-text-l" @click="resetMenu()">restart_alt</a>
        
        <dropdown pos="left center" :snapX="['#uip-block-settings']" ref="newMenuItem">
          <template #trigger>
            <a class="uip-link-default uip-icon uip-text-l">add</a>
          </template>
          <template #content>
            
            <div class="uip-padding-s uip-flex uip-flex-column uip-row-gap-s uip-w-260">
              
              <div class="uip-flex uip-flex-between uip-flex-center">
                <div class="uip-text-emphasis uip-text-bold uip-text-s">{{strings.newMenuItem}}</div>
                <div @click="$refs.newMenuItem.close()" class="uip-flex uip-flex-center uip-flex-middle uip-padding-xxs uip-link-muted hover:uip-background-muted uip-border-rounder">
                  <span class="uip-icon">close</span>
                </div>
              </div>
              
              <NewMenuItems/>
              
            </div>
            
          </template>
        </dropdown>
        
      </div>  
      
      <uipDraggable v-if="rendered"
      class="uip-flex uip-flex-column uip-row-gap-xxs uip-max-w-100p uip-flex-grow uip-padding-left-s" 
      :group="{ name: 'uip-menu-items', pull: true, put: true }" 
      :list="adminMenu"
      ghostClass="uip-canvas-ghost"
      animation="300"
      :clone="cloneItem"
      :sort="true">
      
        <template v-for="(menu, index) in adminMenu" :key="index" :index="index">
          
          <MenuItem 
          @request-screen="(e)=>$emit('request-screen', e)"
          @go-back="(e)=>$emit('go-back', e)"
          :menuItem="menu" :topLevel="true" :submenu="submenu" :index="index" :list="adminMenu"/>
        
        </template>
      
      </uipDraggable>
      
      
      
    </div>
  `,
};
