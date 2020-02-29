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
                    userName: values.userName,
                    position: values.position,
                    email: values.email,
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

  updateBroker(id ,values) {
    return this.db.collection('broker').doc(id).update({
      brokerId: values.brokerId,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    fullName: values.fullName,
                    userName: values.userName,
                    contactNumber : values.contactNumber,
                    addressStreet: values.addressStreet,
                    addressTown: values.addressTown,
                    addressCity: values.addressCity,
                    addressRegion: values.addressRegion,
    }) 
  }
  deleteBroker(id) {
    // TODO : DELETE USER FROM FIRE AUTH
  }
}
