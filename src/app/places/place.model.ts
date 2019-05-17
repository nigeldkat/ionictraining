import { DeprecatedCurrencyPipe } from '@angular/common';

export class Place {
  constructor(
    public id: string,
    public title: string,
    public decription: string,
    public imageUrl: string,
    public price: number,
    public availableFrom: Date,
    public availaleTo: Date
  ) {}
}
