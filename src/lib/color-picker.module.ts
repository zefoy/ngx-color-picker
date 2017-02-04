import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { TextDirective, SliderDirective } from './helpers';

import { ColorPickerService } from './color-picker.service';
import { ColorPickerComponent } from './color-picker.component';
import { ColorPickerDirective } from './color-picker.directive';

@NgModule({
  imports: [ BrowserModule ],
  providers: [ ColorPickerService ],
  declarations: [ ColorPickerComponent, ColorPickerDirective, TextDirective, SliderDirective ],
  exports: [ ColorPickerDirective ],
  entryComponents: [ ColorPickerComponent ]
})
export class ColorPickerModule {}
