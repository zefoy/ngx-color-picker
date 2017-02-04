import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
    imports: [
        BrowserModule,
        ColorPickerModule
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
