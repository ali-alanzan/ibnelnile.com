const { __, _x, _n, _nx } = wp.i18n;

export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: Object,
    },
    data: function () {
      return {
        OGmenu: structuredClone(uipMenuBuilderMenu.menu),
        OGsubmenu: structuredClone(uipMenuBuilderMenu.submenu),
        menu: structuredClone(uipMenuBuilderMenu.menu),
        submenu: structuredClone(uipMenuBuilderMenu.submenu),

        strings: {
          renameItem: __('Rename item', 'uipress-pro'),
          openMenuEditor: __('Open menu editor', 'uipress-pro'),
          itemName: __('Item name', 'uipress-pro'),
          separator: __('Separator', 'uipress-pro'),
          itemVisibility: __('Item visibiity', 'uipress-pro'),
          toggleSubmenu: __('Show submenu', 'uipress-pro'),
          addToMenu: __('Add to menu', 'uipress-pro'),
          addToSubMenu: __('Add to submenu', 'uipress-pro'),
          newSeparator: __('Separator', 'uipress-pro'),
          newLink: __('Link', 'uipress-pro'),
          deleteItem: __('Delete item', 'uipress-pro'),
          advancedMenuEditor: __('Advanced menu editor', 'uipress-pro'),
          advanced: __('Advanced', 'uipress-pro'),
          customClasses: __('Custom classes', 'uipress-pro'),
          resetToDefault: __('Reset to default', 'uipress-pro'),
          openInNewTab: __('Open in a new tab?', 'uipress-pro'),
          withoutFrame: __('Open outside frame', 'uipress-pro'),
          withoutUiPress: __('Open without UiPress', 'uipress-pro'),
          customLink: __('Custom URL', 'uipress-pro'),
          capabilities: __('Capability', 'uipress-pro'),
          capabilityDescription: __('Replaces capability required for viewing this menu item', 'uipress-pro'),
          classesDescription: __('Add classes seperated by a space', 'uipress-pro'),
        },
      };
    },
    inject: ['uipress'],
    watch: {
      menu: {
        handler(newValue, oldValue) {
          if (typeof this.returnData === 'undefined') {
            return;
          }
          this.returnData({ menu: this.menu, submenu: this.submenu });
        },
        deep: true,
      },
    },

    mounted: function () {
      this.setCustomMenu();
    },
    methods: {
      setCustomMenu() {
        if (typeof this.value === 'undefined') {
          return;
        }
        if (!this.uipress.isObject(this.value)) {
          return;
        }
        this.menu = this.value.menu;
        this.submenu = this.value.submenu;
      },
      setdropAreaStyles(sub) {
        let returnData = [];
        returnData.class = 'uip-flex uip-flex-column uip-row-gap-xs';
        if (sub) {
          returnData.class = 'uip-flex uip-flex-column';
        }
        return returnData;
      },
      newMenuItem(type, list, submenu) {
        let newItem = {
          0: __('Custom menu item', 'uipress-pro'),
          1: 'read',
          2: this.uipress.createUID(),
          uip_uid: this.uipress.createUID(),
          type: 'custom',
          customItem: true,
          custom: {
            name: __('Custom menu item', 'uipress-pro'),
            icon: 'favorite',
            url: '',
          },
        };

        if (type == 'sep') {
          newItem.type = 'sep';
          newItem.custom = {
            name: '',
          };
          newItem[4] = 'wp-menu-separator';
        }

        if (submenu) {
          if (!Array.isArray(this.submenu[list[2]])) {
            this.submenu[list[2]] = [newItem];
          } else {
            this.submenu[list[2]].push(newItem);
          }
        } else {
          list.unshift(newItem);
        }
      },
      deleteItem(item, index, list, topLevel) {
        list.splice(index, 1);
      },
      returnFormattedIcon(icon) {
        if (typeof icon === 'undefined' || !icon) {
          return '';
        }
        if (icon.includes('uipblank')) {
          return icon.replace('uipblank', '');
        }

        return icon;
      },
      resetMenu() {
        this.menu = this.OGmenu;
        this.submenu = this.OGsubmenu;
      },
      returnPlaceHolder(item) {
        if (item == '' || typeof item === 'undefined') {
          return __('Item name', 'uipress-pro');
        }
        return item;
      },
      addFromOG(item, list) {
        let clone = JSON.parse(JSON.stringify(item));
        if (!list) {
          this.menu.unshift(clone);
          return;
        }

        if (!Array.isArray(this.submenu[list[2]])) {
          this.submenu[list[2]] = [clone];
        } else {
          this.submenu[list[2]].push(clone);
        }
      },
    },
    template: `
    
          <div class="">
              
              <div class="uip-flex uip-gap-xs uip-margin-bottom-s uip-flex-between">
                <drop-down dropPos="left">
                  
                  <template v-slot:trigger>
                    <button class="uip-button-default uip-flex uip-flex-row uip-gap-xxs">
                      <span class="uip-icon">add</span>
                      <span>{{strings.addToMenu}}</span>
                    </button>
                  </template>
                  
                  <template v-slot:content>
                    <div class="uip-padding-xs uip-flex uip-flex-column uip-row-gap-xxs uip-max-h-400 uip-overflow-auto">
                    
                      <div class="uip-link-default hover:uip-background-muted uip-border-rounder uip-padding-xxxs uip-flex uip-gap-m uip-flex-between uip-flex-center" @click="newMenuItem('link', menu)">
                        
                        <span>{{strings.newLink}}</span>
                        <span class="uip-icon">link</span>
                        
                      </div>
                      
                      <div class="uip-link-default hover:uip-background-muted uip-border-rounder uip-padding-xxxs uip-flex uip-gap-m uip-flex-between uip-flex-center" @click="newMenuItem('sep', menu)">
                        
                        <span>{{strings.newSeparator}}</span>
                        <span class="uip-icon">title</span>
                        
                      </div>
                      
                      <div class="uip-border-top uip-margin-top-xs uip-margin-bottom-xs"></div>
                      
                      <template v-for="item in OGmenu">
                        <div v-if="item.type != 'sep'" @click="addFromOG(item)"
                        class="uip-link-default hover:uip-background-muted uip-border-rounder uip-padding-xxxs uip-flex uip-flex-between uip-flex-center uip-gap-m">
                          <span>{{item.cleanName}}</span>
                          <span class="uip-icon">add</span>
                        </div>
                        
                        <div v-if="OGsubmenu[item[2]]" class="uip-margin-left-s uip-margin-bottom-xs">
                          <template v-for="sub in OGsubmenu[item[2]]">
                            <div v-if="sub.type != 'sep'" @click="addFromOG(sub)"
                            class="uip-link-muted hover:uip-background-muted uip-border-rounder uip-padding-xxxs uip-flex uip-flex-between uip-flex-center uip-gap-m">
                              <span>{{sub.cleanName}}</span>
                              <span class="uip-icon">add</span>
                            </div>
                          </template>
                        </div>
                      </template>
                      
                    </div>
                  </template>
                  
                </drop-down>
                
                
                <button class="uip-button-warning uip-flex uip-flex-row uip-gap-xs uip-flex-center" @click="resetMenu()">
                  <span class="uip-icon">restart_alt</span>
                  <span>{{strings.resetToDefault}}</span>
                </button>
                
                
                
              </div>
            
            <draggable 
            class="uip-flex uip-flex-column uip-row-gap-xs" 
            :group="{ name: 'menuItems', pull: true, put: true }"
            :list="menu"
            ref="dropzone"
            animation="300"
            :sort="true"
            itemKey="uid"
            handle=".uip-drag-handle">
                    
              <template v-for="(parent, index) in menu" 
              :key="parent.uid" :index="index">
              
                <div>
                  <!-- top level items-->
                  <div class="uip-flex uip-flex-row uip-gap-s uip-flex-center  uip-background-muted uip-border-rounder uip-padding-xxs">
                    
                    <div class="uip-icon uip-drag-handle uip-cursor-drag uip-padding-xxxs uip-border-round uip-background-grey">drag_indicator</div>
                    
                    <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-grow" :class="{'uip-opacity-20' : parent.custom.hidden}" >
                    
                      <inline-icon-select :value="{value: parent.custom.icon}" :returnData="function(e){parent.custom.icon = e.value}">
                        <template v-slot:trigger>
                          <div class="uip-padding-xxxs uip-w-14 uip-ratio-1-1 uip-border uip-border-round uip-flex uip-flex-center uip-flex-middle">
                            <div class="uip-icon" v-html="returnFormattedIcon(parent.custom.icon)"></div>
                          </div>
                        </template>
                      </inline-icon-select>
                      <div class=" uip-flex uip-flex-row uip-gap-xxs">
                        <div v-if="parent.type == 'sep'" class="uip-text-s uip-padding-xxxs uip-border-round uip-background-orange-wash">{{strings.separator}}</div>
                        <input class="uip-blank-input" type="text" v-model="parent.custom.name" :placeholder="returnPlaceHolder(parent.cleanName)">
                      </div>
                      
                    </div>
                    
                    <!--Item options -->
                    <div class="uip-flex uip-flex-row uip-gap-xxs">
                      
                      
                      <uip-tooltip :message="strings.itemVisibility">
                        <div @click="parent.custom.hidden = !parent.custom.hidden" class="uip-icon uip-padding-xxxs hover:uip-background-grey uip-border-round uip-text-l uip-cursor-pointer"
                        :class="{'uip-text-danger' : parent.custom.hidden}" >visibility</div>
                      </uip-tooltip>
                      
                     
                      <drop-down dropPos="left">
                        <template v-slot:trigger>
                          <uip-tooltip :message="strings.advanced">
                            <div class="uip-icon uip-padding-xxxs hover:uip-background-grey uip-border-round uip-text-l">more_vert</div>
                          </uip-tooltip>
                        </template>
                        <template v-slot:content>
                        
                          <div class="uip-padding-s uip-flex uip-flex-column uip-row-gap-s">
                              
                              <div class="uip-flex uip-flex-column uip-row-gap-xxs">
                                <div class="">{{strings.customClasses}}</div>
                                <input class="uip-input uip-input-small" type="text" v-model="parent.custom.classes" :placeholder="strings.classesDescription">
                              </div>
                              
                              <div v-if="parent.type != 'sep'" class="uip-flex uip-flex-column uip-row-gap-xxs">
                                <div class="">{{strings.customLink}}</div>
                                <input class="uip-input uip-input-small" type="text" v-model="parent.custom.url" :placeholder="parent[2]">
                              </div>
                              
                              
                              <div class="uip-flex uip-flex-column uip-row-gap-xxs">
                                <div class="">{{strings.capabilities}}</div>
                                <input class="uip-input uip-input-small" type="text" v-model="parent.custom.capabilities" :placeholder="parent[1]">
                                <div class="uip-text-s uip-text-muted uip-max-w-200">{{strings.capabilityDescription}}</div>
                              </div>
                              
                          </div>
                          
                          
                        </template>
                      </drop-down>
                      
                      <div v-if="parent.type != 'sep'" class="uip-border-left uip-margin-left-xxs uip-margin-right-xxs"></div>
                      
                      
                      <uip-tooltip v-if="parent.type != 'sep'" :message="strings.toggleSubmenu">
                        <div  v-if="!parent.subOpen" @click="parent.subOpen = !parent.subOpen" class="uip-icon uip-padding-xxxs hover:uip-background-grey uip-border-round uip-text-l uip-cursor-pointer">chevron_left</div>
                        <div v-else @click="parent.subOpen = !parent.subOpen" class="uip-icon uip-padding-xxxs hover:uip-background-grey uip-border-round uip-text-l uip-cursor-pointer">expand_more</div>
                      </uip-tooltip>
                      
                      <uip-tooltip :message="strings.deleteItem">
                        <div  @click="deleteItem(parent, index, menu, true)" class="uip-icon uip-padding-xxxs hover:uip-background-grey uip-border-round uip-text-l uip-cursor-pointer uip-link-danger">delete</div>
                      </uip-tooltip>
                    </div>
                    <!--End item options -->
                    
                  </div>
                  <!--End top level items-->
                  
                  
                  
                  
                  
                  
                  <!-- SUB LEVEL ITEMS -->
                  <div class=" uip-margin-top-s uip-margin-bottom-m uip-scale-in" v-if="parent.type != 'sep' && parent.subOpen">
                    
                    
                    <draggable 
                    class="uip-flex uip-flex-column" 
                    :group="{ name: 'menuItems', pull: true, put: true }"
                    :list="submenu[parent[2]]"
                    ref="dropzone"
                    animation="300"
                    :sort="true"
                    itemKey="uid"
                    handle=".uip-drag-handle">
                            
                      <template v-for="(subitem, index) in submenu[parent[2]]" 
                      :key="subitem.uid" :index="index">
                        
                        
                          <div class="uip-flex uip-flex-row uip-gap-s uip-flex-center hover:uip-background-muted uip-border-rounder uip-padding-xxs">
                            
                            <div class="uip-icon uip-drag-handle uip-cursor-drag uip-padding-xxxs uip-border-round uip-background-grey">drag_indicator</div>
                            
                            <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-grow" :class="{'uip-opacity-20' : subitem.custom.hidden}" >
                            
                              <div class=" uip-flex uip-flex-row uip-gap-xxs">
                                <div v-if="subitem.type == 'sep'" class="uip-text-s uip-padding-xxxs uip-border-round uip-background-orange-wash">{{strings.separator}}</div>
                                <input class="uip-blank-input" type="text" v-model="subitem.custom.name" :placeholder="returnPlaceHolder(subitem.cleanName)">
                              </div>
                              
                            </div>
                            
                            <!--Item options -->
                            <div class="uip-flex uip-flex-row uip-gap-xxs">
                            
                              
                              
                              <uip-tooltip :message="strings.itemVisibility">
                                <div @click="subitem.custom.hidden = !subitem.custom.hidden" class="uip-icon uip-padding-xxxs hover:uip-background-grey uip-border-round uip-text-l uip-cursor-pointer"
                                :class="{'uip-text-danger' : subitem.custom.hidden}" >visibility</div>
                              </uip-tooltip>
                              
                              
                              
                              <drop-down dropPos="left">
                                <template v-slot:trigger>
                                  <uip-tooltip :message="strings.advanced">
                                    <div class="uip-icon uip-padding-xxxs hover:uip-background-grey uip-border-round uip-text-l">more_vert</div>
                                  </uip-tooltip>
                                </template>
                                <template v-slot:content>
                                
                                  
                                  <div class="uip-padding-s uip-flex uip-flex-column uip-row-gap-s">
                                      
                                      <div class="uip-flex uip-flex-column uip-row-gap-xxs">
                                        <div class="">{{strings.customClasses}}</div>
                                        <input class="uip-input uip-input-small" type="text" v-model="subitem.custom.classes" :placeholder="strings.classesDescription">
                                      </div>
                                      
                                      <div v-if="subitem.type != 'sep'" class="uip-flex uip-flex-column uip-row-gap-xxs">
                                        <div class="">{{strings.customLink}}</div>
                                        <input class="uip-input uip-input-small" type="text" v-model="subitem.custom.url" :placeholder="subitem[2]">
                                      </div>
                                      
                                      
                                      <div class="uip-flex uip-flex-column uip-row-gap-xxs">
                                        <div class="">{{strings.capabilities}}</div>
                                        <input class="uip-input uip-input-small" type="text" v-model="subitem.custom.capabilities" :placeholder="subitem[1]">
                                        <div class="uip-text-s uip-text-muted uip-max-w-200">{{strings.capabilityDescription}}</div>
                                      </div>
                                      
                                  </div>
                                  
                                  
                                </template>
                              </drop-down>
                              
                              
                              
                              <uip-tooltip :message="strings.deleteItem">
                                <div  @click="deleteItem(subitem, index, submenu[parent[2]])" class="uip-icon uip-padding-xxxs hover:uip-background-grey uip-border-round uip-text-l uip-cursor-pointer uip-link-danger">delete</div>
                              </uip-tooltip>
                              
                            </div>
                            <!--End item options -->
                            
                          </div>
                        
                      </template>
                      
                      
                      
                    </draggable>
                    
                    <!--Footer-->
                    <div class="uip-flex uip-margin-top-xs">
                      <drop-down dropPos="left">
                        
                        <template v-slot:trigger>
                          <div class="uip-padding-xs">
                            <a class="uip-link-muted uip-flex uip-flex-row uip-gap-xs uip-flex-center">
                              <span class="uip-icon uip-text-l">add</span>
                              <span>{{strings.addToSubMenu}}</span>
                            </a>
                          </div>
                        </template>
                        
                        <template v-slot:content>
                          
                          
                          <div class="uip-padding-xs uip-flex uip-flex-column uip-row-gap-xxs uip-max-h-400 uip-overflow-auto">
                          
                            <div class="uip-link-default hover:uip-background-muted uip-border-rounder uip-padding-xxxs uip-flex uip-gap-m uip-flex-between uip-flex-center" @click="newMenuItem('link', parent, true)">
                              
                              <span>{{strings.newLink}}</span>
                              <span class="uip-icon">link</span>
                              
                            </div>
                            
                            <div class="uip-link-default hover:uip-background-muted uip-border-rounder uip-padding-xxxs uip-flex uip-gap-m uip-flex-between uip-flex-center" @click="newMenuItem('sep', parent, true)">
                              
                              <span>{{strings.newSeparator}}</span>
                              <span class="uip-icon">title</span>
                              
                            </div>
                            
                            <div class="uip-border-top uip-margin-top-xs uip-margin-bottom-xs"></div>
                            
                            <template v-for="item in OGmenu">
                              <div v-if="item.type != 'sep'" @click="addFromOG(item,parent)"
                              class="uip-link-default hover:uip-background-muted uip-border-rounder uip-padding-xxxs uip-flex uip-flex-between uip-flex-center uip-gap-m">
                                <span>{{item.cleanName}}</span>
                                <span class="uip-icon">add</span>
                              </div>
                              
                              <div v-if="OGsubmenu[item[2]]" class="uip-margin-left-s uip-margin-bottom-xs">
                                <template v-for="sub in OGsubmenu[item[2]]">
                                  <div v-if="sub.type != 'sep'" @click="addFromOG(sub, parent)"
                                  class="uip-link-muted hover:uip-background-muted uip-border-rounder uip-padding-xxxs uip-flex uip-flex-between uip-flex-center uip-gap-m">
                                    <span>{{sub.cleanName}}</span>
                                    <span class="uip-icon">add</span>
                                  </div>
                                </template>
                              </div>
                            </template>
                            
                          </div>
                          
                          
                        </template>
                        
                      </drop-down>
                    </div>
                    
                  </div>
                  <!-- END SUB LEVEL ITEMS -->
                
                </div>
                
              </template>
              
              
            </draggable>
            
          
          </div>`,
  };
}
