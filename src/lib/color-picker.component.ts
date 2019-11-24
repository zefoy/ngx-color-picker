import {
    Component,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ViewChild,
    HostListener,
    ViewEncapsulation,
    ElementRef,
    ChangeDetectorRef,
    Renderer2,
} from '@angular/core';

import {
  detectIE,
  EditModeState,
  AlphaChannel,
  OutputFormat,
  SliderDimension,
  SliderPosition,
  Point,
  GradientType,
  Palette,
  Gradient,
  Color,
} from './helpers';

import { ColorFormats, Cmyk, Hsla, Hsva, Rgba } from './formats';

import { ColorPickerService } from './color-picker.service';

@Component({
  selector: 'color-picker',
  templateUrl: '../../dist/lib/color-picker.component.html',
  styleUrls: [ '../../dist/lib/color-picker.component.css' ],
  encapsulation: ViewEncapsulation.None
})
export class ColorPickerComponent implements OnInit, OnDestroy, AfterViewInit {
  private isIE10: boolean = false;

  private cmyk: Cmyk;
  private hsva: Hsva;

  private width: number;
  private height: number;

  private cmykColor: string;
  private outputColor: string;
  private initialColor: string;
  private fallbackColor: string;

  private listenerResize: any;
  private listenerMouseDown: any;

  private directiveInstance: any;

  private sliderH: number;
  private sliderDimMax: SliderDimension;
  private directiveElementRef: ElementRef;

  private dialogArrowSize: number = 10;
  private dialogArrowOffset: number = 15;

  public dialogInputFormats: any;

  public currentFormat: number = 0;

  public gradientTypes = GradientType;
  public currentGradientType: number = 0;

  public palettes = Palette;
  public currentPalette: number = 0;

  public degs: object = [
      0,
      45,
      90,
      135,
      180,
      225,
      270,
      315,
  ];

  public baseGradient: Gradient = {
    deg: 90,
    points: [
      {end: 80, color: 'rgba(153,159,173,0.5)'},
      {end: 200, color: 'rgb(6,82,253)'},
    ],
  };

  public templateColors = {
    linear: [
        {color: 'linear-gradient(45deg, rgb(20, 177, 20) 9%, rgb(100, 100, 231) 79%)'},
        {color: 'linear-gradient(90deg, rgb(78, 0, 168) 0%, rgb(231, 231, 231) 30%)'},
    ],
    radial: [
        {color: 'radial-gradient(circle, rgba(200, 100, 0, 0.4) 40%, rgba(100, 100, 19, 0.2) 79%)'},
        {color: 'radial-gradient(circle, rgba(200, 0, 100, 0.1) 10%, rgba(100, 0, 19, 0.95) 90%)'},
    ],
    solid: [
        {color: 'rgba(6,82,253,0.5)'},
        {color: 'rgb(153,159,173)'},
        {color: 'rgb(255,243,133)'},
    ],
  };

  public lastUsedColors = {
    linear: [
      {color: 'linear-gradient(45deg, rgb(78, 177, 168) 9%, rgb(231, 231, 231) 79%)'},
      {color: 'linear-gradient(90deg, rgb(78, 0, 168) 0%, rgb(231, 231, 231) 30%)'},
    ],
    radial: [
      {color: 'radial-gradient(circle, rgba(255, 0, 0, 0.85) 38%, rgba(100, 231, 19, 0.55) 79%)'},
      {color: 'radial-gradient(circle, rgba(255, 0, 0, 0.45) 10%, rgba(100, 0, 19, 0.95) 90%)'},
    ],
    solid: [
      {color: 'rgb(6,82,253)'},
      {color: 'rgb(153,159,173)'},
      {color: 'rgb(255,243,133)'},
    ],
  };

  public currentTemplateColor: any = {};
  public currentLastUsedColor: any = {};
  public currentGradientPoint: any = {};

  public show: boolean;
  public hidden: boolean;
  public top: number;
  public left: number;
  public position: string;
  public format: ColorFormats;
  public slider: SliderPosition;
  public hexText: string;
  public hexAlpha: number;
  public cmykText: Cmyk;
  public hslaText: Hsla;
  public rgbaText: Rgba;
  public arrowTop: number;
  public selectedColor: string;
  public hueSliderColor: string;
  public alphaSliderColor: string;

  public cpWidth: number;
  public cpHeight: number;

  public cpColorMode: number;

  public cpCmykEnabled: boolean;

  public cpAlphaChannel: AlphaChannel;
  public cpOutputFormat: OutputFormat;

  public cpDisableInput: boolean;
  public cpDialogDisplay: string;

  public cpIgnoredElements: any;

  public cpSaveClickOutside: boolean;
  public cpCloseClickOutside: boolean;

  public cpPosition: string;
  public cpPositionOffset: number;

  public cpOKButton: boolean;
  public cpOKButtonText: string;
  public cpOKButtonClass: string;

  public cpCancelButton: boolean;
  public cpCancelButtonText: string;
  public cpCancelButtonClass: string;

  public cpPresetLabel: string;
  public cpPresetColors: string[];
  public cpMaxPresetColorsLength: number;

  public cpPresetEmptyMessage: string;
  public cpPresetEmptyMessageClass: string;

  public cpAddColorButton: boolean;
  public cpAddColorButtonText: string;
  public cpAddColorButtonClass: string;
  public cpRemoveColorButtonClass: string;
  public cpTemplateColors: any;

  public cpLinearGradientLine: string;
  public gradientLine: string;
  public cpEditMode: EditModeState = EditModeState.DEFAULT;
  public modeState = EditModeState;

  @ViewChild('dialogPopup', { static: true }) dialogElement: ElementRef;

  @ViewChild('hueSlider', { static: true }) hueSlider: ElementRef;
  @ViewChild('alphaSlider', { static: true }) alphaSlider: ElementRef;
  @ViewChild('gradient', { static: false }) gradient: ElementRef;

  @ViewChild('points', {static: false}) points: ElementRef;
  @ViewChild('deletePointMenu', {static: false}) deletePointMenu: ElementRef;

private dialogInputFields: ColorFormats[] = [
    ColorFormats.HEX,
    ColorFormats.RGBA,
    ColorFormats.HSLA,
    ColorFormats.CMYK
];
private useRootViewContainer: boolean = false;

constructor(private elRef: ElementRef, private cdRef: ChangeDetectorRef,
            private service: ColorPickerService, private renderer: Renderer2) {
}

  @HostListener('document:keyup.esc', ['$event']) handleEsc(event: any): void {
    if (this.show && this.cpDialogDisplay === 'popup') {
      this.onCancelColor(event);
    }
  }

  @HostListener('document:keyup.enter', ['$event']) handleEnter(event: any): void {
    if (this.show && this.cpDialogDisplay === 'popup') {
      this.onAcceptColor(event);
    }
  }

  @HostListener('document:keyup', ['$event'])
    handleDeleteKeyboardEvent(event: KeyboardEvent) {
      if (event.key === 'Delete') {
        const id: number = this.baseGradient.points.indexOf(this.currentGradientPoint);
        this.removeItem(id);
   }
  }

  ngOnInit(): void {
    this.dialogInputFormats = [
      {id: ColorFormats.HEX, name: 'HEX'},
      {id: ColorFormats.RGBA, name: 'RGBA'},
      {id: ColorFormats.HSLA, name: 'HSLA'},
    ];
    if (this.cpCmykEnabled) {
      this.dialogInputFormats.push({id: ColorFormats.CMYK, name: 'CMYK'});
    }
    this.slider = new SliderPosition(0, 0, 0, 0);

    const hueWidth = this.hueSlider.nativeElement.offsetHeight || 230;
    const alphaWidth = this.alphaSlider.nativeElement.offsetHeight || 230;
    this.sliderDimMax = new SliderDimension(hueWidth, this.cpWidth, 230, alphaWidth);

    this.parseColorFromString(this.initialColor);

    if (this.cpCmykEnabled) {
      this.format = ColorFormats.CMYK;
    } else if (this.cpOutputFormat === 'rgba') {
      this.format = ColorFormats.RGBA;
    } else if (this.cpOutputFormat === 'hsla') {
      this.format = ColorFormats.HSLA;
    } else {
      this.format = ColorFormats.HEX;
    }

    this.listenerMouseDown = (event: any) => { this.onMouseDown(event); };
    this.listenerResize = () => { this.onResize(); };

    switch (this.currentGradientType) {
      case 0:
      case 1:
        this.openDialog(this.cpLinearGradientLine, false);
        this.refreshColors();
        break;
      default:
        this.openDialog(this.initialColor, false);
        break;
    }

    const storeLastUsedColors = localStorage.getItem('storeLastUsedColors');
    if (storeLastUsedColors !== null) {
      this.lastUsedColors = JSON.parse(storeLastUsedColors);
    }
  }

  ngOnDestroy(): void {
    this.closeDialog();
  }

  ngAfterViewInit(): void {
    if (this.cpWidth !== 230 || this.cpDialogDisplay === 'inline') {
      const hueWidth = this.hueSlider.nativeElement.offsetWidth || 230;
      const alphaWidth = this.alphaSlider.nativeElement.offsetWidth || 230;

      this.sliderDimMax = new SliderDimension(hueWidth, this.cpWidth, 230, alphaWidth);

      this.updateColorPicker(false);

      this.cdRef.detectChanges();
    }
  }

  public initColor() {
    const storeGradientPoints = localStorage.getItem('storeGradient');
    if (storeGradientPoints !== null) {
      this.baseGradient = JSON.parse(storeGradientPoints);
      if (this.baseGradient.points !== null) {
        this.baseGradient.points.sort((point1, point2) => {
          return point1.end - point2.end;
        });
      }
      if (this.baseGradient.deg !== null) {
        this.baseGradient.deg = Number(this.baseGradient.deg);
      }
    }
  }

  getLastUsedColorById(id: number): Color {
    switch (this.currentGradientType) {
      case 0:
        return this.lastUsedColors.linear[id];
      case 1:
        return this.lastUsedColors.radial[id];
      case 2:
        return this.lastUsedColors.solid[id];
      default:
        console.error('Undefined color type');
    }
    return {color: ''};
  }

  getLastUsedColors(): Color[] {
    switch (this.currentGradientType) {
      case 0:
        return this.lastUsedColors.linear;
      case 1:
        return this.lastUsedColors.radial;
      case 2:
        return this.lastUsedColors.solid;
      default:
        console.error('Undefined color type');
    }
    return [];
  }

    getTemplateColorById(id: number): Color {
      switch (this.currentGradientType) {
        case 0:
          return this.templateColors.linear[id];
        case 1:
          return this.templateColors.radial[id];
        case 2:
          return this.templateColors.solid[id];
        default:
          console.error('Undefined color type');
      }
      return {color: ''};
    }

    getTemplateColors(): Color[] {
      switch (this.currentGradientType) {
        case 0:
          return this.templateColors.linear;
        case 1:
          return this.templateColors.radial;
        case 2:
          return this.templateColors.solid;
        default:
          console.error('Undefined color type');
      }
      return [];
    }


  removeItem(id: number): any {
    if (id !== -1 && this.baseGradient.points.length > 2) {
      this.baseGradient.points.splice(id, 1);
      this.refreshColors();
      this.updateColorPicker();
    }
  }

  removePoint(): void {
    const id: number = this.baseGradient.points.indexOf(this.currentGradientPoint);
    this.removeItem(id);
    this.deletePointMenu.nativeElement.style.display = 'none';
  }

  onRightClick(id: number, e): void {
    e.preventDefault();
    let points: Point[] = [];
    if (this.currentGradientType === 0) {
        points = this.baseGradient.points;
    }
    if (this.currentGradientType === 1) {
        points = this.baseGradient.points;
    }
    if (points.length > 0 && points[id] === this.currentGradientPoint) {
        this.deletePointMenu.nativeElement.style.display = 'flex';
    }
  }

  getGradient(gradient: Gradient): string {
    gradient.points.sort((first, second) => {
      return first.end - second.end;
    });
    const gradientLineWidth = 209;
    const buf: string[] = [];
    gradient.points.forEach((value) => {
      const valuePercent: number = Math.round(value.end * 100 / gradientLineWidth);
      buf.push(value.color + ' ' + valuePercent + '%');
    });
    switch (this.currentGradientType) {
      case 0:
        this.gradientLine = 'linear-gradient(' + gradient.deg + 'deg, ' + buf.join(',') + ')';
        return this.gradientLine;
      case 1:
        this.gradientLine = 'linear-gradient(90deg, ' + buf.join(',') + ')';
        return 'radial-gradient(circle, ' + buf.join(',') + ')';
    }
    return '';
  }

  changeTemplateColor(color: string): void {
    if (this.cpEditMode === EditModeState.EDITING) {
      this.currentTemplateColor.color = color;
    }
  }

  public openDialog(color: any, emit: boolean = true): void {
    this.service.setActive(this);

    if (!this.width) {
      this.cpWidth = this.directiveElementRef.nativeElement.offsetWidth;
    }

    if (!this.height) {
      this.height = 320;
    }

    this.setInitialColor(color);

    this.setColorFromString(color, emit);
    this.parseColorFromString(color);

    this.openColorPicker();
  }

  public closeDialog(): void {
    this.closeColorPicker();
  }

public setupDialog(instance: any, elementRef: ElementRef, color: any, cpWidth: string, cpHeight: string,
   cpDialogDisplay: string, cpFallbackColor: string, cpColorMode: string, cpCmykEnabled: boolean,
   cpAlphaChannel: AlphaChannel, cpOutputFormat: OutputFormat, cpDisableInput: boolean, cpIgnoredElements: any,
   cpSaveClickOutside: boolean, cpCloseClickOutside: boolean, cpUseRootViewContainer: boolean,
   cpPosition: string, cpPositionOffset: string, cpPositionRelativeToArrow: boolean,
   cpPresetLabel: string, cpPresetColors: string[], cpMaxPresetColorsLength: number,
   cpPresetEmptyMessage: string, cpPresetEmptyMessageClass: string, cpOKButton: boolean,
   cpOKButtonClass: string, cpOKButtonText: string, cpCancelButton: boolean,
   cpCancelButtonClass: string, cpCancelButtonText: string, cpAddColorButton: boolean,
   cpAddColorButtonClass: string, cpAddColorButtonText: string,
   cpRemoveColorButtonClass: string, cpTemplateColors: any): void {
    this.setInitialColor(color);

    if (!cpTemplateColors) {
      this.cpTemplateColors = this.templateColors;
    }
    if (cpTemplateColors) {
      this.setTemplateColors(cpTemplateColors);
    }

    this.setColorMode(cpColorMode);

    this.isIE10 = (detectIE() === 10);

    this.directiveInstance = instance;
    this.directiveElementRef = elementRef;

    this.cpDisableInput = cpDisableInput;

    this.cpCmykEnabled = cpCmykEnabled;
    this.cpAlphaChannel = cpAlphaChannel;
    this.cpOutputFormat = cpOutputFormat;

    this.cpDialogDisplay = cpDialogDisplay;

    this.cpIgnoredElements = cpIgnoredElements;

    this.cpSaveClickOutside = cpSaveClickOutside;
    this.cpCloseClickOutside = cpCloseClickOutside;

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

    this.fallbackColor = cpFallbackColor || '#fff';

    this.setPresetConfig(cpPresetLabel, cpPresetColors);

    this.cpMaxPresetColorsLength = cpMaxPresetColorsLength;
    this.cpPresetEmptyMessage = cpPresetEmptyMessage;
    this.cpPresetEmptyMessageClass = cpPresetEmptyMessageClass;

    this.cpAddColorButton = cpAddColorButton;
    this.cpAddColorButtonText = cpAddColorButtonText;
    this.cpAddColorButtonClass = cpAddColorButtonClass;
    this.cpRemoveColorButtonClass = cpRemoveColorButtonClass;

    this.cpTemplateColors = cpTemplateColors;

    if (!cpPositionRelativeToArrow) {
      this.dialogArrowOffset = 0;
    }

    if (cpDialogDisplay === 'inline') {
      this.dialogArrowSize = 0;
      this.dialogArrowOffset = 0;
    }

    if (cpOutputFormat === 'hex' &&
        cpAlphaChannel !== 'always' && cpAlphaChannel !== 'forced')
    {
      this.cpAlphaChannel = 'disabled';
    }
  }

  public setColorMode(mode: string): void {
    switch (mode.toString().toUpperCase()) {
      case '1':
      case 'C':
      case 'COLOR':
        this.cpColorMode = 1;
        break;
      case '2':
      case 'G':
      case 'GRAYSCALE':
        this.cpColorMode = 2;
        break;
      case '3':
      case 'P':
      case 'PRESETS':
        this.cpColorMode = 3;
        break;
      default:
        this.cpColorMode = 1;
    }
  }

  public setInitialColor(color: any): void {
    this.initialColor = color;
  }

  public setPresetConfig(cpPresetLabel: string, cpPresetColors: string[]): void {
    this.cpPresetLabel = cpPresetLabel;
    this.cpPresetColors = cpPresetColors;
  }

  public setColorFromString(value: string, emit: boolean = true, update: boolean = true): void {
    let hsva: Hsva | null;

    if (this.cpAlphaChannel === 'always' || this.cpAlphaChannel === 'forced') {
      hsva = this.service.stringToHsva(value, true);

      if (!hsva && !this.hsva) {
        hsva = this.service.stringToHsva(value, false);
      }
    } else {
      hsva = this.service.stringToHsva(value, false);
    }

    if (!hsva && !this.hsva) {
      hsva = this.service.stringToHsva(this.fallbackColor, false);
    }

    if (hsva) {
      this.hsva = hsva;

      this.sliderH = this.hsva.h;

      this.updateColorPicker(emit, update);
    }
  }

  public setTemplateColors(cpTemplateColors: any): void {
    if (!cpTemplateColors) {
      this.cpTemplateColors = this.templateColors;
    }
    if (cpTemplateColors) {
      this.cpTemplateColors = cpTemplateColors;
      this.templateColors = cpTemplateColors;
    }
  }

  public onResize(): void {
    if (this.position === 'fixed') {
      this.setDialogPosition();
    } else if (this.cpDialogDisplay !== 'inline') {
      this.closeColorPicker();
    }
  }

  public onDragEnd(slider: string): void {
    this.directiveInstance.sliderDragEnd({ slider: slider, color: this.outputColor });
  }

  public onDragStart(slider: string): void {
    this.directiveInstance.sliderDragStart({ slider: slider, color: this.outputColor });
  }


  public onMouseDown(event: MouseEvent): void {
    if (this.show &&
        !this.isIE10 && this.cpDialogDisplay === 'popup' &&
        event.target !== this.directiveElementRef.nativeElement &&
        !this.isDescendant(this.elRef.nativeElement, event.target) &&
        !this.isDescendant(this.directiveElementRef.nativeElement, event.target) &&
        this.cpIgnoredElements.filter((item: any) => item === event.target).length === 0)
    {
      if (this.cpSaveClickOutside) {
        this.directiveInstance.colorSelected(this.outputColor);
        this.onAddLastUsedColors();

        if (this.currentGradientType === 0 || this.currentGradientType === 1) {
          this.currentGradientPoint = {};

          const slider = this.points.nativeElement;
          Array.from(slider.children).map((item: any) => {
            item.classList.remove('active');
          });
        }
        this.cpEditMode = EditModeState.DEFAULT;

      } else {
        this.setColorFromString(this.initialColor, false);

        if (this.cpCmykEnabled) {
          this.directiveInstance.cmykChanged(this.cmykColor);
        }
        this.refreshColors();
      }

      if (this.cpCloseClickOutside) {
        this.closeColorPicker();
      }
    }
  }

  public onAcceptColor(event: Event): void {
    event.stopPropagation();

    if (this.outputColor) {
      this.directiveInstance.colorSelected(this.outputColor);
    }

    if (this.cpDialogDisplay === 'popup') {
      this.closeColorPicker();
    }
  }

  public onCancelColor(event: Event): void {
    event.stopPropagation();

    this.setColorFromString(this.initialColor, true);

    if (this.cpDialogDisplay === 'popup') {
      if (this.cpCmykEnabled) {
        this.directiveInstance.cmykChanged(this.cmykColor);
      }

      this.refreshColors();

      this.closeColorPicker();
    }

    this.directiveInstance.colorCanceled();
  }

  public setCursor(color): void {
    const hsva = this.service.stringToHsva(color);
    if (hsva !== null) {
      this.onHueChange({rgX: 1, rgY: 1, v: hsva.h});
      this.onColorChange({rgY: 1, s: hsva.s, rgX: 1, v: hsva.v});
      this.onValueChange({rgX: 1, v: hsva.v});
      this.onAlphaChange({rgX: 1, v: hsva.a});
    }
  }

  public onGradientTypeChange(event: any): void {
    this.currentGradientType = Number(event.target.value);
    this.refreshColors();
    localStorage.setItem('currentGradientType', JSON.stringify(this.currentGradientType));
  }

  public onDegChange(event: any): void {
    this.baseGradient.deg = Number(event.target.value);
    this.refreshColors();
  }

  public onFormatChange(event: any): void {
    this.currentFormat = Number(event.target.value);
  }

  public onPaletteChange(element: any): void {
    this.currentPalette = Number(element.value);
    this.cpEditMode = EditModeState.DEFAULT;
  }

  public refreshColors(): void {
    switch (this.currentGradientType) {
      case 0:
        if ( this.baseGradient.deg === null) {
          this.baseGradient.deg = 90;
        }
        this.cpLinearGradientLine = this.getGradient(this.baseGradient);
        this.directiveInstance.colorChanged(this.cpLinearGradientLine);
        break;
      case 1:
        this.baseGradient.deg = null;
        this.cpLinearGradientLine = this.getGradient(this.baseGradient);
        this.directiveInstance.colorChanged(this.cpLinearGradientLine);
        break;
      default:
        this.directiveInstance.colorChanged(this.outputColor);
    }
  }

  public editTemplateColor(id: any): void {
    if (this.cpEditMode === EditModeState.DEFAULT) {
      this.setTemplateColor(id);
    }
    if (this.cpEditMode === EditModeState.EDIT) {
      this.cpEditMode = EditModeState.EDITING;
      this.setTemplateColor(id);

      switch (this.currentGradientType) {
        case 0:
          this.currentTemplateColor = this.templateColors.linear[id];
          break;
        case 1:
          this.currentTemplateColor = this.templateColors.radial[id];
          break;
        case 2:
          this.currentTemplateColor = this.templateColors.solid[id];
          break;
      }
      this.cpTemplateColors = this.templateColors;
      this.directiveInstance.templateColorsChanged(this.cpTemplateColors);
    }
    this.refreshColors();
  }

  public parseColorFromString(color: string): void {
    if (color) {
      if (color.includes('linear-gradient')
          || color.includes('radial-gradient')
      ) {
        this.parseColors(color);
      } else {
        this.currentGradientType = 2;
        this.outputColor = color;
        this.hueSliderColor = color;
      }

      this.refreshColors();
    }
  }

  public setLastUsedColor(id: any): void {
    const lastUsedColor = this.getLastUsedColorById(id).color;

    this.parseColorFromString(lastUsedColor);
    this.setCursor(lastUsedColor);
  }

  public setTemplateColor(id: any): void {
    const templateColor = this.getTemplateColorById(id).color;

    this.parseColorFromString(templateColor);
    this.setCursor(templateColor);
  }

  private convertColorType(item: any): Point {
    const gradientLineWidth = 209;
    const obj: Point = {
      end: Math.round(item.length.value * gradientLineWidth / 100),
      color: '',
    };
    switch (item.type) {
      case 'rgb':
      case 'rgba':
        obj.color = item.type + '(' + item.value.join(',') + ')';
        break;
      case 'hex':
        obj.color = '#' + item.value;
        break;
      default:
        console.log('Color error!', item);
    }
    return obj;
  }

  public parseColors(color: string): void {
    const gradient = require('gradient-parser');
    const obj = gradient.parse(color);
    this.baseGradient = {
      points: [],
    };
      switch (obj[0].type) {
      case 'linear-gradient': {
        this.currentGradientType = 0;
        this.baseGradient.deg = Number(obj[0].orientation.value);
        break;
      }
      case 'radial-gradient': {
        this.currentGradientType = 1;
        break;
      }
      default: {
        console.log('DEFAULT parseColors');
      }
    }
    obj[0].colorStops.forEach((item: any) => {
        this.baseGradient.points.push(this.convertColorType(item));
    });
    this.cpLinearGradientLine = color;
    this.refreshColors();
    return obj;
  }

  public onGradientPointChange(id: number): void {
    this.deletePointMenu.nativeElement.style.display = 'none';
    this.currentGradientPoint = this.baseGradient.points[id];

    const slider = this.points.nativeElement;
    const selectedGradientPoint = slider.children[id];

    Array.from(slider.children).map((item: any) => {
      item.classList.remove('active');
    });
    selectedGradientPoint.classList.add('active');

    this.hueSliderColor = this.currentGradientPoint.color;
    this.setCursor(this.currentGradientPoint.color);

    selectedGradientPoint.onmousemove = (e) => {
      e.stopPropagation();
      if (e.which !== 1) {
          return;
      }
      const gradientPointCoords = getCoords(selectedGradientPoint);
      const shiftX = e.pageX - gradientPointCoords.left;
      const sliderCoords = getCoords(slider);

      if (selectedGradientPoint.classList.contains('active')) {
        this.deletePointMenu.nativeElement.style.display = 'none';
        window.onmousemove = (event) => {
          let newLeft = event.pageX - shiftX - sliderCoords.left;
          if (newLeft < 0) {
            newLeft = 0;
          }
          const rightEdge = slider.offsetWidth - selectedGradientPoint.offsetWidth;
          if (newLeft > (rightEdge))
          {
            newLeft = (rightEdge);
          }
          selectedGradientPoint.style.left = Math.round(newLeft) + 'px';
          this.currentGradientPoint.end = parseFloat(selectedGradientPoint.style.left);

          this.refreshColors();
          this.updateColorPicker();

        };

        window.addEventListener('mouseup', () => {
          window.onmousemove = window.onmousedown = null;
        }, false);
      }
      return false;
  };

    selectedGradientPoint.ondragstart = () => {
      return false;
    };

    const getCoords = (elem) => {
      const box = elem.getBoundingClientRect();

      return {
        left: box.left + pageXOffset
      };
    };
  }

  private addLastUsedColor(): void {
    const colors = this.getLastUsedColors();
    const first = this.getLastUsedColorById(0);
    switch (this.currentGradientType) {
      case 0:
      case 1:
        if (first.color !== this.cpLinearGradientLine) {
          colors.unshift({color: this.cpLinearGradientLine});
        }
        break;
      case 2:
        if (first.color !== this.outputColor) {
          colors.unshift({color: this.outputColor});
        }
        break;
      default:
        console.error('Undefined color type');
    }
  }

  private addTemplateColor(): void {
    const colors = this.getTemplateColors();
    const first = this.getTemplateColorById(0);
    switch (this.currentGradientType) {
      case 0:
      case 1:
        if (first.color !== this.cpLinearGradientLine) {
          colors.unshift({color: this.cpLinearGradientLine});
        }
        break;
      case 2:
        if (first.color !== this.outputColor) {
          colors.unshift({color: this.outputColor});
        }
        break;
      default:
        console.error('Undefined color type');
    }
  }

  public onAddLastUsedColors(): void {
    const colors = this.getLastUsedColors();
    if (colors.length >= 32) {
      colors.pop();
    }
    this.addLastUsedColor();
    localStorage.setItem('storeLastUsedColors', JSON.stringify(this.lastUsedColors));
  }

  public onAddTemplateColors(): void {
    const colors = this.getTemplateColors();
    if (colors.length >= 32) {
      colors.pop();
    }
    this.addTemplateColor();
    this.cpTemplateColors = this.templateColors;
    this.directiveInstance.templateColorsChanged(this.cpTemplateColors);
  }

  public onColorChange(value: { s: number, v: number, rgX: number, rgY: number }): void {
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

  public onHueChange(value: { v: number, rgX: number, rgY: number }): void {
    this.hsva.h = value.v / value.rgX;
    this.sliderH = this.hsva.h;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'hue',
      value: this.hsva.h,
      color: this.outputColor
    });
  }

  public createNewPoint(event: any): void {
    const x = event.offsetX === undefined ? event.layerX : event.offsetX;
    this.currentGradientPoint = {end: x, color: this.selectedColor};
    this.baseGradient.points.push(this.currentGradientPoint);

    this.refreshColors();
    this.updateColorPicker();

    const idx = this.baseGradient.points.findIndex(item => {
      return item === this.currentGradientPoint;
    });

    setTimeout(() => {
      const slider = this.points.nativeElement;
      const selectedGradientPoint = slider.children[idx];
      Array.from(slider.children).map((item: any) => {
        item.classList.remove('active');
      });
      this.renderer.addClass(selectedGradientPoint, 'active');
    }, 0);
  }

  public onValueChange(value: { v: number, rgX: number }): void {
    this.hsva.v = value.v / value.rgX;
    this.sliderH = this.hsva.h;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'value',
      value: this.hsva.v,
      color: this.outputColor
    });
  }

  public onAlphaChange(value: { v: number, rgX: number }): void {
    this.hsva.a = value.v / value.rgX;
    this.sliderH = this.hsva.h;

    this.updateColorPicker();

    this.directiveInstance.sliderChanged({
      slider: 'alpha',
      value: this.hsva.a,
      color: this.outputColor
    });
  }

  public onHexInput(value: string | null): void {
    if (value === null) {
      this.updateColorPicker();
    } else {
      if (value && value[0] !== '#') {
        value = '#' + value;
      }

      let validHex = /^#([a-f0-9]{3}|[a-f0-9]{6})$/gi;

      if (this.cpAlphaChannel === 'always') {
        validHex = /^#([a-f0-9]{3}|[a-f0-9]{6}|[a-f0-9]{8})$/gi;
      }

      const valid = validHex.test(value);

      if (valid) {
        if (value.length < 5) {
          value = '#' + value.substring(1)
            .split('')
            .map(c => c + c)
            .join('');
        }

        if (this.cpAlphaChannel === 'forced') {
          value += Math.round(this.hsva.a * 255).toString(16);
        }

        this.setColorFromString(value, true, false);
      }

      this.directiveInstance.inputChanged({
        input: 'hex',
        valid: valid,
        value: value,
        color: this.outputColor
      });
    }
  }

  public onRedInput(value: { v: number, rg: number }): void {
    const rgba = this.service.hsvaToRgba(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      rgba.r = value.v / value.rg;

      this.hsva = this.service.rgbaToHsva(rgba);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'red',
      valid: valid,
      value: rgba.r,
      color: this.outputColor
    });
  }

  public onBlueInput(value: { v: number, rg: number }): void {
    const rgba = this.service.hsvaToRgba(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      rgba.b = value.v / value.rg;

      this.hsva = this.service.rgbaToHsva(rgba);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'blue',
      valid: valid,
      value: rgba.b,
      color: this.outputColor
    });
  }

  public onGreenInput(value: { v: number, rg: number }): void {
    const rgba = this.service.hsvaToRgba(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      rgba.g = value.v / value.rg;

      this.hsva = this.service.rgbaToHsva(rgba);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'green',
      valid: valid,
      value: rgba.g,
      color: this.outputColor
    });
  }

  public onHueInput(value: { v: number, rg: number }) {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.hsva.h = value.v / value.rg;

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'hue',
      valid: valid,
      value: this.hsva.h,
      color: this.outputColor
    });
  }

  public onValueInput(value: { v: number, rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.hsva.v = value.v / value.rg;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'value',
      valid: valid,
      value: this.hsva.v,
      color: this.outputColor
    });
  }

  public onAlphaInput(value: { v: number, rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      this.hsva.a = value.v / value.rg;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'alpha',
      valid: valid,
      value: this.hsva.a,
      color: this.outputColor
    });
  }

  public onLightnessInput(value: { v: number, rg: number }): void {
    const hsla = this.service.hsva2hsla(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      hsla.l = value.v / value.rg;

      this.hsva = this.service.hsla2hsva(hsla);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'lightness',
      valid: valid,
      value: hsla.l,
      color: this.outputColor
    });
  }

  public onSaturationInput(value: { v: number, rg: number }): void {
    const hsla = this.service.hsva2hsla(this.hsva);

    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

    if (valid) {
      hsla.s = value.v / value.rg;

      this.hsva = this.service.hsla2hsva(hsla);

      this.sliderH = this.hsva.h;

      this.updateColorPicker();
    }

    this.directiveInstance.inputChanged({
      input: 'saturation',
      valid: valid,
      value: hsla.s,
      color: this.outputColor
    });
  }

  public onCyanInput(value: { v: number, rg: number }): void {
     const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

     if (valid) {
      this.cmyk.c = value.v;

      this.updateColorPicker(false, true, true);
    }

     this.directiveInstance.inputChanged({
      input: 'cyan',
      valid: true,
      value: this.cmyk.c,
      color: this.outputColor
    });
  }

   public onMagentaInput(value: { v: number, rg: number }): void {
    const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

     if (valid) {
      this.cmyk.m = value.v;

      this.updateColorPicker(false, true, true);
    }

     this.directiveInstance.inputChanged({
      input: 'magenta',
      valid: true,
      value: this.cmyk.m,
      color: this.outputColor
    });
  }

  public onYellowInput(value: { v: number, rg: number }): void {
     const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

     if (valid) {
      this.cmyk.y = value.v;

      this.updateColorPicker(false, true, true);
    }

     this.directiveInstance.inputChanged({
      input: 'yellow',
      valid: true,
      value: this.cmyk.y,
      color: this.outputColor
    });
  }

   public onBlackInput(value: { v: number, rg: number }): void {
     const valid = !isNaN(value.v) && value.v >= 0 && value.v <= value.rg;

     if (valid) {
      this.cmyk.k = value.v;

      this.updateColorPicker(false, true, true);
    }

     this.directiveInstance.inputChanged({
      input: 'black',
      valid: true,
      value: this.cmyk.k,
      color: this.outputColor
    });
  }

  public onAddPresetColor(event: any, value: string): void {
    event.stopPropagation();

    if (!this.cpPresetColors.filter((color) => (color === value)).length) {
      this.cpPresetColors = this.cpPresetColors.concat(value);

      this.directiveInstance.presetColorsChanged(this.cpPresetColors);
    }
  }

  public onRemovePresetColor(event: any, value: string): void {
    event.stopPropagation();

    this.cpPresetColors = this.cpPresetColors.filter((color) => (color !== value));

    this.directiveInstance.presetColorsChanged(this.cpPresetColors);
  }

  // Private helper functions for the color picker dialog status

  takeColor(): void {
    // console.log('take Color works!');
  }

  toggleEditModeState(): void {
    switch (this.cpEditMode) {
        case EditModeState.DEFAULT:
            this.cpEditMode = EditModeState.EDIT;
            break;
        case EditModeState.EDIT:
            this.cpEditMode = EditModeState.DEFAULT;
            break;
        default:
            this.cpEditMode = EditModeState.DEFAULT;
    }
  }

  closeColorSwatchBox(): void {
    this.cpTemplateColors = this.templateColors;
    this.directiveInstance.templateColorsChanged(this.cpTemplateColors);
    this.cpEditMode = EditModeState.DEFAULT;
  }

  deleteColor(): void {
    const colors = this.getTemplateColors();
    let idx: number;
    switch (this.currentGradientType) {
      case 0:
        idx = this.templateColors.linear.findIndex(item => {
          return item.color === this.currentTemplateColor.color;
        });
        colors.splice(idx, 1);
        break;
      case 1:
        idx = this.templateColors.radial.findIndex(item => {
          return item.color === this.currentTemplateColor.color;
        });
        colors.splice(idx, 1);
        break;
      case 2:
        idx = this.templateColors.solid.findIndex(item => {
          return item.color === this.currentTemplateColor.color;
        });
        colors.splice(idx, 1);
        break;
    }

    this.cpTemplateColors = this.templateColors;
    this.directiveInstance.templateColorsChanged(this.cpTemplateColors);
    this.cpEditMode = EditModeState.DEFAULT;
  }

  private openColorPicker(): void {
    if (!this.show) {
      this.show = true;
      this.hidden = true;

      setTimeout(() => {
        this.hidden = false;

        this.setDialogPosition();

        this.cdRef.detectChanges();
      }, 0);

      this.directiveInstance.stateChanged(true);

      if (!this.isIE10) {
        document.addEventListener('mousedown', this.listenerMouseDown);
        document.addEventListener('touchstart', this.listenerMouseDown);
      }

      window.addEventListener('resize', this.listenerResize);
    }
  }

  private closeColorPicker(): void {
    if (this.show) {
      this.show = false;

      this.directiveInstance.stateChanged(false);

      if (!this.isIE10) {
        document.removeEventListener('mousedown', this.listenerMouseDown);
        document.removeEventListener('touchstart', this.listenerMouseDown);
      }

      window.removeEventListener('resize', this.listenerResize);

      if (!this.cdRef['destroyed']) {
        this.cdRef.detectChanges();
      }
    }
  }

  private updateColorPicker(emit: boolean = true, update: boolean = true, cmykInput: boolean = false): void {
    if (this.sliderDimMax) {
      if (this.cpColorMode === 2) {
        this.hsva.s = 0;
      }

      let hue: Rgba, hsla: Hsla, rgba: Rgba;

      const lastOutput = this.outputColor;

      hsla = this.service.hsva2hsla(this.hsva);

      if (!this.cpCmykEnabled) {
        rgba = this.service.denormalizeRGBA(this.service.hsvaToRgba(this.hsva));
      } else {
        if (!cmykInput) {
          rgba = this.service.hsvaToRgba(this.hsva);

          this.cmyk = this.service.denormalizeCMYK(this.service.rgbaToCmyk(rgba));
        } else {
          rgba = this.service.cmykToRgb(this.service.normalizeCMYK(this.cmyk));

          this.hsva = this.service.rgbaToHsva(rgba);
        }

        rgba = this.service.denormalizeRGBA(rgba);

        this.sliderH = this.hsva.h;
      }

      hue = this.service.denormalizeRGBA(this.service.hsvaToRgba(new Hsva(this.sliderH || this.hsva.h, 1, 1, 1)));

      if (update) {
        this.hslaText = new Hsla(Math.round((hsla.h) * 360), Math.round(hsla.s * 100), Math.round(hsla.l * 100),
          Math.round(hsla.a * 100));

        this.rgbaText = new Rgba(rgba.r, rgba.g, rgba.b, Math.round(rgba.a * 100));
        if (this.cpCmykEnabled) {
          this.cmykText = new Cmyk(this.cmyk.c, this.cmyk.m, this.cmyk.y, this.cmyk.k,
            Math.round(this.cmyk.a * 100));
        }

        const allowHex8 = this.cpAlphaChannel === 'always';

        this.hexText = this.service.rgbaToHex(rgba, allowHex8);
        this.hexAlpha = this.rgbaText.a;
      }

      if (this.cpOutputFormat === 'auto') {
        if (this.format !== ColorFormats.RGBA && this.format !== ColorFormats.CMYK) {
          if (this.hsva.a < 1) {
            this.format = this.hsva.a < 1 ? ColorFormats.RGBA : ColorFormats.HEX;
          }
        }
      }

      this.hueSliderColor = 'rgb(' + hue.r + ',' + hue.g + ',' + hue.b + ')';
      this.alphaSliderColor = 'rgb(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ')';

      this.outputColor = this.service.outputFormat(this.hsva, this.cpOutputFormat, this.cpAlphaChannel);
      this.selectedColor = this.service.outputFormat(this.hsva, 'rgba', null);

      this.currentGradientPoint.color = this.selectedColor;

      if (this.format !== ColorFormats.CMYK) {
        this.cmykColor = '';
      } else {
        if (this.cpAlphaChannel === 'always' || this.cpAlphaChannel === 'enabled' ||
          this.cpAlphaChannel === 'forced')
        {
          const alpha = Math.round(this.cmyk.a * 100) / 100;

          this.cmykColor = `cmyka(${this.cmyk.c},${this.cmyk.m},${this.cmyk.y},${this.cmyk.k},${alpha})`;
        } else {
          this.cmykColor = `cmyk(${this.cmyk.c},${this.cmyk.m},${this.cmyk.y},${this.cmyk.k})`;
        }
      }

      this.slider = new SliderPosition(
        (this.sliderH || this.hsva.h) * this.sliderDimMax.h - 8,
        this.hsva.s * this.sliderDimMax.s - 8,
        (1 - this.hsva.v) * this.sliderDimMax.v - 8,
        this.hsva.a * this.sliderDimMax.a - 8
      );

      switch (this.currentGradientType) {
        case 0:
        case 1:
          this.cpLinearGradientLine = this.getGradient(this.baseGradient);
          this.changeTemplateColor(this.cpLinearGradientLine);
          break;
        default:
          this.changeTemplateColor(this.outputColor);
      }

      if (emit && lastOutput !== this.outputColor) {
        if (this.cpCmykEnabled) {
          this.directiveInstance.cmykChanged(this.cmykColor);
        }
        this.refreshColors();
      }
    }
  }

  // Private helper functions for the color picker dialog positioning

  private setDialogPosition(): void {
    if (this.cpDialogDisplay === 'inline') {
      this.position = 'relative';
    } else {
      let position = 'static', transform = '', style;

      let parentNode: any = null, transformNode: any = null;

      let node = this.directiveElementRef.nativeElement.parentNode;

      const dialogHeight = this.dialogElement.nativeElement.offsetHeight;

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

      const boxDirective = this.createDialogBox(this.directiveElementRef.nativeElement, (position !== 'fixed'));

      if (this.useRootViewContainer || (position === 'fixed' &&
         (!parentNode || parentNode instanceof HTMLUnknownElement)))
      {
        this.top = boxDirective.top;
        this.left = boxDirective.left;
      } else {
        if (parentNode === null) {
          parentNode = node;
        }

        const boxParent = this.createDialogBox(parentNode, (position !== 'fixed'));

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

  private createDialogBox(element: any, offset: boolean): any {
    return {
      top: element.getBoundingClientRect().top + (offset ? window.pageYOffset : 0),
      left: element.getBoundingClientRect().left + (offset ? window.pageXOffset : 0),
      width: element.offsetWidth,
      height: element.offsetHeight
    };
  }
}
