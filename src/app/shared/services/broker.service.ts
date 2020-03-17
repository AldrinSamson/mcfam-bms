import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
// import * as admin from 'firebase-admin';

import { Broker } from '../models';
import { AlertService } from './alert.service';
import { flatMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrokerService {

  constructor(public afAuth: AngularFireAuth,
    public db: AngularFirestore,
    public alertService: AlertService) { }
  profpic: any;

  createProcess(values) {
    console.log(values.userName);
    //console.log(xx);
    var thisclass = this;
    return new Promise(resolve => {
      thisclass.afAuth.auth.createUserWithEmailAndPassword(values.email, values.password)
        .then((authData) => {
          thisclass.db.collection('broker').add({
            //brokerId: values.brokerId,
            firstName: values.firstName,
            lastName: values.lastName,
            fullName: values.fullName,
            userName: values.userName,
            position: values.position,
            email: values.email,
            contactNumber: values.contactNumber,
            addressStreet: values.addressStreet,
            addressTown: values.addressTown,
            addressCity: values.addressCity,
            addressRegion: values.addressRegion,
            photoURL: values.photoURL,
            uid: authData.user.uid,
          });
          thisclass.alertService.showToaster('Create Success');
          resolve('success');
        })
        .catch((_error) => {
          console.log('Broker Create Failed!', _error);
        });
    })
  }
  async existUserNameCheck(values) {
    var thisclass = this;
    console.log(values);
    try {
      return new Promise(resolve => {
        thisclass.db.collection('broker', ref =>
          ref.where('userName', '==', values)
        ).get().toPromise().then(function (querySnapshot) {
          console.log(querySnapshot.size);
          if(querySnapshot.size >0){
            //throw new Error('username already exist')
            resolve('username already exist')
          }else{
            resolve('no account')
          }
        }).catch(err=>{
          alert('' + err);
        });
      })
    
    } catch (err) {
      
    }
  }

  async createBroker(values) {
    var thisclass = this;
    console.log("createBroker");
    return new Promise(async resolve => {
      console.log('a');
      this.createProcess(values);
      resolve(null);
    }).catch(err=>{
      //throw new Error(err);
    })

  }

  updateBroker(id, values) {
    return this.db.collection('broker').doc(id).update({
      brokerId: values.brokerId,
      firstName: values.firstName,
      lastName: values.lastName,
      fullName: values.fullName,
      userName: values.userName,
      contactNumber: values.contactNumber,
      addressStreet: values.addressStreet,
      addressTown: values.addressTown,
      addressCity: values.addressCity,
      addressRegion: values.addressRegion,
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
