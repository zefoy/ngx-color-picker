import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextDirective, SliderDirective, EnumToArrayPipe } from './helpers';

import { ColorPickerService } from './color-picker.service';
import { ColorPickerComponent } from './color-picker.component';
import { ColorPickerDirective } from './color-picker.directive';

@NgModule({
  imports: [ CommonModule ],
  exports: [ ColorPickerDirective ],
  providers: [ ColorPickerService ],
  declarations: [
      ColorPickerComponent,
    ColorPickerDirective,
    TextDirective,
    SliderDirective,
    EnumToArrayPipe,
  ],
  entryComponents: [ ColorPickerComponent ]
})
export class ColorPickerModule {}
