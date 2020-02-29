import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';


import { Broker } from '../models';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class BrokerService {

  constructor(public afAuth: AngularFireAuth,
    public db: AngularFirestore,
    public alertService: AlertService) { }

  createBroker(values) {
    return this.afAuth.auth.createUserWithEmailAndPassword(values.email, values.password)
                 .then((authData) => {
                  this.db.collection('broker').add({
                    brokerId: values.brokerId,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    fullName: values.fullName,
                    username: values.username,
                    position: values.position,
                    contactNumber : values.contactNumber,
                    addressStreet: values.addressStreet,
                    addressTown: values.addressTown,
                    addressCity: values.addressCity,
                    addressRegion: values.addressRegion,
                    photoURL: values.photoURL,
                    uid : authData.user.uid,
                  });
                  this.alertService.showToaster('Create Success');
                })
                .catch((_error) => {
                    console.log('Broker Create Failed!', _error);
                });
  }

  deleteBroker(id) {
    // TODO : DELETE USER FROM FIRE AUTH
  }
}
