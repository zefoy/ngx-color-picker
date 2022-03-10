export enum ColorFormats {
  HEX,
  RGBA,
  HSLA,
  CMYK,
}

export class Rgba {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number
  ) {}
}

export class Hsva {
  constructor(
    public h: number,
    public s: number,
    public v: number,
    public a: number
  ) {}
}

export class Hsla {
  constructor(
    public h: number,
    public s: number,
    public l: number,
    public a: number
  ) {}
}

export class Cmyk {
  constructor(
    public c: number,
    public m: number,
    public y: number,
    public k: number,
    public a: number = 1
  ) {}
}
