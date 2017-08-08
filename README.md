# Angular Color Picker

<a href="https://badge.fury.io/js/ngx-color-picker"><img src="https://badge.fury.io/js/ngx-color-picker.svg" align="right" alt="npm version" height="18"></a>

This is an AOT compatible version with some additional features of the cool angular2-color-picker by Alberplz.

In future this library might merge with the angular2-color-picker or continue live as a separate library.

See a live example application <a href="https://zefoy.github.io/ngx-color-picker/">here</a>.

### Library building

```bash
npm install
npm run build
npm run inline
```

### Library development

```bash
npm link
cd example
npm link ngx-color-picker
```

### Running the example

```bash
cd example
npm install
npm start

(or 'npm run start:sjs' for using SystemJS)
```

### Installing and usage

```bash
npm install ngx-color-picker --save-dev
```

##### Load the module for your app:

```javascript
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  ...
  imports: [
    ...
    ColorPickerModule
  ]
})
```

##### Use it in your HTML template:

```html
<input [(colorPicker)]="color" [style.background]="color"/>
```

```javascript
[colorPicker]                // The color to show in the color picker dialog.

[cpWidth]                    // Use this option to set color picker dialog width ('230px').
[cpHeight]                   // Use this option to force color picker dialog height ('auto').

[cpToggle]                   // Sets the default open / close state of the color picker (false).

[cpOutputFormat]             // Output color format: 'hex', 'rgba', 'hsla' ('hex').
[cpAlphaChannel]             // Alpha in output value: 'enabled', 'disabled', 'always' ('enabled').
[cpFallbackColor]            // Is used when the color is not well-formed or is undefined ('#000').

[cpPosition]                 // Dialog position: 'right', 'left', 'top', 'bottom' ('right').
[cpPositionOffset]           // Dialog offset percentage relative to the directive element (0%).
[cpPositionRelativeToArrow]  // Dialog position is calculated relative to dialog arrow (false).

[cpPresetLabel]              // Label text for the preset colors if any provided ('Preset colors').
[cpPresetColors]             // Array of preset colors to show in the color picker dialog ([]).

[cpOKButton]                 // Show an OK / Apply button which saves the color (false).
[cpOKButtonText]             // Button label text shown inside the OK / Apply button ('OK').
[cpOKButtonClass]            // Additional class for customizing the OK / Apply button ('').

[cpCancelButton]             // Show a Cancel / Reset button which resets the color (false).
[cpCancelButtonText]         // Button label text shown inside the Cancel / Reset button ('Cancel').
[cpCancelButtonClass]        // Additional class for customizing the Cancel / Reset button ('').

[cpDialogDisplay]            // Dialog positioning mode: 'popup', 'inline' ('popup').
                             //   popup: dialog is shown as popup (fixed positioning).
                             //   inline: dialog is shown permanently (static positioning).

[cpIgnoredElements]          // Array of HTML elements that will be ignored when clicked ([]).

[cpSaveClickOutside]         // Save currently selected color when user clicks outside (true).

[cpUseRootViewContainer]     // Create dialog component in the root view container (false).
                             // Note: The root component needs to have public viewContainerRef.

(colorPickerChange)          // Changed color value, send when color is changed (value: string).
(colorPickerSelect)          // Selected color value, send when OK button is pressed (value: string).

(cpToggleChange)             // Status of the dialog, send when dialog is opened / closed (open: boolean).

(cpInputChange)              // Input name and its value, send when user changes color through inputs
                             //   ({input: string, value: string})
(cpSliderChange)             // Slider name and its value, send when user changes color through slider
                             //   ({slider: string, value: Object})
(cpCancel)                   // User cancelled, sent when the cancel button is pressed (void).
```
