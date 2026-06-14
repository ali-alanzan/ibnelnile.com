const { __, _x, _n, _nx } = wp.i18n;

/**
 * Text input block
 * @since 3.0.0
 */
const DateRange = {
  name: __('Date range', 'uipress-pro'),
  moduleName: 'uip-date-range',
  description: __('Outputs a date picker that can be either a single date or date range.', 'uipress-pro'),
  category: __('Form', 'uipress-pro'),
  group: 'form',
  premium: true,
  path: uipProPath + 'assets/js/uip/blocks/inputs/date-range.min.js',
  icon: 'date_range',
  settings: {},
  optionsEnabled: [
    //Block options group
    {
      name: 'block',
      label: __('Block options', 'uipress-pro'),
      icon: 'check_box_outline_blank',
      options: [
        {
          option: 'title',
          componentName: 'uip-dynamic-input',
          uniqueKey: 'inputLabel',
          label: __('Label', 'uipress-pro'),
          value: {
            string: __('Text input', 'uipress-pro'),
          },
        },
        {
          option: 'textField',
          componentName: 'uip-dynamic-input',
          uniqueKey: 'inputName',
          label: __('Meta key', 'uipress-pro'),
          args: { metaKey: true },
        },
        {
          option: 'title',
          componentName: 'uip-dynamic-input',
          uniqueKey: 'inputPlaceHolder',
          label: __('Placeholder', 'uipress-pro'),
          value: {
            string: __('Placeholder text...', 'uipress-pro'),
          },
        },
        {
          option: 'trueFalse',
          componentName: 'choice-select',
          uniqueKey: 'dateRange',
          label: __('Date range', 'uipress-pro'),
          args: {
            options: {
              false: {
                value: false,
                label: __('No', 'uipress-lite'),
              },
              true: {
                value: true,
                label: __('Yes', 'uipress-lite'),
              },
            },
          },
        },
        {
          option: 'choiceSelect',
          componentName: 'choice-select',
          uniqueKey: 'inputRequired',
          args: {
            options: {
              false: {
                value: false,
                label: __('No', 'uipress-lite'),
              },
              true: {
                value: true,
                label: __('Yes', 'uipress-lite'),
              },
            },
          },
          label: __('Required field', 'uipress-lite'),
          value: { value: false },
        },
      ],
    },
    //Container options group
    {
      name: 'container',
      label: __('Block container', 'uipress-pro'),
      icon: 'crop_free',
      styleType: 'style',
    },
    //Container options group
    {
      name: 'style',
      label: __('Style', 'uipress-pro'),
      icon: 'palette',
      styleType: 'style',
    },
    //Container options group
    {
      name: 'inputStyle',
      label: __('Input style', 'uipress-pro'),
      icon: 'input',
      styleType: 'style',
      class: '.uip-date-input',
    },
    //Container options group
    {
      name: 'label',
      label: __('Label', 'uipress-pro'),
      icon: 'label',
      styleType: 'style',
      class: '.uip-input-label',
    },
  ],
};

/**
 * Text area block
 * @since 3.0.0
 */
const CheckBox = {
  name: __('Checkbox', 'uipress-pro'),
  moduleName: 'uip-checkbox-input',
  description: __('A checkbox block with support for multiple options. For use with the form block', 'uipress-pro'),
  category: __('Form', 'uipress-pro'),
  group: 'form',
  premium: true,
  path: uipProPath + 'assets/js/uip/blocks/inputs/checkbox-input.min.js',
  icon: 'check_box',
  settings: {},
  optionsEnabled: [
    //Block options group
    {
      name: 'block',
      label: __('Block options', 'uipress-pro'),
      icon: 'check_box_outline_blank',
      options: [
        {
          option: 'title',
          componentName: 'uip-dynamic-input',
          uniqueKey: 'inputLabel',
          label: __('Label', 'uipress-pro'),
          value: {
            string: __('Select', 'uipress-pro'),
          },
        },
        {
          option: 'textField',
          componentName: 'uip-dynamic-input',
          uniqueKey: 'inputName',
          label: __('Meta key', 'uipress-pro'),
          args: { metaKey: true },
        },

        {
          option: 'selectOptionCreator',
          componentName: 'select-option-builder',
          uniqueKey: 'selectOptions',
          label: __('Select options', 'uipress-pro'),
        },

        {
          option: 'choiceSelect',
          componentName: 'choice-select',
          uniqueKey: 'inputRequired',
          args: {
            options: {
              false: {
                value: false,
                label: __('No', 'uipress-lite'),
              },
              true: {
                value: true,
                label: __('Yes', 'uipress-lite'),
              },
            },
          },
          label: __('Required field', 'uipress-lite'),
          value: { value: false },
        },
      ],
    },
    //Container options group
    {
      name: 'container',
      label: __('Block container', 'uipress-pro'),
      icon: 'crop_free',
      styleType: 'style',
    },
    //Container options group
    {
      name: 'style',
      label: __('Style', 'uipress-pro'),
      icon: 'palette',
      styleType: 'style',
    },
    //Container options group
    {
      name: 'inputStyle',
      label: __('Select style', 'uipress-pro'),
      icon: 'input',
      styleType: 'style',
      class: '.uip-input',
    },
    //Container options group
    {
      name: 'label',
      label: __('Label', 'uipress-pro'),
      icon: 'label',
      styleType: 'style',
      class: '.uip-input-label',
    },
  ],
};
/**
 * Radio checkbox
 * @since 3.0.0
 */
const Radio = {
  name: __('Radio', 'uipress-pro'),
  moduleName: 'uip-radio-input',
  description: __('A radio block with support for multiple options. For use with the form block', 'uipress-pro'),
  category: __('Form', 'uipress-pro'),
  group: 'form',
  premium: true,
  path: uipProPath + 'assets/js/uip/blocks/inputs/radio-input.min.js',
  icon: 'radio_button_checked',
  settings: {},
  optionsEnabled: [
    //Block options group
    {
      name: 'block',
      label: __('Block options', 'uipress-pro'),
      icon: 'check_box_outline_blank',
      options: [
        {
          option: 'title',
          componentName: 'uip-dynamic-input',
          uniqueKey: 'inputLabel',
          label: __('Label', 'uipress-pro'),
          value: {
            string: __('Select', 'uipress-pro'),
          },
        },
        {
          option: 'textField',
          componentName: 'uip-dynamic-input',
          uniqueKey: 'inputName',
          label: __('Meta key', 'uipress-pro'),
          args: { metaKey: true },
        },

        {
          option: 'selectOptionCreator',
          componentName: 'select-option-builder',
          uniqueKey: 'selectOptions',
          label: __('Select options', 'uipress-pro'),
          value: {
            options: [
              { label: __('Option 1', 'uipress-lite'), name: '' },
              { label: __('Option 2', 'uipress-lite'), name: '' },
            ],
          },
        },

        {
          option: 'choiceSelect',
          componentName: 'choice-select',
          uniqueKey: 'inputRequired',
          args: {
            options: {
              false: {
                value: false,
                label: __('No', 'uipress-lite'),
              },
              true: {
                value: true,
                label: __('Yes', 'uipress-lite'),
              },
            },
          },
          label: __('Required field', 'uipress-lite'),
          value: { value: false },
        },
      ],
    },
    //Container options group
    {
      name: 'container',
      label: __('Block container', 'uipress-pro'),
      icon: 'crop_free',
      styleType: 'style',
    },
    //Container options group
    {
      name: 'style',
      label: __('Style', 'uipress-pro'),
      icon: 'palette',
      styleType: 'style',
    },
    //Container options group
    {
      name: 'inputStyle',
      label: __('Select style', 'uipress-pro'),
      icon: 'input',
      styleType: 'style',
      class: '.uip-input',
    },
    //Container options group
    {
      name: 'label',
      label: __('Label', 'uipress-pro'),
      icon: 'label',
      styleType: 'style',
      class: '.uip-input-label',
    },
  ],
};

/**
 * Image
 * @since 3.0.0
 */
const ImageSelect = {
  name: __('Image select', 'uipress-pro'),
  moduleName: 'uip-image-select-input',
  description: __('Outputs a image select input. For use with the form block', 'uipress-pro'),
  category: __('Form', 'uipress-pro'),
  group: 'form',
  premium: true,
  path: uipProPath + 'assets/js/uip/blocks/inputs/image-select-input.min.js',
  icon: 'image',
  settings: {},
  optionsEnabled: [
    //Block options group
    {
      name: 'block',
      label: __('Block options', 'uipress-pro'),
      icon: 'check_box_outline_blank',
      options: [
        {
          option: 'title',
          componentName: 'uip-dynamic-input',
          uniqueKey: 'inputLabel',
          label: __('Label', 'uipress-pro'),
          value: {
            string: __('Select', 'uipress-pro'),
          },
        },
        {
          option: 'textField',
          componentName: 'uip-dynamic-input',
          uniqueKey: 'inputName',
          label: __('Meta key', 'uipress-pro'),
          args: { metaKey: true },
        },

        {
          option: 'choiceSelect',
          componentName: 'choice-select',
          uniqueKey: 'inputRequired',
          args: {
            options: {
              false: {
                value: false,
                label: __('No', 'uipress-lite'),
              },
              true: {
                value: true,
                label: __('Yes', 'uipress-lite'),
              },
            },
          },
          label: __('Required field', 'uipress-lite'),
          value: { value: false },
        },
      ],
    },
    //Container options group
    {
      name: 'container',
      label: __('Block container', 'uipress-pro'),
      icon: 'crop_free',
      styleType: 'style',
    },
    //Container options group
    {
      name: 'style',
      label: __('Style', 'uipress-pro'),
      icon: 'palette',
      styleType: 'style',
    },
    //Container options group
    {
      name: 'inputStyle',
      label: __('Select area', 'uipress-pro'),
      icon: 'input',
      styleType: 'style',
      class: '.uip-image-select',
    },
    //Container options group
    {
      name: 'label',
      label: __('Label', 'uipress-pro'),
      icon: 'label',
      styleType: 'style',
      class: '.uip-input-label',
    },
  ],
};

/**
 * Colour select
 * @since 3.0.0
 */
const ColourSelect = {
  name: __('Colour select', 'uipress-pro'),
  moduleName: 'uip-colour-select-input',
  description: __('Outputs a colour select input. For use with the form block', 'uipress-pro'),
  category: __('Form', 'uipress-pro'),
  group: 'form',
  premium: true,
  path: uipProPath + 'assets/js/uip/blocks/inputs/colour-select-input.min.js',
  icon: 'palette',
  settings: {},
  optionsEnabled: [
    //Block options group
    {
      name: 'block',
      label: __('Block options', 'uipress-pro'),
      icon: 'check_box_outline_blank',
      options: [
        {
          option: 'title',
          componentName: 'uip-dynamic-input',
          uniqueKey: 'inputLabel',
          label: __('Label', 'uipress-pro'),
          value: {
            string: __('Select', 'uipress-pro'),
          },
        },
        {
          option: 'textField',
          componentName: 'uip-dynamic-input',
          uniqueKey: 'inputName',
          label: __('Meta key', 'uipress-pro'),
          args: { metaKey: true },
        },

        {
          option: 'title',
          componentName: 'uip-dynamic-input',
          uniqueKey: 'inputPlaceHolder',
          label: __('Placeholder', 'uipress-lite'),
          value: {
            string: __('Select colour...', 'uipress-lite'),
          },
        },

        {
          option: 'choiceSelect',
          componentName: 'choice-select',
          uniqueKey: 'inputRequired',
          args: {
            options: {
              false: {
                value: false,
                label: __('No', 'uipress-lite'),
              },
              true: {
                value: true,
                label: __('Yes', 'uipress-lite'),
              },
            },
          },
          label: __('Required field', 'uipress-lite'),
          value: { value: false },
        },
      ],
    },
    //Container options group
    {
      name: 'container',
      label: __('Block container', 'uipress-pro'),
      icon: 'crop_free',
      styleType: 'style',
    },
    //Container options group
    {
      name: 'style',
      label: __('Style', 'uipress-pro'),
      icon: 'palette',
      styleType: 'style',
    },
    //Container options group
    {
      name: 'inputStyle',
      label: __('Select area', 'uipress-pro'),
      icon: 'input',
      styleType: 'style',
      class: '.uip-image-select',
    },
    //Container options group
    {
      name: 'label',
      label: __('Label', 'uipress-pro'),
      icon: 'label',
      styleType: 'style',
      class: '.uip-input-label',
    },
  ],
};

(function () {
  const blocks = [DateRange, CheckBox, Radio, ImageSelect, ColourSelect];
  wp.hooks.addFilter('uipress.blocks.register', 'uipress', (currentBlocks) => [...currentBlocks, ...blocks]);
})();
