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

  approveAndSetCommission(tid , rate , total , saleTotal){
    return this.db.collection('transaction').doc(tid).update({
      commissionRate: rate,
      commissionTotal: total,
      saleTotal: saleTotal,
      isApproved: true,
      dateApproved: new Date(),
      stage: 4,
      doc_status: 'Manager have read and approved them',
      status: 'Approved, Awaiting Finalization'

    })
  }

  approveAndSetLease(tid , yearsToLease , leaseTotal , commissionTotal , saleTotal ) {
    return this.db.collection('transaction').doc(tid).update({
      yearsToLease: yearsToLease,
      leaseTotal: leaseTotal,
      commissionTotal: commissionTotal,
      saleTotal: saleTotal,
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
      stage: 2,
      isDisapproved: false,
      dateDisapproved: null,
      status: 'Awaiting Manager Approval'
    })
  }

  finalize(tid , values){
    return this.db.collection('transaction').doc(tid).update({

    })
  }

  deleteTransaction(tid){
    return this.db.collection('transaction').doc(tid).delete()
  }
}
