import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Place } from '../../place.model';
import { NavController, ModalController, ActionSheetController, LoadingController } from '@ionic/angular';
import { PlacesService } from '../../places.service';
import {CreateBookingComponent} from '../../../bookings/create-booking/create-booking.component'
import { Subscription } from 'rxjs';
import { BookingService } from '../../../bookings/booking.service'
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place; 
  isBookable: boolean = false;
  private placeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService ) { }
   

    ngOnInit() {
      this.route.paramMap.subscribe(paramMap => {
        if (!paramMap.has('placeId')) {
          this.navCtrl.navigateBack('/places/tabs/discover');
          return;
        }
        this.placeSub = this.placesService.getPlace( paramMap.get('placeId') )
        .subscribe(place => {
          this.place = place;
          this.isBookable = place.userId !== this.authService.userId;
        });
      });
    }

    ngOnDestroy(){
      if(this.placeSub){
        this.placeSub.unsubscribe();
      }
    }

  onBookPlace() {

    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Dates',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Dates',
          handler: () => {
            this.openBookingModal('random');}
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then( actionSheetEl => {
      actionSheetEl.present();
    });

  }

  openBookingModal(mode: 'select' | 'random' ) {
    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: { selectedPlace: this.place, selectedMode: mode}
    })
    .then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    } )
    .then(resultData => {
      if (resultData.role === 'confirm') {
        this.loadingCtrl.create({message: 'Booking place...'}).then( loadingEl =>{
//14:42
          loadingEl.present();
          const data = resultData.data.bookingData; 
          this.bookingService.addBooking(
            this.place.id, 
            this.place.title, 
            this.place.imageUrl, 
            data.firstName, 
            data.lastName, 
            data.guestNumber, 
            data.startDate, 
            data.endDate).subscribe(() =>{
              loadingEl.dismiss();
            });  
        });
        
      }
    });


  }

}
