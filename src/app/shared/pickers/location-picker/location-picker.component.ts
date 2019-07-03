import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation } from '../../../places/location.model'
import { of } from 'rxjs';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  selectedLocationImage: string;
  isLoading: boolean = false;

  constructor(private modalCtrl: ModalController, private http: HttpClient) { }

  ngOnInit() {}


  public onPickLocation() {
    this.modalCtrl.create({component: MapModalComponent}).then(
      modalEl => {
        modalEl.onDidDismiss().then(modalData => {
          if(!modalData.data) {
            return;
          }
          const pickedLocation: PlaceLocation = {
            lat: modalData.data.lat,
            lng: modalData.data.lng,
            address: null,
            staticMapImageUrl: null
          };
          this.isLoading = true;
          this.getAddress(modalData.data.lat, modalData.data.lng).pipe(
            switchMap(address => {
              pickedLocation.address = address;
              return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
            })
          ).subscribe( staticMapImageUrl => {
            pickedLocation.staticMapImageUrl = staticMapImageUrl;
            this.selectedLocationImage = staticMapImageUrl;
            this.isLoading = false;
          });
          
        });
        modalEl.present();
      }
    )
  }

  private getAddress(lat: number, lng: number){
    return this.http.get<any>(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`
      ).pipe( 
        map( geoData => {
          if(!geoData || !geoData.results || geoData.results.length === 0){
            return null;
          }
          return geoData.results[0].formatted_address;
        })
        )
  }

  private getMapImage(lat: number, lng: number, zoom: number ){
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap&markers=color:red%7Clabel:Place%7C${lat},${lng}&key=${environment.googleMapsAPIKey}`;

    //return `https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300&maptype=roadmap&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Clabel:C%7C40.718217,-73.998284&key=${environment.googleMapsAPIKey}`;
    //https://maps.googleapis.com/maps/api/staticmap?center=-34.39733640666691,150.64462227249146&zoom=14&size=500x300&maptype=roadmap%20%20%20%20&markers=color:red%7Clabel:Place%7C-34.39733640666691,150.64462227249146%20%20%20%20&key=AIzaSyCjLQZcHTlItC4ilTFfmfbTJoFj-GFkjhk
  }
}
