import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertService } from './alert.service';
import { HttpClient , HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BrokerService {

  constructor(public afAuth: AngularFireAuth,
    public db: AngularFirestore,
    public alertService: AlertService,
    public http: HttpClient) { }

  profpic: any;

  createProcess(values) {
    return new Promise(resolve => {
      this.afAuth.auth.createUserWithEmailAndPassword(values.email, values.password)
        .then((authData) => {
          this.db.collection('broker').add({
            // brokerId: values.brokerId,
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
          this.alertService.showToaster('Broker Create Success');
        })
        .catch((_error) => {
          console.log('Broker Create Failed!', _error);
        });
    });
  }
  async existUserNameCheck(values) {
    console.log(values);
    try {
      return new Promise(resolve => {
        this.db.collection('broker', ref =>
          ref.where('userName', '==', values)
        ).get().toPromise().then(function (querySnapshot) {
          console.log(querySnapshot.size);
          if (querySnapshot.size > 0) {
            // throw new Error('username already exist')
            resolve('username already exist');
          } else {
            resolve('no account');
          }
        }).catch(err => {
          alert('' + err);
        });
      });

    } catch (err) {

    }
  }

  async createBroker(values) {
    return new Promise(async resolve => {
      this.createProcess(values);
      resolve(null);
    }).catch(err => {
      console.log('Broker Create Failed!', err);
    });

  }

  getWithPosition(position) {
    return this.db.collection('broker', ref => ref.where('position', '==', position)).valueChanges({ idField: 'id' });
  }

  updateBroker(id, values, photoURL) {
    if (photoURL) {
      this.db.collection('broker').doc(id).update({
        photoURL: photoURL
      });
    }

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

  deleteBrokerAuth(uid) {
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
    }).unsubscribe();
  }

  computeRating(uid) {
    const url = 'https://us-central1-mcfam-systems.cloudfunctions.net/computeRating?uid=' + uid;
    return this.http.options(url).subscribe({
      error: error => console.error('There was an error!', error)
    }).unsubscribe();

  }
}
