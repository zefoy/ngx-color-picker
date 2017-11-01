import { OnInit, OnChanges, Directive, Input, Output, EventEmitter, Injector, ApplicationRef, ElementRef, ViewContainerRef, ReflectiveInjector, ComponentFactoryResolver, ComponentRef, OnDestroy } from '@angular/core';

import { ColorPickerService } from './color-picker.service';
import { ColorPickerComponent } from './color-picker.component';

import { SliderPosition, SliderDimension} from './helpers';

@Directive({
    selector: '[colorPicker]',
    host: {
      '(click)': 'inputFocus()',
      '(focus)': 'inputFocus()',
      '(input)': 'inputChange($event.target.value)'
    }
})
export class ColorPickerDirective implements OnInit, OnChanges, OnDestroy {
    @Input('colorPicker') colorPicker: string;
    @Input('cpToggle') cpToggle: boolean;
    @Input('cpPosition') cpPosition: string = 'right';
    @Input('cpPositionOffset') cpPositionOffset: string = '0%';
    @Input('cpPositionRelativeToArrow') cpPositionRelativeToArrow: boolean = false;
    @Input('cpOutputFormat') cpOutputFormat: string = 'hex';
    @Input('cpPresetLabel') cpPresetLabel: string = 'Preset colors';
    @Input('cpPresetEmptyMessage') cpPresetEmptyMessage: string = 'No colors added';
    @Input('cpPresetEmptyMessageClass') cpPresetEmptyMessageClass: string = 'preset-empty-message';
    @Input('cpPresetColors') cpPresetColors: Array<string>;
    @Input('cpMaxPresetColorsLength') cpMaxPresetColorsLength: number = 6;
    @Input('cpCancelButton') cpCancelButton: boolean = false;
    @Input('cpCancelButtonClass') cpCancelButtonClass: string = 'cp-cancel-button-class';
    @Input('cpCancelButtonText') cpCancelButtonText: string = 'Cancel';
    @Input('cpOKButton') cpOKButton: boolean = false;
    @Input('cpOKButtonClass') cpOKButtonClass: string = 'cp-ok-button-class';
    @Input('cpOKButtonText') cpOKButtonText: string = 'OK';
    @Input('cpAddColorButton') cpAddColorButton: boolean = false;
    @Input('cpAddColorButtonClass') cpAddColorButtonClass: string = 'cp-add-color-button-class';
    @Input('cpAddColorButtonText') cpAddColorButtonText: string = 'Add color';
    @Input('cpRemoveColorButtonClass') cpRemoveColorButtonClass: string = 'cp-remove-color-button-class';
    @Input('cpFallbackColor') cpFallbackColor: string = '#fff';
    @Input('cpHeight') cpHeight: string = 'auto';
    @Input('cpWidth') cpWidth: string = '230px';
    @Input('cpIgnoredElements') cpIgnoredElements: any = [];
    @Input('cpDialogDisplay') cpDialogDisplay: string = 'popup';
    @Input('cpSaveClickOutside') cpSaveClickOutside: boolean = true;
    @Input('cpAlphaChannel') cpAlphaChannel: string = 'enabled';
    @Input('cpUseRootViewContainer') cpUseRootViewContainer: boolean = false;

    @Output('cpInputChange') cpInputChange = new EventEmitter<any>(true);

    @Output('cpToggleChange') cpToggleChange = new EventEmitter<boolean>(true);

    @Output('cpSliderChange') cpSliderChange = new EventEmitter<any>(true);
    @Output('cpSliderDragEnd') cpSliderDragEnd = new EventEmitter<string>(true);
    @Output('cpSliderDragStart') cpSliderDragStart = new EventEmitter<string>(true);

    @Output('colorPickerCancel') colorPickerCancel = new EventEmitter<string>(true);
    @Output('colorPickerSelect') colorPickerSelect = new EventEmitter<string>(true);
    @Output('colorPickerChange') colorPickerChange = new EventEmitter<string>(false);
    @Output('cpPresetColorsChange') presetColorsChange = new EventEmitter<any>(true);

    private dialog: any;
    private created: boolean;
    private ignoreChanges: boolean = false;
    private cmpRef: ComponentRef<ColorPickerComponent>;

    constructor(private injector: Injector, private cfr: ComponentFactoryResolver,
      private appRef: ApplicationRef, private vcRef: ViewContainerRef, private elRef: ElementRef,
      private service: ColorPickerService)
    {
        this.created = false;
    }

    ngOnChanges(changes: any): void {
        if (changes.cpToggle) {
            if (changes.cpToggle.currentValue) this.openDialog();
            if (!changes.cpToggle.currentValue && this.dialog) this.dialog.closeColorPicker();
        }
        if (changes.colorPicker) {
            if (this.dialog && !this.ignoreChanges) {
                if (this.cpDialogDisplay === 'inline') {
                    this.dialog.setInitialColor(changes.colorPicker.currentValue);
                }
                this.dialog.setColorFromString(changes.colorPicker.currentValue, false);

            }
            this.ignoreChanges = false;
        }
        if (changes.cpPresetLabel || changes.cpPresetColors) {
            if (this.dialog) {
                this.dialog.setPresetConfig(this.cpPresetLabel, this.cpPresetColors);
            }
        }
    }

    ngOnInit() {
        this.colorPicker = this.colorPicker || this.cpFallbackColor || 'rgba(0, 0, 0, 1)';
        /*let hsva = this.service.stringToHsva(this.colorPicker);
        if (hsva === null) hsva = this.service.stringToHsva(this.colorPicker, true);
        if (hsva == null) {
            hsva = this.service.stringToHsva(this.cpFallbackColor);
        }
        let color = this.service.outputFormat(hsva, this.cpOutputFormat, this.cpAlphaChannel);
        if (color !== this.colorPicker) {
            //setTimeout(() => {
              this.colorPickerChange.emit(color);
              this.cdr.detectChanges();
            //}, 0);
        }*/
    }

    ngOnDestroy() {
        if (this.cmpRef !== undefined) {
            this.cmpRef.destroy();
        }
    }

    openDialog() {
        this.colorPicker = this.colorPicker || this.cpFallbackColor || 'rgba(0, 0, 0, 1)';

        if (!this.created) {
            this.created = true;
            let vcRef = this.vcRef;
            if (this.cpUseRootViewContainer && this.cpDialogDisplay !== 'inline') {
              const classOfRootComponent = this.appRef.componentTypes[0];
              const appInstance = this.injector.get(classOfRootComponent);
              vcRef = appInstance.vcRef || appInstance.viewContainerRef || this.vcRef;
              if (vcRef === this.vcRef) {
                console.warn('You are using cpUseRootViewContainer, but the root component is not exposing viewContainerRef!' +
                  'Please expose it by adding \'public vcRef: ViewContainerRef\' to the constructor.');
              }
            }
            const compFactory = this.cfr.resolveComponentFactory(ColorPickerComponent);
            const injector = ReflectiveInjector.fromResolvedProviders([], vcRef.parentInjector);
            this.cmpRef = vcRef.createComponent(compFactory, 0, injector, []);
            this.cmpRef.instance.setDialog(this, this.elRef, this.colorPicker, this.cpPosition, this.cpPositionOffset,
                this.cpPositionRelativeToArrow, this.cpOutputFormat, this.cpPresetLabel, this.cpPresetEmptyMessage,
                this.cpPresetEmptyMessageClass, this.cpPresetColors, this.cpMaxPresetColorsLength,
                this.cpCancelButton, this.cpCancelButtonClass, this.cpCancelButtonText,
                this.cpOKButton, this.cpOKButtonClass, this.cpOKButtonText,
                this.cpAddColorButton, this.cpAddColorButtonClass, this.cpAddColorButtonText,
                this.cpRemoveColorButtonClass,
                this.cpHeight, this.cpWidth, this.cpIgnoredElements,
                this.cpDialogDisplay, this.cpSaveClickOutside, this.cpAlphaChannel, this.cpUseRootViewContainer);
            this.dialog = this.cmpRef.instance;

            if (this.vcRef !== vcRef) {
                this.cmpRef.changeDetectorRef.detectChanges();
            }
        } else if (this.dialog) {
            this.dialog.openDialog(this.colorPicker);
        }
    }

    toggle(value: boolean) {
        this.cpToggleChange.emit(value);
    }

    colorChanged(value: string, ignore: boolean = true) {
        this.ignoreChanges = ignore;
        this.colorPickerChange.emit(value);
    }

    colorCanceled() {
      this.colorPickerCancel.emit();
    }

    colorSelected(value: string) {
        this.colorPickerSelect.emit(value);
    }

    presetColorsChanged(value: Array<any>) {
        this.presetColorsChange.emit(value);
    } 

    inputFocus() {
        if (this.cpIgnoredElements.filter((item: any) => item === this.elRef.nativeElement).length === 0) {
            this.openDialog();
        }
    }

    inputChange(value: string) {
      if (this.dialog) {
        this.dialog.setColorFromString(value, true);
      } else {
        this.colorPicker = value || this.cpFallbackColor || 'rgba(0, 0, 0, 1)';

        this.colorPickerChange.emit(this.colorPicker);
      }
    }

    inputChanged(event: any) {
        this.cpInputChange.emit(event);
    }

    sliderChanged(event: any) {
        this.cpSliderChange.emit(event);
    }

    sliderDragEnd(event: any) {
        this.cpSliderDragEnd.emit(event);
    }

    sliderDragStart(event: any) {
        this.cpSliderDragStart.emit(event);
    }
}
