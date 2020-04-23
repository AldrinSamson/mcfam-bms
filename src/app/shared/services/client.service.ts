import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
// import * as admin from 'firebase-admin';

import { Broker } from '../models';
import { AlertService } from './alert.service';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(public afAuth: AngularFireAuth,
    public db: AngularFirestore,
    public alertService: AlertService,
    public http: HttpClient) { }

  createClient(values) {
    return this.afAuth.auth.createUserWithEmailAndPassword(values.email, values.password)
                 .then((authData) => {
                  this.db.collection('client').add({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    fullName: values.fullName,
                    userName: values.userName,
                    email: values.email,
                    contactNumber : values.contactNumber,
                    //addressStreet: values.addressStreet,
                    //addressTown: values.addressTown,
                    addressCity: values.addressCity,
                    addressRegion: values.addressRegion,
                    photoURL: values.photoURL,
                    uid : authData.user.uid,
                  });
                  this.alertService.showToaster('Create Success');
                })
                .catch((_error) => {
                    console.log('Client Create Failed!', _error);
                });
  }

  updateClient(id, values) {
    return this.db.collection('client').doc(id).update({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    fullName: values.fullName,
                    userName: values.userName,
                    contactNumber : values.contactNumber,
                    // addressStreet: values.addressStreet,
                    // addressTown: values.addressTown,
                    addressCity: values.addressCity,
                    addressRegion: values.addressRegion,
    });
  }

  deleteClientAuth(uid) {
    const url = 'https://us-central1-mcfam-systems.cloudfunctions.net/terminateUser';
    const body: any = {
      'uid' : uid,
    };
    const output = <JSON>body;
    const httpOptions = {
      responseType: 'text' as 'json'
    };
    return this.http.post<any>(url , <JSON>output , httpOptions ).subscribe({
      error: error => console.error('There was an error!', error)
    });
  }
}
