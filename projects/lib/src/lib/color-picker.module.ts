import { NgModule } from '@angular/core';

import { TextDirective, SliderDirective } from './helpers';

import { ColorPickerService } from './color-picker.service';
import { ColorPickerComponent } from './color-picker.component';
import { ColorPickerDirective } from './color-picker.directive';

import './ng-dev-mode';

@NgModule({
    imports: [ColorPickerComponent, ColorPickerDirective, TextDirective, SliderDirective],
    exports: [ColorPickerComponent, ColorPickerDirective, TextDirective, SliderDirective],
    providers: [ColorPickerService],
})
export class ColorPickerModule {}
