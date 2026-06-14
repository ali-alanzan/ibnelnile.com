const { __, _x, _n, _nx } = wp.i18n;
export default {
  props: {
    returnData: Function,
    value: Object,
    args: Object,
  },
  data() {
    return {
      option: {
        enabled: false,
        display: false,
        selected: [],
      },

      enabledOptions: {
        false: {
          value: false,
          label: __('Disabled', 'uipress-pro'),
        },
        true: {
          value: true,
          label: __('Enabled', 'uipress-pro'),
        },
      },
      showHide: {
        false: {
          value: false,
          label: __('Hide', 'uipress-pro'),
        },
        true: {
          value: true,
          label: __('Show', 'uipress-pro'),
        },
      },
      strings: {
        shortCutEnabled: __('Enable keybaord shortcut?', 'uipress-lite'),
        pressShortcut: __('Type your custom shortcut below', 'uipress-lite'),
        displayShortcut: __('Display shortcut in trigger', 'uipress-lite'),
      },
      isCtrlPressed: false,
      isAltPressed: false,
      isShiftPressed: false,
      shortcutKeys: [
        'Enter', // Enter
        ' ', // Space
        'ArrowLeft', // Left Arrow
        'ArrowUp', // Up Arrow
        'ArrowRight', // Right Arrow
        'ArrowDown', // Down Arrow
      ],
      shortcutKeysIcons: [
        { key: 'Enter', icon: 'keyboard_return' }, // Enter
        { key: ' ', icon: 'space_bar' }, // Space
        { key: 'ArrowLeft', icon: 'keyboard_arrow_left' }, // Left Arrow
        { key: 'ArrowUp', icon: 'keyboard_arrow_up' }, // Up Arrow
        { key: 'ArrowRight', icon: 'keyboard_arrow_right' }, // Right Arrow
        { key: 'ArrowDown', icon: 'keyboard_arrow_down' }, // Down Arrow
      ],
      selected: [],
    };
  },
  watch: {
    /**
     * Watches changes to option
     *
     * @since 3.2.0
     */
    option: {
      handler(newValue, oldValue) {
        this.returnData(this.option);
      },
      deep: true,
    },
  },
  mounted() {
    this.formatValue();
  },
  methods: {
    /**
     * Formats input value
     *
     * @since 3.2.0
     */
    formatValue(val) {
      if (!this.value) return;
      if (!this.isObject(this.value)) return;
      this.option = { ...this.option, ...this.value };
    },

    /**
     * Logs keydown event
     *
     * @param {object} event
     * @since 3.2.0
     */
    logKeyDown(event) {
      const keyCode = event.key;
      this.pushSelected(keyCode);
    },

    /**
     * Handles keydown event
     *
     * @param {object} event
     * @since 3.2.0
     */
    logKeyUp(event) {
      event.preventDefault();

      this.selected = [];
      var keyCode = event.keyCode ? event.keyCode : event.which;
      if (keyCode >= 16 && keyCode <= 18) {
        this.updateKeyFlags(keyCode, false);
      }
      if (event.ctrlKey || event.metaKey) {
        this.updateKeyFlags(17, false);
      }
    },

    /**
     * Pushes selected options
     *
     * @param {string} key - the selected key
     * @since 3.2.0
     */
    pushSelected(key) {
      if (!this.option.selected) {
        this.option.selected = [];
      }
      if (!this.option.selected.includes(key)) {
        this.option.selected.push(key);
      }
    },

    /**
     * Handles key flags
     *
     * @param {string} keyCode
     * @param {flag} flag
     * @since 3.2.0
     */
    updateKeyFlags(keyCode, flag) {
      switch (keyCode) {
        case 16:
          this.isShiftPressed = flag;
          if (flag) {
            this.pushSelected('shift');
          }
          break;
        case 17:
          if (flag) {
            this.pushSelected('command');
          }
          this.isCtrlPressed = flag;
          break;
        case 18:
          if (flag) {
            this.pushSelected('alt');
          }
          this.isAltPressed = flag;
          break;
      }
    },

    /**
     * Returns key pressed
     *
     * @param {string} key
     * @since 3.2.0
     */
    returnKey(key) {
      if (key == 'Meta') {
        return '<span class="uip-command-icon uip-text-muted"></span>';
      }
      if (key == 'Alt') {
        return '<span class="uip-alt-icon uip-text-muted"></span>';
      }
      if (key == 'Shift') {
        return '<span class="uip-shift-icon uip-text-muted"></span>';
      }
      if (key == 'Control') {
        return '<span class="uip-icon uip-text-muted">keyboard_control_key</span>';
      }
      if (key == 'Backspace') {
        return '<span class="uip-icon uip-text-muted">backspace</span>';
      }

      if (this.shortcutKeys.includes(key)) {
        let keyicon = this.shortcutKeysIcons.find((x) => x.key == key);
        return `<span class="uip-icon uip-text-muted">${keyicon.icon}</span>`;
      } else {
        return `<span class="uip-text-muted uip-text-uppercase" style="line-height: 16px;font-size: 11px;">${key}</span>`;
      }
    },

    /**
     * Renders key shortcut
     *
     * @param {array} keys
     * @since 3.2.0
     */
    renderKeyShortCut(keys) {
      const shortcutKeys = [
        'Enter', // Enter
        ' ', // Space
        'ArrowLeft', // Left Arrow
        'ArrowUp', // Up Arrow
        'ArrowRight', // Right Arrow
        'ArrowDown', // Down Arrow
      ];
      const shortcutKeysIcons = [
        { key: 'Enter', icon: 'keyboard_return' }, // Enter
        { key: ' ', icon: 'space_bar' }, // Space
        { key: 'ArrowLeft', icon: 'keyboard_arrow_left' }, // Left Arrow
        { key: 'ArrowUp', icon: 'keyboard_arrow_up' }, // Up Arrow
        { key: 'ArrowRight', icon: 'keyboard_arrow_right' }, // Right Arrow
        { key: 'ArrowDown', icon: 'keyboard_arrow_down' }, // Down Arrow
      ];

      let format = '';

      for (let key of keys) {
        if (key == 'Meta') {
          format += '<span class="uip-command-icon uip-text-muted"></span>';
        } else if (key == 'Alt') {
          format += '<span class="uip-alt-icon uip-text-muted"></span>';
        } else if (key == 'Shift') {
          format += '<span class="uip-shift-icon uip-text-muted"></span>';
        } else if (key == 'Control') {
          format += '<span class="uip-icon uip-text-muted">keyboard_control_key</span>';
        } else if (key == 'Backspace') {
          format += '<span class="uip-icon uip-text-muted">backspace</span>';
        } else if (shortcutKeys.includes(key)) {
          let keyicon = shortcutKeysIcons.find((x) => x.key == key);
          format += `<span class="uip-icon uip-text-muted">${keyicon.icon}</span>`;
        } else {
          format += `<span class="uip-text-muted uip-text-uppercase" style="line-height: 16px;font-size: 11px;">${key}</span>`;
        }
      }

      return format;
    },
  },
  template: `
    <div class="uip-flex uip-flex-column uip-row-gap-xs uip-w-100p">
      
      <toggle-switch :options="enabledOptions" :activeValue="option.enabled" :returnValue="function(data){ option.enabled = data}"></toggle-switch>
        
      <!--Shortcut area -->
      <div v-if="option.enabled" class="uip-scale-in-top uip-flex uip-flex-column uip-row-gap-xs uip-flex-start">
        <div class="uip-text-s uip-text-muted">{{strings.pressShortcut}}</div>
        <input type="text" ref="shortcutInput" class="uip-input" @keydown="logKeyDown" @keyup="logKeyUp">
        <div class="uip-flex uip-flex-row uip-gap-xs uip-flex-center">
          <div v-if="option.selected && option.selected.length > 0" class="uip-flex uip-flex-row uip-padding-left-xxxs uip-padding-right-xxxs uip-border uip-border-round uip-text-s uip-flex-row uip-inline-flex uip-flex-center" v-html="renderKeyShortCut(option.selected)">
          </div>
          <div v-if="option.selected && option.selected.length > 0" class="uip-button-default uip-icon uip-border-rounder uip-padding-xxs uip-link-muted" @click="option.selected = []"><span class="uip-icon">close</span></div>
          
        </div>
      </div>
      <!--End shortcut area-->
      <div v-if="option.enabled">
        <div class="uip-margin-bottom-xxs uip-text-s uip-text-muted">{{strings.displayShortcut}}</div>
        
        <toggle-switch :options="showHide" :activeValue="option.display" :returnValue="function(data){ option.display = data}"></toggle-switch>
      </div>
    </div>`,
};
