import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  
  private isManager: Boolean;

  constructor(public db: AngularFirestore, public authService: AuthService) { 
    this.isManager = this.authService.isManager();
  }

  getTransaction(uid: String,isCompleted: Boolean , isDeleted:Boolean) {

    if(this.isManager == true) {
      return this.db.collection('transaction', ref =>
      ref.where('managerUid', '==', uid).where('isCompleted', '==', isCompleted).where('isDeleted', '==', isDeleted))
      .valueChanges({ idToken: 'id'});
    }else{
      return this.db.collection('transaction', ref =>
      ref.where('agentUid', '==', uid).where('isCompleted', '==', isCompleted).where('isDeleted', '==', isDeleted))
      .valueChanges({ idToken: 'id'});
    }
  }
}
