import {Component, ElementRef, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef} from '@angular/core';

import { ColorPickerService } from './color-picker.service';

import { Rgba, Hsla, Hsva } from './formats';
import { SliderPosition, SliderDimension } from './helpers';

@Component({
    selector: 'color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.css']
})

export class ColorPickerComponent implements OnInit, AfterViewInit {
    public cpPosition: string;
    public cpPositionOffset: number;
    public cpOutputFormat: string;
    public cpPresetLabel: string;
    public cpPresetColors: Array<string>;
    public cpCancelButton: boolean;
    public cpCancelButtonClass: string;
    public cpCancelButtonText: string;
    public cpOKButton: boolean;
    public cpOKButtonClass: string;
    public cpOKButtonText: string;
    public cpHeight: number;
    public cpWidth: number;
    public cpIgnoredElements: any;
    public cpDialogDisplay: string;
    public cpSaveClickOutside: boolean;
    public cpAlphaChannel: string;

    public rgbaText: Rgba;
    public hslaText: Hsla;
    public selectedColor: string;
    public alphaSliderColor: string;
    public hueSliderColor: string;
    public slider: SliderPosition;
    public show: boolean;
    public hidden: boolean;
    public top: number;
    public left: number;
    public position: string;
    public format: number;
    public hexText: string;
    public arrowTop: number;

    private hsva: Hsva;
    private outputColor: string;
    private sliderDimMax: SliderDimension;
    private directiveInstance: any;
    private initialColor: string;
    private directiveElementRef: ElementRef;

    private listenerMouseDown: any;
    private listenerResize: any;

    private dialogArrowSize: number = 10;
    private dialogArrowOffset: number = 15;

    @ViewChild('hueSlider') hueSlider: any;
    @ViewChild('alphaSlider') alphaSlider: any;
    @ViewChild('dialogPopup') dialogElement: any;

    constructor(private el: ElementRef, private cdr: ChangeDetectorRef, private service: ColorPickerService) { }

    setDialog(instance: any, elementRef: ElementRef, color: any, cpPosition: string, cpPositionOffset: string,
        cpPositionRelativeToArrow: boolean, cpOutputFormat: string, cpPresetLabel: string, cpPresetColors: Array<string>,
        cpCancelButton: boolean, cpCancelButtonClass: string, cpCancelButtonText: string,
        cpOKButton: boolean, cpOKButtonClass: string, cpOKButtonText: string,
        cpHeight: string, cpWidth: string,
        cpIgnoredElements: any, cpDialogDisplay: string, cpSaveClickOutside: boolean, cpAlphaChannel: string) {
        this.directiveInstance = instance;
        this.initialColor = color;
        this.directiveElementRef = elementRef;
        this.cpPosition = cpPosition;
        this.cpPositionOffset = parseInt(cpPositionOffset);
        if (!cpPositionRelativeToArrow) {
            this.dialogArrowOffset = 0;
        }
        this.cpOutputFormat = cpOutputFormat;
        this.cpPresetLabel = cpPresetLabel;
        this.cpPresetColors = cpPresetColors;
        this.cpCancelButton = cpCancelButton;
        this.cpCancelButtonClass = cpCancelButtonClass;
        this.cpCancelButtonText = cpCancelButtonText;
        this.cpOKButton = cpOKButton;
        this.cpOKButtonClass = cpOKButtonClass;
        this.cpOKButtonText = cpOKButtonText;
        this.cpHeight = parseInt(cpHeight);
        this.cpWidth = parseInt(cpWidth);
        if (!this.cpWidth) {
            this.cpWidth = elementRef.nativeElement.offsetWidth;
        }
        this.cpIgnoredElements = cpIgnoredElements;
        this.cpDialogDisplay = cpDialogDisplay;
        if (this.cpDialogDisplay === 'inline') {
            this.dialogArrowOffset = 0;
            this.dialogArrowSize = 0;
        }
        this.cpSaveClickOutside = cpSaveClickOutside;
        this.cpAlphaChannel = cpAlphaChannel;
    }

    ngOnInit() {
        let alphaWidth = this.alphaSlider.nativeElement.offsetWidth;
        let hueWidth = this.hueSlider.nativeElement.offsetWidth;
        this.sliderDimMax = new SliderDimension(hueWidth, this.cpWidth, 130, alphaWidth);
        this.slider = new SliderPosition(0, 0, 0, 0);
        if (this.cpOutputFormat === 'rgba') {
            this.format = 1;
        } else if (this.cpOutputFormat === 'hsla') {
            this.format = 2;
        } else {
            this.format = 0;
        }
        this.listenerMouseDown = (event: any) => { this.onMouseDown(event) };
        this.listenerResize = () => { this.onResize() };
        this.openDialog(this.initialColor, false);
    }

    ngAfterViewInit() {
        if (this.cpWidth != 230) {
            let alphaWidth = this.alphaSlider.nativeElement.offsetWidth;
            let hueWidth = this.hueSlider.nativeElement.offsetWidth;
            this.sliderDimMax = new SliderDimension(hueWidth, this.cpWidth, 130, alphaWidth);

            this.update(false);

            this.cdr.detectChanges();
        }
    }

    setInitialColor(color: any) {
        this.initialColor = color;
    }

    setPresetConfig(cpPresetLabel: string, cpPresetColors: Array<string>) {
        this.cpPresetLabel = cpPresetLabel;
        this.cpPresetColors = cpPresetColors;
    }

    openDialog(color: any, emit: boolean = true) {
        this.setInitialColor(color);
        this.setColorFromString(color, emit);
        this.openColorPicker();
    }

    cancelColor() {
        this.setColorFromString(this.initialColor, true);
        if (this.cpDialogDisplay === 'popup') {
            this.directiveInstance.colorChanged(this.initialColor, true);
            this.closeColorPicker();
        }
    }

    oKColor() {
        if (this.cpDialogDisplay === 'popup') {
            this.closeColorPicker();
        }

        if (this.outputColor) {
            this.directiveInstance.colorSelected(this.outputColor);
        }
    }

    setColorFromString(value: string, emit: boolean = true) {
        let hsva: Hsva;
        if (this.cpAlphaChannel === 'hex8') {
            hsva = this.service.stringToHsva(value, true);
            if (!hsva && !this.hsva) {
                hsva = this.service.stringToHsva(value, false);
            }
        } else {
            hsva = this.service.stringToHsva(value, false);
        }
        if (hsva) {
            this.hsva = hsva;
            this.update(emit);
        }
    }

    onMouseDown(event: any) {
        if ((!this.isDescendant(this.el.nativeElement, event.target)
            && event.target != this.directiveElementRef.nativeElement &&
            this.cpIgnoredElements.filter((item: any) => item === event.target).length === 0) && this.cpDialogDisplay === 'popup') {
            if (!this.cpSaveClickOutside) {
                this.setColorFromString(this.initialColor, false);
                this.directiveInstance.colorChanged(this.initialColor)
            }
            this.closeColorPicker();
        }
    }

    openColorPicker() {
        if (!this.show) {
            this.show = true;
            this.hidden = true;
            setTimeout(() => {
              this.setDialogPosition();
              this.hidden = false;
              this.cdr.detectChanges();
            }, 0);
            this.directiveInstance.toggle(true);
            document.addEventListener('mousedown', this.listenerMouseDown);
            window.addEventListener('resize', this.listenerResize);
        }
    }

    closeColorPicker() {
        if (this.show) {
            this.show = false;
            this.directiveInstance.toggle(false);
            document.removeEventListener('mousedown', this.listenerMouseDown);
            window.removeEventListener('resize', this.listenerResize);
            this.cdr.detectChanges();
        }
    }

    onResize() {
        if (this.position === 'fixed') {
            this.setDialogPosition();
        }
    }

    setDialogPosition() {
        let dialogHeight = this.dialogElement.nativeElement.offsetHeight;
        let node = this.directiveElementRef.nativeElement, position = 'static';
        let parentNode: any = null;
        while (node !== null && node.tagName !== 'HTML') {
            position = window.getComputedStyle(node).getPropertyValue("position");
            if (position !== 'static' && parentNode === null) {
                parentNode = node;
            }
            if (position === 'fixed') {
                break;
            }
            node = node.parentNode;
        }
        if (position !== 'fixed') {
            var boxDirective = this.createBox(this.directiveElementRef.nativeElement, true);
            if (parentNode === null) { parentNode = node }
            var boxParent = this.createBox(parentNode, true);
            this.top = boxDirective.top - boxParent.top;
            this.left = boxDirective.left - boxParent.left;
        } else {
            var boxDirective = this.createBox(this.directiveElementRef.nativeElement, false);
            this.top = boxDirective.top;
            this.left = boxDirective.left;
            this.position = 'fixed';
        }
        if (this.cpPosition === 'left') {
            this.top += boxDirective.height * this.cpPositionOffset / 100 - this.dialogArrowOffset;
            this.left -= this.cpWidth + this.dialogArrowSize - 2;
        } else if (this.cpPosition === 'top') {
            this.top -= dialogHeight + this.dialogArrowSize;
            this.left += this.cpPositionOffset / 100 * boxDirective.width - this.dialogArrowOffset;
            this.arrowTop = dialogHeight - 1;
        } else if (this.cpPosition === 'bottom') {
            this.top += boxDirective.height + this.dialogArrowSize;
            this.left += this.cpPositionOffset / 100 * boxDirective.width - this.dialogArrowOffset;
        } else {
            this.top += boxDirective.height * this.cpPositionOffset / 100 - this.dialogArrowOffset;
            this.left += boxDirective.width + this.dialogArrowSize - 2;
        }
    }

    setSaturation(val: { v: number, rg: number }) {
        let hsla = this.service.hsva2hsla(this.hsva);
        hsla.s = val.v / val.rg;
        this.hsva = this.service.hsla2hsva(hsla);
        this.update();

        this.directiveInstance.inputChanged({input: 'saturation', value: val});
    }

    setLightness(val: { v: number, rg: number }) {
        let hsla = this.service.hsva2hsla(this.hsva);
        hsla.l = val.v / val.rg;
        this.hsva = this.service.hsla2hsva(hsla);
        this.update();

        this.directiveInstance.inputChanged({input: 'lightness', value: val});
    }

    setHue(val: { v: number, rg: number }) {
        this.hsva.h = val.v / val.rg;
        this.update();

        this.directiveInstance.sliderChanged({slider: 'hue', value: val});
    }

    setAlpha(val: { v: number, rg: number }) {
        this.hsva.a = val.v / val.rg;
        this.update();

        this.directiveInstance.sliderChanged({slider: 'alpha', value: val});
    }

    setR(val: { v: number, rg: number }) {
        let rgba = this.service.hsvaToRgba(this.hsva);
        rgba.r = val.v / val.rg;
        this.hsva = this.service.rgbaToHsva(rgba);
        this.update();

        this.directiveInstance.inputChanged({input: 'red', value: val});
    }
    setG(val: { v: number, rg: number }) {
        let rgba = this.service.hsvaToRgba(this.hsva);
        rgba.g = val.v / val.rg;
        this.hsva = this.service.rgbaToHsva(rgba);
        this.update();

        this.directiveInstance.inputChanged({input: 'green', value: val});
    }
    setB(val: { v: number, rg: number }) {
        let rgba = this.service.hsvaToRgba(this.hsva);
        rgba.b = val.v / val.rg;
        this.hsva = this.service.rgbaToHsva(rgba);
        this.update();

        this.directiveInstance.inputChanged({input: 'blue', value: val});
    }
    setA(val: { v: number, rg: number }) {
        this.hsva.a = val.v / val.rg;
        this.update();

        this.directiveInstance.inputChanged({input: 'alpha', value: val});
    }

    setHex(val: string) {
      this.setColorFromString(val);

      this.directiveInstance.inputChanged({input: 'hex', value: val});
    }

    setSaturationAndBrightness(val: { s: number, v: number, rgX: number, rgY: number }) {
        this.hsva.s = val.s / val.rgX;
        this.hsva.v = val.v / val.rgY;
        this.update();
        this.directiveInstance.sliderChanged({slider: 'saturation-lightness', value: val});
    }

    formatPolicy(): number {
        this.format = (this.format + 1) % 3;
        if (this.format === 0 && this.hsva.a < 1 && this.cpAlphaChannel === 'hex6') {
            this.format++;
        }
        return this.format;
    }

    update(emit: boolean = true) {
        if (this.sliderDimMax) {
            let hsla = this.service.hsva2hsla(this.hsva);
            let rgba = this.service.denormalizeRGBA(this.service.hsvaToRgba(this.hsva));
            let hueRgba = this.service.denormalizeRGBA(this.service.hsvaToRgba(new Hsva(this.hsva.h, 1, 1, 1)));

            this.hslaText = new Hsla(Math.round((hsla.h) * 360), Math.round(hsla.s * 100), Math.round(hsla.l * 100), Math.round(hsla.a * 100) / 100);
            this.rgbaText = new Rgba(rgba.r, rgba.g, rgba.b, Math.round(rgba.a * 100) / 100);
            this.hexText = this.service.hexText(rgba, this.cpAlphaChannel === 'hex8');

            this.alphaSliderColor = 'rgb(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ')';
            this.hueSliderColor = 'rgb(' + hueRgba.r + ',' + hueRgba.g + ',' + hueRgba.b + ')';

            if (this.format === 0 && this.hsva.a < 1 && this.cpAlphaChannel === 'hex6') {
                this.format++;
            }

            let lastOutput = this.outputColor;
            this.outputColor = this.service.outputFormat(this.hsva, this.cpOutputFormat, this.cpAlphaChannel === 'hex8');
            this.selectedColor = this.service.outputFormat(this.hsva, 'rgba', false);

            this.slider = new SliderPosition((this.hsva.h) * this.sliderDimMax.h - 8, this.hsva.s * this.sliderDimMax.s - 8,
                (1 - this.hsva.v) * this.sliderDimMax.v - 8, this.hsva.a * this.sliderDimMax.a - 8)

            if (emit && lastOutput !== this.outputColor) {
                this.directiveInstance.colorChanged(this.outputColor);
            }
        }
    }

    isDescendant(parent: any, child: any): boolean {
        let node: any = child.parentNode;
        while (node !== null) {
            if (node === parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    createBox(element: any, offset: boolean): any {
        return {
            top: element.getBoundingClientRect().top + (offset ? window.pageYOffset : 0),
            left: element.getBoundingClientRect().left + (offset ? window.pageXOffset : 0),
            width: element.offsetWidth,
            height: element.offsetHeight
        };
    }
}
