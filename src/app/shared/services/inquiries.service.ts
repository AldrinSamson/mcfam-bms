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

  currentUser =  firebase.auth().currentUser.uid;

  constructor(public afAuth: AngularFireAuth,
    public db: AngularFirestore) { }

  getInquiries(isArchived: Boolean) {
    return this.db.collection('inquiry', ref => ref.where('agentUid', '==', firebase.auth().currentUser.uid).where('isArchived', '==', isArchived))
    .valueChanges({ idToken: 'id'});
  }
}
