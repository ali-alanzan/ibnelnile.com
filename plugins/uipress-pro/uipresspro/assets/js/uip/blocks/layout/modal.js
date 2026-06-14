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
      dynamics: this.uipApp.data.dynamicOptions,
      shortCut: [],
      pressedKeys: false,
    };
  },
  created() {
    this.mountListeners();
    this.mountShortcut();
  },
  beforeUnmount() {
    document.removeEventListener('uipress/app/page/load/finish', this.handlePageChange);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  },
  computed: {
    /**
     * Returns whether to close on page change
     *
     * @since 3.2.13
     */
    closeOnPageChange() {
      let status = this.get_block_option(this.block, 'block', 'closeOnPageChange');
      if (!status) return false;
      if (!this.isObject(status)) return status;
      return status.value ? true : false;
    },

    /**
     * Returns icon for button
     *
     * @since 3.2.13
     */
    returnIcon() {
      let icon = this.get_block_option(this.block, 'block', 'iconSelect');
      if (!icon) return '';
      if (!this.isObject(icon)) return icon;
      if (icon.value) return icon.value;
      return '';
    },

    /**
     * Returns custom text for button trigger
     *
     * @since 3.2.13
     */
    returnTitle() {
      const item = this.get_block_option(this.block, 'block', 'modalTitle', true);
      if (!item) return '';

      if (!this.isObject(item)) return item;
      if (item.string) return item.string;
      return '';
    },

    /**
     * Returns custom text for button trigger
     *
     * @since 3.2.13
     */
    returnText() {
      const item = this.get_block_option(this.block, 'block', 'buttonText', true);
      if (!item) return '';

      if (!this.isObject(item)) return item;
      if (item.string) return item.string;
      return '';
    },

    /**
     * Gets the block shortcut and returns the visual shortcut
     *
     * @since 3.2.13
     */
    getShortcut() {
      const shortcut = this.getShortcutValue;
      if (!shortcut) return;
      return this.renderKeyShortCut(shortcut);
    },

    /**
     * Gets shortcut value
     *
     * @since 3.2.13
     */
    getShortcutValue() {
      const shortcut = this.get_block_option(this.block, 'block', 'keyboardShortcut');
      if (!this.isObject(shortcut)) return;

      // Shortcut is not enabled so bail
      if (!shortcut.enabled || !shortcut.display || !shortcut.selected) return false;
      // No keys set for shortcut so bail

      //No shortcut set
      if (shortcut.selected.length < 1) return;

      return shortcut.selected;
    },

    /**
     * Returns the reverse class if icon position is right
     *
     * @since 3.2.13
     */
    returnClasses() {
      const position = this.get_block_option(this.block, 'block', 'iconPosition');
      if (!position) return;
      if (!this.isObject(position) && position == 'right') return 'uip-flex-reverse';
      if (position.value && position.value == 'right') return 'uip-flex-reverse';
    },
  },
  methods: {
    /**
     * Mounts page change watcher
     *
     * @since 3.2.0
     */
    mountListeners() {
      document.addEventListener('uipress/app/page/load/finish', this.handlePageChange);
    },

    /**
     * Mounts shortcut if it exists
     *
     * @since 3.2.0
     */
    mountShortcut() {
      // Return early if shortcut is not defined
      if (!this.getShortcutValue) return;

      // Initialise pressedKeys set
      this.pressedKeys = new Set();

      // Clone the shortcut for immutability
      this.shortcut = [...this.getShortcutValue];

      // Add event listeners
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    },

    /**
     * Handles the 'keydown' event.
     *
     * Adds the pressed key to the `pressedKeys` set and checks if the
     * shortcut keys are pressed to show the component.
     *
     * @param {KeyboardEvent} event - The 'keydown' event.
     * @since 3.2.13
     */
    handleKeyDown(event) {
      this.pressedKeys.add(event.key);

      // Check if all keys in the shortcut are pressed
      const shortcutPressed = this.shortcut.every((key) => this.pressedKeys.has(key));

      if (shortcutPressed) {
        this.$refs.modal.open();
      }
    },

    /**
     * Handles the 'keyup' event.
     *
     * Clears the `pressedKeys` set.
     *
     * @since 3.2.13
     */
    handleKeyUp() {
      this.pressedKeys.clear();
    },

    /**
     * Handle page change events
     *
     * @since 3.2.0
     */
    handlePageChange() {
      // Nothing to do unless close on load is enabled
      if (!this.closeOnPageChange) return;
      this.$refs.modal.close();
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

    /**
     * Blurs the trigger after click
     *
     * @since 3.2.0
     */
    maybeBlur() {
      if (!this.$refs.trigger) return;
      this.$refs.trigger.blur();
    },

    /**
     * Returns public methods available to the interactions API
     *
     * @since 3.3.095
     */
    returnPublicMethods() {
      return ['show', 'close'];
    },

    /**
     * Show modal
     *
     * @since 3.2.1
     */
    show() {
      this.$refs.modal.open();
    },

    /**
     * Show modal
     *
     * @since 3.2.1
     */
    close() {
      this.$refs.modal.close();
    },
  },
  template: `
  
        <button ref="trigger" class="uip-button-default uip-flex uip-gap-xxs uip-flex-center uip-panel-trigger"
        :class="returnClasses" @click="maybeBlur();$refs.modal.open()">
        
          <span class="uip-icon" v-if="returnIcon">{{returnIcon}}</span>
          <span class="uip-flex-grow" v-if="returnText != ''">{{returnText}}</span>
          <div v-if="getShortcut" class="uip-flex uip-flex-row uip-padding-left-xxxs uip-padding-right-xxxs uip-border uip-border-round uip-text-s uip-flex-row uip-inline-flex uip-flex-center" v-html="getShortcut">
          </div>
          
          <uipModal ref="modal">
          
            <uip-content-area :content="block.content" :returnData="(data)=>block.content = data"/>
              
          </uipModal>
          
        </button>
        
        `,
};
