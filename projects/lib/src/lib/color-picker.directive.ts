import { Directive, OnChanges, OnDestroy, Input, Output, EventEmitter,
  HostListener, ApplicationRef, ComponentRef, ElementRef, ViewContainerRef,
  Injector, ComponentFactoryResolver, EmbeddedViewRef, TemplateRef } from '@angular/core';

import { ColorPickerService } from './color-picker.service';
import { ColorPickerComponent } from './color-picker.component';

import { AlphaChannel, ColorMode, OutputFormat } from './helpers';

// Caretaker note: we have still left the `typeof` condition in order to avoid
// creating a breaking change for projects that still use the View Engine.
// The `ngDevMode` is always available when Ivy is enabled.
// This will be evaluated during compilation into `const NG_DEV_MODE = false`,
// thus Terser will be able to tree-shake `console.warn` calls.
const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;

@Directive({
  selector: '[colorPicker]',
  exportAs: 'ngxColorPicker'
})
export class ColorPickerDirective implements OnChanges, OnDestroy {
  private dialog: any;

  private dialogCreated: boolean = false;
  private ignoreChanges: boolean = false;

  private cmpRef: ComponentRef<ColorPickerComponent>;
  private viewAttachedToAppRef: boolean = false;

  @Input() colorPicker: string;

  @Input() cpWidth: string = '230px';
  @Input() cpHeight: string = 'auto';

  @Input() cpToggle: boolean = false;
  @Input() cpDisabled: boolean = false;

  @Input() cpIgnoredElements: any = [];

  @Input() cpFallbackColor: string = '';

  @Input() cpColorMode: ColorMode = 'color';

  @Input() cpCmykEnabled: boolean = false;

  @Input() cpOutputFormat: OutputFormat = 'auto';
  @Input() cpAlphaChannel: AlphaChannel = 'enabled';

  @Input() cpDisableInput: boolean = false;

  @Input() cpDialogDisplay: string = 'popup';

  @Input() cpSaveClickOutside: boolean = true;
  @Input() cpCloseClickOutside: boolean = true;

  @Input() cpUseRootViewContainer: boolean = false;

  @Input() cpPosition: string = 'auto';
  @Input() cpPositionOffset: string = '0%';
  @Input() cpPositionRelativeToArrow: boolean = false;

  @Input() cpOKButton: boolean = false;
  @Input() cpOKButtonText: string = 'OK';
  @Input() cpOKButtonClass: string = 'cp-ok-button-class';

  @Input() cpCancelButton: boolean = false;
  @Input() cpCancelButtonText: string = 'Cancel';
  @Input() cpCancelButtonClass: string = 'cp-cancel-button-class';

  @Input() cpEyeDropper: boolean = false;

  @Input() cpPresetLabel: string = 'Preset colors';
  @Input() cpPresetColors: string[];
  @Input() cpPresetColorsClass: string = 'cp-preset-colors-class';
  @Input() cpMaxPresetColorsLength: number = 6;

  @Input() cpPresetEmptyMessage: string = 'No colors added';
  @Input() cpPresetEmptyMessageClass: string = 'preset-empty-message';

  @Input() cpAddColorButton: boolean = false;
  @Input() cpAddColorButtonText: string = 'Add color';
  @Input() cpAddColorButtonClass: string = 'cp-add-color-button-class';

  @Input() cpRemoveColorButtonClass: string = 'cp-remove-color-button-class';
  @Input() cpArrowPosition: number = 0;

  @Input() cpExtraTemplate: TemplateRef<any>;

  @Output() cpInputChange = new EventEmitter<{input: string, value: number | string, color: string}>(true);

  @Output() cpToggleChange = new EventEmitter<boolean>(true);

  @Output() cpSliderChange = new EventEmitter<{slider: string, value: string | number, color: string}>(true);
  @Output() cpSliderDragEnd = new EventEmitter<{slider: string, color: string}>(true);
  @Output() cpSliderDragStart = new EventEmitter<{slider: string, color: string}>(true);

  @Output() colorPickerOpen = new EventEmitter<string>(true);
  @Output() colorPickerClose = new EventEmitter<string>(true);

  @Output() colorPickerCancel = new EventEmitter<string>(true);
  @Output() colorPickerSelect = new EventEmitter<string>(true);
  @Output() colorPickerChange = new EventEmitter<string>(false);

  @Output() cpCmykColorChange = new EventEmitter<string>(true);

  @Output() cpPresetColorsChange = new EventEmitter<any>(true);

  @HostListener('click') handleClick(): void {
    this.inputFocus();
  }

  @HostListener('focus') handleFocus(): void {
    this.inputFocus();
  }

  @HostListener('input', ['$event']) handleInput(event: any): void {
    this.inputChange(event);
  }

  constructor(private injector: Injector, private cfr: ComponentFactoryResolver,
    private appRef: ApplicationRef, private vcRef: ViewContainerRef, private elRef: ElementRef,
    private _service: ColorPickerService) {}

  ngOnDestroy(): void {
    if (this.cmpRef != null) {
      if (this.viewAttachedToAppRef) {
        this.appRef.detachView(this.cmpRef.hostView);
      }

      this.cmpRef.destroy();

      this.cmpRef = null;
      this.dialog = null;
    }
  }

  ngOnChanges(changes: any): void {
    if (changes.cpToggle && !this.cpDisabled) {
      if (changes.cpToggle.currentValue) {
        this.openDialog();
      } else if (!changes.cpToggle.currentValue) {
        this.closeDialog();
      }
    }

    if (changes.colorPicker) {
      if (this.dialog && !this.ignoreChanges) {
        if (this.cpDialogDisplay === 'inline') {
          this.dialog.setInitialColor(changes.colorPicker.currentValue);
        }

        this.dialog.setColorFromString(changes.colorPicker.currentValue, false);

        if (this.cpUseRootViewContainer && this.cpDialogDisplay !== 'inline') {
          this.cmpRef.changeDetectorRef.detectChanges();
        }
      }

      this.ignoreChanges = false;
    }

    if (changes.cpPresetLabel || changes.cpPresetColors) {
      if (this.dialog) {
        this.dialog.setPresetConfig(this.cpPresetLabel, this.cpPresetColors);
      }
    }
  }

  public openDialog(): void {
    if (!this.dialogCreated) {
      let vcRef = this.vcRef;

      this.dialogCreated = true;
      this.viewAttachedToAppRef = false;

      if (this.cpUseRootViewContainer && this.cpDialogDisplay !== 'inline') {
        const classOfRootComponent = this.appRef.componentTypes[0];
        const appInstance = this.injector.get(classOfRootComponent, Injector.NULL);

        if (appInstance !== Injector.NULL) {
          vcRef = appInstance.vcRef || appInstance.viewContainerRef || this.vcRef;

          if (NG_DEV_MODE && vcRef === this.vcRef) {
            console.warn('You are using cpUseRootViewContainer, ' +
              'but the root component is not exposing viewContainerRef!' +
              'Please expose it by adding \'public vcRef: ViewContainerRef\' to the constructor.');
          }
        } else {
          this.viewAttachedToAppRef = true;
        }
      }

      const compFactory = this.cfr.resolveComponentFactory(ColorPickerComponent);

      if (this.viewAttachedToAppRef) {
        this.cmpRef = compFactory.create(this.injector);
        this.appRef.attachView(this.cmpRef.hostView);
        document.body.appendChild((this.cmpRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement);
      } else {
        const injector = Injector.create({
          providers: [],
          // We shouldn't use `vcRef.parentInjector` since it's been deprecated long time ago and might be removed
          // in newer Angular versions: https://github.com/angular/angular/pull/25174.
          parent: vcRef.injector,
        });

        this.cmpRef = vcRef.createComponent(compFactory, 0, injector, []);
      }

      this.cmpRef.instance.setupDialog(this, this.elRef, this.colorPicker,
        this.cpWidth, this.cpHeight, this.cpDialogDisplay, this.cpFallbackColor, this.cpColorMode,
        this.cpCmykEnabled, this.cpAlphaChannel, this.cpOutputFormat, this.cpDisableInput,
        this.cpIgnoredElements, this.cpSaveClickOutside, this.cpCloseClickOutside,
        this.cpUseRootViewContainer, this.cpPosition, this.cpPositionOffset,
        this.cpPositionRelativeToArrow, this.cpPresetLabel, this.cpPresetColors,
        this.cpPresetColorsClass, this.cpMaxPresetColorsLength, this.cpPresetEmptyMessage,
        this.cpPresetEmptyMessageClass, this.cpOKButton, this.cpOKButtonClass,
        this.cpOKButtonText, this.cpCancelButton, this.cpCancelButtonClass,
        this.cpCancelButtonText, this.cpAddColorButton, this.cpAddColorButtonClass,
        this.cpAddColorButtonText, this.cpRemoveColorButtonClass, this.cpEyeDropper, this.elRef,
        this.cpExtraTemplate);

      this.dialog = this.cmpRef.instance;

      if (this.vcRef !== vcRef) {
        this.cmpRef.changeDetectorRef.detectChanges();
      }
    } else if (this.dialog) {
      this.dialog.openDialog(this.colorPicker);
    }
  }

  public closeDialog(): void {
    if (this.dialog && this.cpDialogDisplay === 'popup') {
      this.dialog.closeDialog();
    }
  }

  public cmykChanged(value: string): void {
    this.cpCmykColorChange.emit(value);
  }

  public stateChanged(state: boolean): void {
    this.cpToggleChange.emit(state);

    if (state) {
      this.colorPickerOpen.emit(this.colorPicker);
    } else {
      this.colorPickerClose.emit(this.colorPicker);
    }
  }

  public colorChanged(value: string, ignore: boolean = true): void {
    this.ignoreChanges = ignore;

    this.colorPickerChange.emit(value);
  }

  public colorSelected(value: string): void {
    this.colorPickerSelect.emit(value);
  }

  public colorCanceled(): void {
    this.colorPickerCancel.emit();
  }

  public inputFocus(): void {
    const element = this.elRef.nativeElement;

    const ignored = this.cpIgnoredElements.filter((item: any) => item === element);

    if (!this.cpDisabled && !ignored.length) {
      if (typeof document !== 'undefined' && element === document.activeElement) {
        this.openDialog();
      } else if (!this.dialog || !this.dialog.show) {
        this.openDialog();
      } else {
        this.closeDialog();
      }
    }
  }

  public inputChange(event: any): void {
    if (this.dialog) {
      this.dialog.setColorFromString(event.target.value, true);
    } else {
      this.colorPicker = event.target.value;

      this.colorPickerChange.emit(this.colorPicker);
    }
  }

  public inputChanged(event: any): void {
    this.cpInputChange.emit(event);
  }

  public sliderChanged(event: any): void {
    this.cpSliderChange.emit(event);
  }

  public sliderDragEnd(event: { slider: string, color: string }): void {
    this.cpSliderDragEnd.emit(event);
  }

  public sliderDragStart(event: { slider: string, color: string }): void {
    this.cpSliderDragStart.emit(event);
  }

  public presetColorsChanged(value: any[]): void {
    this.cpPresetColorsChange.emit(value);
  }
}
