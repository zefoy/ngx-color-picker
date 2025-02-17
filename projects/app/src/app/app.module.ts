import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ColorPickerComponent, ColorPickerDirective, SliderDirective } from "ngx-color-picker";

@NgModule({
  bootstrap: [
    AppComponent
  ],
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ColorPickerComponent,
    ColorPickerDirective,
    FormsModule,
  ]
})
export class AppModule {}
