import { OnInit, OnChanges, Directive, Input, Output, EventEmitter, Injector, ApplicationRef, ElementRef, ViewContainerRef, ReflectiveInjector, ComponentFactoryResolver } from '@angular/core';

import { ColorPickerService } from './color-picker.service';
import { ColorPickerComponent } from './color-picker.component';

import { SliderPosition, SliderDimension} from './helpers';

@Directive({
    selector: '[colorPicker]',
    host: {
        '(input)': 'inputChange($event.target.value)',
        '(click)': 'onClick()'
    }
})
export class ColorPickerDirective implements OnInit, OnChanges {
    @Input('colorPicker') colorPicker: string;
    @Input('cpToggle') cpToggle: boolean;
    @Input('cpPosition') cpPosition: string = 'right';
    @Input('cpPositionOffset') cpPositionOffset: string = '0%';
    @Input('cpPositionRelativeToArrow') cpPositionRelativeToArrow: boolean = false;
    @Input('cpOutputFormat') cpOutputFormat: string = 'hex';
    @Input('cpPresetLabel') cpPresetLabel: string = 'Preset colors';
    @Input('cpPresetColors') cpPresetColors: Array<string>;
    @Input('cpCancelButton') cpCancelButton: boolean = false;
    @Input('cpCancelButtonClass') cpCancelButtonClass: string = 'cp-cancel-button-class';
    @Input('cpCancelButtonText') cpCancelButtonText: string = 'Cancel';
    @Input('cpOKButton') cpOKButton: boolean = false;
    @Input('cpOKButtonClass') cpOKButtonClass: string = 'cp-ok-button-class';
    @Input('cpOKButtonText') cpOKButtonText: string = 'OK';
    @Input('cpFallbackColor') cpFallbackColor: string = '#000';
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

    private dialog: any;
    private created: boolean;
    private ignoreChanges: boolean = false;

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

    onClick() {
        if (this.cpIgnoredElements.filter((item: any) => item === this.elRef.nativeElement).length === 0) {
            this.openDialog();
        }
    }

    openDialog() {
        if (!this.created) {
            this.created = true;
            let vcRef = this.vcRef;
            if (this.cpUseRootViewContainer && this.cpDialogDisplay !== 'inline') {
              let classOfRootComponent = this.appRef.componentTypes[0];
              let appInstance = this.injector.get(classOfRootComponent);
              vcRef = appInstance.vcRef || appInstance.viewContainerRef || this.vcRef;
              if (vcRef === this.vcRef) {
                console.warn("You are using cpUseRootViewContainer, but the root component is not exposing viewContainerRef!" +
                  "Please expose it by adding 'public vcRef: ViewContainerRef' to the constructor.");
              }
            }
            const compFactory = this.cfr.resolveComponentFactory(ColorPickerComponent);
            const injector = ReflectiveInjector.fromResolvedProviders([], vcRef.parentInjector);
            const cmpRef = vcRef.createComponent(compFactory, 0, injector, []);
            cmpRef.instance.setDialog(this, this.elRef, this.colorPicker, this.cpPosition, this.cpPositionOffset,
                this.cpPositionRelativeToArrow, this.cpOutputFormat, this.cpPresetLabel, this.cpPresetColors,
                this.cpCancelButton, this.cpCancelButtonClass, this.cpCancelButtonText, this.cpOKButton,
                this.cpOKButtonClass, this.cpOKButtonText, this.cpHeight, this.cpWidth, this.cpIgnoredElements,
                this.cpDialogDisplay, this.cpSaveClickOutside, this.cpAlphaChannel, this.cpUseRootViewContainer);
            this.dialog = cmpRef.instance;

            if (this.vcRef !== vcRef) {
              cmpRef.changeDetectorRef.detectChanges();
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

    inputChange(value: string) {
        this.dialog.setColorFromString(value, true);
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
