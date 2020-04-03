import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { MailerService } from './mailer.service'


@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  
  

  constructor(public db: AngularFirestore,
    public mailerService: MailerService) { 
   
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

  approveAndSetCommission(tid , rate , total){
    return this.db.collection('transaction').doc(tid).update({
      commissionRate: rate,
      commissionTotal: total,
      isApproved: true,
      dateApproved: new Date(),
      stage: 4,
      doc_status: 'Manager have read and approved them',
      status: 'Approved, Awaiting Finalization'

    })
  }

  disapprove(tid){
    return this.db.collection('transaction').doc(tid).update({
      isDisapproved: true,
      dateDisapproved: new Date(),
      status: 'Manager Disapproved'
    })
  }

  restoreDisapproved(tid){
    return this.db.collection('transaction').doc(tid).update({
      isDisapproved: false,
      dateDisapproved: null,
      status: 'Awaiting Manager Approval'
    })
  }

  finalizeAndReport(tid , values){
    return this.db.collection('transaction').doc(tid).update({

    }).then( res => {
      this.db.collection('saleReport').add({
        date: new Date()
      })

    })
  }

  deleteTransaction(tid){
    return this.db.collection('transaction').doc(tid).delete()
  }
}
