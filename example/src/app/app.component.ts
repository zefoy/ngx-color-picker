import { Component } from '@angular/core';
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

    constructor(private cpService: ColorPickerService) {
        this.arrayColors['color'] = '#2883e9';
        this.arrayColors['color2'] = '#e920e9';
        this.arrayColors['color3'] = 'rgb(255,245,0)';
        this.arrayColors['color4'] = 'rgb(236,64,64)';
        this.arrayColors['color5'] = 'rgba(45,208,45,1)';
    }

    private color: string = '#2889e9';
    private color2: string = "hsla(300,82%,52%)";
    private color3: string = "#fff500";
    private color4: string = "rgb(236,64,64)";
    private color5: string = "rgba(45,208,45,1)";
    private color6: string = "#1973c0";
    private color7: string = "#f200bd";
    private color8: string = "#a8ff00";
    private color9: string = "#278ce2";
    private color10: string = "#0a6211";
    private color11: string = "#f2ff00";
    private color12: string = "#f200bd";
    private color13: string = "#1973c0";
    private color14: string = "#a8ff00";
    private color15: string = "#a51ad6a3";

    private arrayColors: any = {};
    private selectedColor: string = 'color';

    private toggle: boolean;
    private toggle2: boolean;
    private lastColor = '#ff0';
    private cmyk: Cmyk = new Cmyk(0, 0, 0, 0);

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
        return this.cpService.outputFormat(this.cpService.stringToHsva(color, true), 'rgba', true);
    }
}
