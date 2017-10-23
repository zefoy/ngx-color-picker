import { Component, ViewContainerRef } from '@angular/core';
import { ColorPickerService, Rgba } from 'ngx-color-picker';

export class Cmyk {
    constructor(public c: number, public m: number, public y: number, public k: number) { }
}

@Component({
    moduleId: module.id + '',
    selector: 'my-app',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css']
})
export class AppComponent {

    constructor(public vcRef: ViewContainerRef, private cpService: ColorPickerService) {
        this.arrayColors['color'] = '#2883e9';
        this.arrayColors['color2'] = '#e920e9';
        this.arrayColors['color3'] = 'rgb(255,245,0)';
        this.arrayColors['color4'] = 'rgb(236,64,64)';
        this.arrayColors['color5'] = 'rgba(45,208,45,1)';
    }

    public rgbaText: string = '';

    public color: string = '#2889e9';
    public color2: string = "hsla(300,82%,52%)";
    public color3: string = "#fff500";
    public color4: string = "rgb(236,64,64)";
    public color5: string = "rgba(45,208,45,1)";
    public color6: string = "#1973c0";
    public color7: string = "#f200bd";
    public color8: string = "#a8ff00";
    public color9: string = "#278ce2";
    public color10: string = "#0a6211";
    public color11: string = "#f2ff00";
    public color12: string = "#f200bd";
    public color13: string = "rgba(0, 255, 0, 0.5)";
    public color14: string = "rgb(0, 255, 255)";
    public color15: string = "#a51ad633";
    public color16: string = "rgba(45,208,45,0.5)";

    public arrayColors: any = {};
    public selectedColor: string = 'color';

    public toggle: boolean;
    public toggle2: boolean;
    private lastColor = '#ff0';
    public cmyk: Cmyk = new Cmyk(0, 0, 0, 0);

    onEventLog(event: string, data: any) {
      console.log(event, data);
    }

    onChangeColor(color: string): Cmyk {
        return this.rgbaToCmyk(this.cpService.hsvaToRgba(this.cpService.stringToHsva(color)));
    }

    rgbaToCmyk(rgba: Rgba): Cmyk {
        let cmyk: Cmyk = new Cmyk(0, 0, 0, 0), k: number;
        k = 1 - Math.max(rgba.r, rgba.g, rgba.b);
        if (k == 1) return new Cmyk(0, 0, 0, 1);
        cmyk.c = (1 - rgba.r - k) / (1 - k);
        cmyk.m = (1 - rgba.g - k) / (1 - k);
        cmyk.y = (1 - rgba.b - k) / (1 - k);
        cmyk.k = k;
        return cmyk;
    }

    onChangeColorHex8(color: string): string {
        return this.cpService.outputFormat(this.cpService.stringToHsva(color, true), 'rgba', null);
    }
}
