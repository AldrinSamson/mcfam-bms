import { AngularFirestore, validateEventsArray } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';

import { Inquiry } from '../models';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class InquiriesService {

  currentUser =  firebase.auth().currentUser.uid

  constructor(public afAuth: AngularFireAuth,
    public db: AngularFirestore) { }

  getInquiries(){
    return this.db.collection('inquries',ref => ref.where('agentUid', '==', this.currentUser)).snapshotChanges();
  }
}
