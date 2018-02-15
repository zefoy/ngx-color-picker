import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild,
  ViewEncapsulation, ElementRef, ChangeDetectorRef } from '@angular/core';

import { detectIE } from './helpers';

import { Rgba, Hsla, Hsva } from './formats';
import { SliderPosition, SliderDimension } from './helpers';

import { ColorPickerService } from './color-picker.service';

@Component({
  selector: 'color-picker',
  templateUrl: './lib/color-picker.component.html',
  styleUrls: [ './lib/color-picker.component.css' ],
  encapsulation: ViewEncapsulation.None
})
export class ColorPickerComponent implements OnInit, OnDestroy, AfterViewInit {
  private isIE10: boolean = false;

  private hsva: Hsva;

  private width: number;
  private height: number;

  private outputColor: string;
  private initialColor: string;

  private listenerResize: any;
  private listenerMouseDown: any;

  private directiveInstance: any;

  private sliderH: number;
  private sliderDimMax: SliderDimension;
  private directiveElementRef: ElementRef;

  private dialogArrowSize: number = 10;
  private dialogArrowOffset: number = 15;

  private useRootViewContainer: boolean = false;

  public show: boolean;
  public hidden: boolean;

  public top: number;
  public left: number;
  public position: string;

  public format: number;
  public slider: SliderPosition;

  public hexText: string;
  public hslaText: Hsla;
  public rgbaText: Rgba;

  public arrowTop: number;

  public selectedColor: string;
  public hueSliderColor: string;
  public alphaSliderColor: string;

  public cpWidth: number;
  public cpHeight: number;

  public cpAlphaChannel: string;
  public cpOutputFormat: string;

  public cpDisableInput: boolean;
  public cpDialogDisplay: string;

  public cpIgnoredElements: any;
  public cpSaveClickOutside: boolean;

  public cpPosition: string;
  public cpPositionOffset: number;

  public cpOKButton: boolean;
  public cpOKButtonText: string;
  public cpOKButtonClass: string;

  public cpCancelButton: boolean;
  public cpCancelButtonText: string;
  public cpCancelButtonClass: string;

  public cpPresetLabel: string;
  public cpPresetColors: Array<string>;
  public cpMaxPresetColorsLength: number;

  public cpPresetEmptyMessage: string;
  public cpPresetEmptyMessageClass: string;

  public cpAddColorButton: boolean;
  public cpAddColorButtonText: string;
  public cpAddColorButtonClass: string;
  public cpRemoveColorButtonClass: string;

  @ViewChild('hueSlider') hueSlider: ElementRef;
  @ViewChild('alphaSlider') alphaSlider: ElementRef;
  @ViewChild('dialogPopup') dialogElement: ElementRef;

  constructor(private elRef: ElementRef, private cdRef: ChangeDetectorRef, private service: ColorPickerService) {}

  ngOnInit() {
    this.slider = new SliderPosition(0, 0, 0, 0);

    const hueWidth = this.hueSlider.nativeElement.offsetWidth;
    const alphaWidth = this.alphaSlider.nativeElement.offsetWidth;

    this.sliderDimMax = new SliderDimension(hueWidth, this.cpWidth, 130, alphaWidth);

    if (this.cpOutputFormat === 'rgba') {
      this.format = 1;
    } else if (this.cpOutputFormat === 'hsla') {
      this.format = 2;
    } else {
      this.format = 0;
    }

    this.listenerMouseDown = (event: any) => { this.onMouseDown(event); };
    this.listenerResize = () => { this.onResize(); };

    this.openDialog(this.initialColor, false);
  }

  ngOnDestroy() {
    this.closeDialog();
  }

  ngAfterViewInit() {
    if (this.cpWidth !== 230) {
      const hueWidth = this.hueSlider.nativeElement.offsetWidth;
      const alphaWidth = this.alphaSlider.nativeElement.offsetWidth;

      this.sliderDimMax = new SliderDimension(hueWidth, this.cpWidth, 130, alphaWidth);

      this.updateColorPicker(false);

      this.cdRef.detectChanges();
    }
  }

  public openDialog(color: any, emit: boolean = true) {
    this.service.setActive(this);

    if (!this.width) {
      this.cpWidth = this.directiveElementRef.nativeElement.offsetWidth;
    }

    this.setInitialColor(color);
    this.setColorFromString(color, emit);

    this.openColorPicker();
  }

  public closeDialog() {
    this.closeColorPicker();
  }

  public setupDialog(instance: any, elementRef: ElementRef, color: any,
    cpWidth: string, cpHeight: string, cpDialogDisplay: string,
    cpAlphaChannel: string, cpOutputFormat: string, cpDisableInput: boolean,
    cpIgnoredElements: any, cpSaveClickOutside: boolean, cpUseRootViewContainer: boolean,
    cpPosition: string, cpPositionOffset: string, cpPositionRelativeToArrow: boolean,
    cpPresetLabel: string, cpPresetColors: Array<string>, cpMaxPresetColorsLength: number,
    cpPresetEmptyMessage: string, cpPresetEmptyMessageClass: string,
    cpOKButton: boolean, cpOKButtonClass: string, cpOKButtonText: string,
    cpCancelButton: boolean, cpCancelButtonClass: string, cpCancelButtonText: string,
    cpAddColorButton: boolean, cpAddColorButtonClass: string, cpAddColorButtonText: string,
    cpRemoveColorButtonClass: string)
  {
    this.setInitialColor(color);

    this.isIE10 = (detectIE() === 10);

    this.directiveInstance = instance;
    this.directiveElementRef = elementRef;

    this.cpDisableInput = cpDisableInput;

    this.cpAlphaChannel = cpAlphaChannel;
    this.cpOutputFormat = cpOutputFormat;
    this.cpDialogDisplay = cpDialogDisplay;

    this.cpIgnoredElements = cpIgnoredElements;
    this.cpSaveClickOutside = cpSaveClickOutside;

    this.useRootViewContainer = cpUseRootViewContainer;

    this.width = this.cpWidth = parseInt(cpWidth, 10);
    this.height = this.cpHeight = parseInt(cpHeight, 10);

    this.cpPosition = cpPosition;
    this.cpPositionOffset = parseInt(cpPositionOffset, 10);

    this.cpOKButton = cpOKButton;
    this.cpOKButtonText = cpOKButtonText;
    this.cpOKButtonClass = cpOKButtonClass;

    this.cpCancelButton = cpCancelButton;
    this.cpCancelButtonText = cpCancelButtonText;
    this.cpCancelButtonClass = cpCancelButtonClass;

    this.setPresetConfig(cpPresetLabel, cpPresetColors);

    this.cpMaxPresetColorsLength = cpMaxPresetColorsLength;
    this.cpPresetEmptyMessage = cpPresetEmptyMessage;
    this.cpPresetEmptyMessageClass = cpPresetEmptyMessageClass;

    this.cpAddColorButton = cpAddColorButton;
    this.cpAddColorButtonText = cpAddColorButtonText;
    this.cpAddColorButtonClass = cpAddColorButtonClass;
    this.cpRemoveColorButtonClass = cpRemoveColorButtonClass;

    if (!cpPositionRelativeToArrow) {
      this.dialogArrowOffset = 0;
    }

    if (this.cpDialogDisplay === 'inline') {
      this.dialogArrowSize = 0;
      this.dialogArrowOffset = 0;
    }

    if (cpOutputFormat === 'hex' && cpAlphaChannel !== 'always' && cpAlphaChannel !== 'hex8') {
      this.cpAlphaChannel = 'disabled';
    }
  }

  public setInitialColor(color: any) {
    this.initialColor = color;
  }

  public setPresetConfig(cpPresetLabel: string, cpPresetColors: Array<string>) {
    this.cpPresetLabel = cpPresetLabel;
    this.cpPresetColors = cpPresetColors;
  }

  public setColorFromString(value: string, emit: boolean = true, update: boolean = true) {
    let hsva: Hsva;

    if (this.cpAlphaChannel === 'always' || this.cpAlphaChannel === 'hex8') {
      hsva = this.service.stringToHsva(value, true);

      if (!hsva && !this.hsva) {
        hsva = this.service.stringToHsva(value, false);
      }
    } else {
      hsva = this.service.stringToHsva(value, false);
    }

    if (hsva) {
      this.hsva = hsva;

      this.updateColorPicker(emit, update);
    }
  }

  public onResize() {
    if (this.position === 'fixed') {
      this.setDialogPosition();
    } else if (this.cpDialogDisplay !== 'inline') {
      this.closeColorPicker();
    }
  }

  public onDragEnd(slider: string) {
    this.directiveInstance.sliderDragEnd({ slider: slider, color: this.outputColor });
  }

  public onDragStart(slider: string) {
    this.directiveInstance.sliderDragStart({ slider: slider, color: this.outputColor });
  }

  public onMouseDown(event: MouseEvent) {
    if (!this.isIE10 && this.cpDialogDisplay === 'popup' &&
        event.target !== this.directiveElementRef.nativeElement &&
        !this.isDescendant(this.elRef.nativeElement, event.target) &&
        this.cpIgnoredElements.filter((item: any) => item === event.target).length === 0)
    {
      if (!this.cpSaveClickOutside) {
        this.setColorFromString(this.initialColor, false);

        this.directiveInstance.colorChanged(this.initialColor);
      }

      this.closeColorPicker();
    }
  }

  public onAcceptColor(event: Event) {
    event.stopPropagation();

    if (this.cpDialogDisplay === 'popup') {
      this.closeColorPicker();
    }

    if (this.outputColor) {
      this.directiveInstance.colorSelected(this.outputColor);
    }
  }

  public onCancelColor(event: Event) {
    event.stopPropagation();

    this.setColorFromString(this.initialColor, true);

    if (this.cpDialogDisplay === 'popup') {
      this.directiveInstance.colorChanged(this.initialColor, true);

      this.closeColorPicker();
    }

    this.directiveInstance.colorCanceled();
  }

  public onFormatToggle() {
    this.format = (this.format + 1) % 3;
  }

  public onColorChange(value: {s: number, v: number, rgX: number, rgY: number}) {
    this.hsva.s = value.s / value.rgX;
    this.hsva.v = value.v / value.rgY;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'lightness',
      value: this.hsva.v,
      color: this.outputColor
    });

    this.directiveInstance.sliderChanged({
      slider: 'saturation',
      value: this.hsva.s,
      color: this.outputColor
    });
  }

  public onHueChange(value: {v: number, rgX: number}) {
    this.hsva.h = value.v / value.rgX;
    this.sliderH = this.hsva.h;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'hue',
      value: this.hsva.h,
      color: this.outputColor
    });
  }

  public onAlphaChange(value: {v: number, rgX: number}) {
    this.hsva.a = value.v / value.rgX;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'alpha',
      value: this.hsva.a,
      color: this.outputColor
    });
  }

  public onHexInput(value: string) {
    if (value === null) {
      this.updateColorPicker();
    } else {
      this.setColorFromString(value, true, false);

      this.directiveInstance.inputChanged({
        input: 'hex',
        value: value,
        color: this.outputColor
      });
    }
  }

  public onRedInput(value: {v: number, rg: number}) {
    const rgba = this.service.hsvaToRgba(this.hsva);

    rgba.r = value.v / value.rg;

    this.hsva = this.service.rgbaToHsva(rgba);

    this.updateColorPicker();

    this.directiveInstance.inputChanged({input: 'red', value: rgba.r, color: this.outputColor});
  }

  public onBlueInput(value: {v: number, rg: number}) {
    const rgba = this.service.hsvaToRgba(this.hsva);

    rgba.b = value.v / value.rg;

    this.hsva = this.service.rgbaToHsva(rgba);

    this.updateColorPicker();

    this.directiveInstance.inputChanged({input: 'blue', value: rgba.b, color: this.outputColor});
  }

  public onGreenInput(value: {v: number, rg: number}) {
    const rgba = this.service.hsvaToRgba(this.hsva);

    rgba.g = value.v / value.rg;

    this.hsva = this.service.rgbaToHsva(rgba);

    this.updateColorPicker();

    this.directiveInstance.inputChanged({
      input: 'green',
      value: rgba.g,
      color: this.outputColor
    });
  }

  public onAlphaInput(value: {v: number, rg: number}) {
    this.hsva.a = value.v / value.rg;

    this.updateColorPicker();

    this.directiveInstance.inputChanged({
      input: 'alpha',
      value: this.hsva.a,
      color: this.outputColor
    });
  }

  public onHueInput(value: {v: number, rg: number}) {
    this.hsva.h = value.v / value.rg;

    this.updateColorPicker();

    this.directiveInstance.inputChanged({
      input: 'hue',
      value: this.hsva.h,
      color: this.outputColor
    });
  }

  public onLightnessInput(value: {v: number, rg: number}) {
    const hsla = this.service.hsva2hsla(this.hsva);

    hsla.l = value.v / value.rg;

    this.hsva = this.service.hsla2hsva(hsla);

    this.updateColorPicker();

    this.directiveInstance.inputChanged({
      input: 'lightness',
      value: hsla.l,
      color: this.outputColor
    });
  }

  public onSaturationInput(value: {v: number, rg: number}) {
    const hsla = this.service.hsva2hsla(this.hsva);

    hsla.s = value.v / value.rg;

    this.hsva = this.service.hsla2hsva(hsla);

    this.updateColorPicker();

    this.directiveInstance.inputChanged({
      input: 'saturation',
      value: hsla.s,
      color: this.outputColor
    });
  }

  public onAddPresetColor(event: any, value: string) {
    event.stopPropagation();

    if (!this.cpPresetColors.filter((color) => (color === value)).length) {
      this.cpPresetColors = this.cpPresetColors.concat(value);

      this.directiveInstance.presetColorsChanged(this.cpPresetColors);
    }
  }

  public onRemovePresetColor(event: any, value: string) {
    event.stopPropagation();

    this.cpPresetColors = this.cpPresetColors.filter((color) => (color !== value));

    this.directiveInstance.presetColorsChanged(this.cpPresetColors);
  }

  // Private helper functions for the color picker dialog status

  private openColorPicker() {
    if (!this.show) {
      this.show = true;
      this.hidden = true;

      setTimeout(() => {
        this.hidden = false;

        this.setDialogPosition();

        this.cdRef.detectChanges();
      }, 0);

      this.directiveInstance.toggle(true);

      if (!this.isIE10) {
        document.addEventListener('mousedown', this.listenerMouseDown);
      }

      window.addEventListener('resize', this.listenerResize);
    }
  }

  private closeColorPicker() {
    if (this.show) {
      this.show = false;

      this.directiveInstance.toggle(false);

      if (!this.isIE10) {
        document.removeEventListener('mousedown', this.listenerMouseDown);
      }

      window.removeEventListener('resize', this.listenerResize);

      if (!this.cdRef['destroyed']) {
        this.cdRef.detectChanges();
      }
    }
  }

  private updateColorPicker(emit: boolean = true, update: boolean = true) {
    if (this.sliderDimMax) {
      const lastOutput = this.outputColor;

      const hsla = this.service.hsva2hsla(this.hsva);
      const rgba = this.service.denormalizeRGBA(this.service.hsvaToRgba(this.hsva));

      const hue = this.service.denormalizeRGBA(this.service.hsvaToRgba(new Hsva(this.hsva.h, 1, 1, 1)));

      if (update) {
        this.hslaText = new Hsla(Math.round((hsla.h) * 360), Math.round(hsla.s * 100), Math.round(hsla.l * 100),
          Math.round(hsla.a * 100) / 100);

        this.rgbaText = new Rgba(rgba.r, rgba.g, rgba.b, Math.round(rgba.a * 100) / 100);

        const allowHex8 = this.cpAlphaChannel === 'always' || this.cpAlphaChannel === 'hex8';

        this.hexText = this.service.rgbaToHex(rgba, allowHex8);
      }

      this.hueSliderColor = 'rgb(' + hue.r + ',' + hue.g + ',' + hue.b + ')';
      this.alphaSliderColor = 'rgb(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ')';

      this.outputColor = this.service.outputFormat(this.hsva, this.cpOutputFormat, this.cpAlphaChannel);
      this.selectedColor = this.service.outputFormat(this.hsva, 'rgba', null);

      this.slider = new SliderPosition(
        (this.sliderH || this.hsva.h) * this.sliderDimMax.h - 8,
        this.hsva.s * this.sliderDimMax.s - 8,
        (1 - this.hsva.v) * this.sliderDimMax.v - 8,
        this.hsva.a * this.sliderDimMax.a - 8
      );

      if (emit && lastOutput !== this.outputColor) {
        this.directiveInstance.colorChanged(this.outputColor);
      }
    }
  }

  // Private helper functions for the color picker dialog positioning

  private setDialogPosition() {
    if (this.cpDialogDisplay === 'inline') {
      this.position = 'relative';
    } else {
      const dialogHeight = this.dialogElement.nativeElement.offsetHeight;

      let position = 'static', transform = '', style = null;

      let parentNode: any = null, transformNode: any = null;

      let node = this.directiveElementRef.nativeElement.parentNode;

      while (node !== null && node.tagName !== 'HTML') {
        style = window.getComputedStyle(node);
        position = style.getPropertyValue('position');
        transform = style.getPropertyValue('transform');

        if (position !== 'static' && parentNode === null) {
          parentNode = node;
        }

        if (transform && transform !== 'none' && transformNode === null) {
          transformNode = node;
        }

        if (position === 'fixed') {
          parentNode = transformNode;

          break;
        }

        node = node.parentNode;
      }

      const boxDirective = this.createBox(this.directiveElementRef.nativeElement, (position !== 'fixed'));

      if (this.useRootViewContainer || (position === 'fixed' && !parentNode)) {
        this.top = boxDirective.top;
        this.left = boxDirective.left;
      } else {
        if (parentNode === null) {
          parentNode = node;
        }

        const boxParent = this.createBox(parentNode, (position !== 'fixed'));

        this.top = boxDirective.top - boxParent.top;
        this.left = boxDirective.left - boxParent.left;
      }

      if (position === 'fixed') {
        this.position = 'fixed';
      }

      if (this.cpPosition === 'left') {
        this.top += boxDirective.height * this.cpPositionOffset / 100 - this.dialogArrowOffset;
        this.left -= this.cpWidth + this.dialogArrowSize - 2;
      } else if (this.cpPosition === 'top') {
        this.arrowTop = dialogHeight - 1;

        this.top -= dialogHeight + this.dialogArrowSize;
        this.left += this.cpPositionOffset / 100 * boxDirective.width - this.dialogArrowOffset;
      } else if (this.cpPosition === 'bottom') {
        this.top += boxDirective.height + this.dialogArrowSize;
        this.left += this.cpPositionOffset / 100 * boxDirective.width - this.dialogArrowOffset;
      } else {
        this.top += boxDirective.height * this.cpPositionOffset / 100 - this.dialogArrowOffset;
        this.left += boxDirective.width + this.dialogArrowSize - 2;
      }
    }
  }

  // Private helper functions for the color picker dialog positioning and opening

  private createBox(element: any, offset: boolean): any {
    return {
      top: element.getBoundingClientRect().top + (offset ? window.pageYOffset : 0),
      left: element.getBoundingClientRect().left + (offset ? window.pageXOffset : 0),
      width: element.offsetWidth,
      height: element.offsetHeight
    };
  }

  private isDescendant(parent: any, child: any): boolean {
    let node: any = child.parentNode;

    while (node !== null) {
      if (node === parent) {
        return true;
      }

      node = node.parentNode;
    }

    return false;
  }
}
