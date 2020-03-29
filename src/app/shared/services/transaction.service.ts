import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  
  

  constructor(public db: AngularFirestore) { 
   
  }

  getTransaction(uid: String,isManager:Boolean) {

    if(isManager == true) {
      return this.db.collection('transaction', ref =>
      ref.where('managerUid', '==', uid))
      .valueChanges({ idField: 'id' });
    }else{
      return this.db.collection('transaction', ref =>
      ref.where('agentUid', '==', uid))
      .valueChanges({ idField: 'id' });
    }
  }
}
