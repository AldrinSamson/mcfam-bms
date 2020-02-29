import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
//import * as admin from 'firebase-admin';

import { Broker } from '../models';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class BrokerService {

  constructor(public afAuth: AngularFireAuth,
    public db: AngularFirestore) { }

  createBroker(values) {
    return this.afAuth.auth.createUserWithEmailAndPassword(values.brkrEmail, values.brkrPassword)
                 .then((authData) => {
                  this.db.collection('broker').add({
                    brkrID: values.brkrID,
                    brkrFirstName: values.brkrFirstName,
                    brkrLastName: values.brkrLastName,
                    brkrContactNumber : values.brkrContactNumber,
                    brkrAddress: values.brkrAddress,
                    brkrUsername: values.brkrUsername,
                    brkrClass: values.brkrClass,
                    brkrPhotoURL: values.brkrPhotoURL,
                    uid : authData.user.uid,
                  });
                }).catch((_error) => {
                    console.log('Broker Create Failed!', _error);
                });
  }

  deleteBroker(id) {
    /*
    admin.auth().deleteUser(id)
    .then(function() {
      console.log("Successfully deleted user");
      })
    .catch(function(error) {
      console.log("Error deleting user:", error);
    });
    */
  }
}
