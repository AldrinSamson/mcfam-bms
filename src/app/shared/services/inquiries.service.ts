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

  

  constructor(public afAuth: AngularFireAuth,
    public db: AngularFirestore) { }

  getBuyInquiries(uid: String) {
    return this.db.collection('buyInquiry', ref =>
    ref.where('agentUid', '==', uid))
    .valueChanges({ idField: 'id' });
  }

  getOpenSellInquiries() {
    return this.db.collection('sellInquiry', ref =>
    ref.where('isAssigned', '==', false).where('isArchived', '==', false))
    .valueChanges({ idField: 'id' });
  }

  getAssignedSellInquiries(uid: String) {
    return this.db.collection('sellInquiry', ref =>
    ref.where('managerUid', '==', uid))
    .valueChanges({ idField: 'id' });
  }

  assignInquiry(tid , uid: String) {
    return this.db.collection('sellInquiry').doc(tid).update({
      managerUid: uid,
      isAssigned: true
    });
  }
}
