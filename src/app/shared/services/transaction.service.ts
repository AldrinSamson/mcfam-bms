import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { MailerService } from './mailer.service';


@Injectable({
  providedIn: 'root'
})
export class TransactionService {



  constructor(public db: AngularFirestore,
    public mailerService: MailerService) {

  }

  getTransaction(uid: String, isManager: Boolean) {

    if (isManager === true) {
      return this.db.collection('transaction', ref =>
      ref.where('managerUid', '==', uid))
      .valueChanges({ idField: 'id' });
    } else {
      return this.db.collection('transaction', ref =>
      ref.where('agentUid', '==', uid))
      .valueChanges({ idField: 'id' });
    }
  }

  approveAndSetCommission(tid , rate , total , saleTotal) {
    return this.db.collection('transaction').doc(tid).update({
      commissionRate: rate,
      commissionTotal: total,
      saleTotal: saleTotal,
      isApproved: true,
      dateApproved: new Date(),
      stage: 4,
      doc_status: 'Manager have read and approved them',
      status: 'Approved, Awaiting Finalization'
    });
  }

  approveAndSetLease(tid , yearsToLease , leaseTotal , commissionTotal , saleTotal , leaseMonth , leaseYearStart , leaseYearEnd ) {
    return this.db.collection('transaction').doc(tid).update({
      yearsToLease: yearsToLease,
      leaseTotal: leaseTotal,
      commissionTotal: commissionTotal,
      saleTotal: saleTotal,
      leaseMonth: leaseMonth,
      leaseYearStart: leaseYearStart,
      leaseYearEnd : leaseYearEnd,
      isApproved: true,
      dateApproved: new Date(),
      stage: 4,
      doc_status: 'Manager have read and approved them',
      status: 'Approved, Awaiting Finalization'
    });
  }

  disapprove(tid) {
    return this.db.collection('transaction').doc(tid).update({
      isDisapproved: true,
      dateDisapproved: new Date(),
      doc_status: 'No Documents Uploaded , Deleted',
      status: 'Manager Disapproved'
    });
  }

  restoreDisapproved(tid) {
    return this.db.collection('transaction').doc(tid).update({
      stage: 2,
      isDisapproved: false,
      dateDisapproved: null,
      status: 'Awaiting Client Documents'
    });
  }

  finalizeSale(tid ) {
    return this.db.collection('transaction').doc(tid).update({
      stage: 5,
      isCompleted: true,
      status: 'Completed , No Feedback Yet',
      doc_status: 'Deleted',
      dateCompleted: new Date()
    });
  }

  finalizeLease(tid ) {
    return this.db.collection('transaction').doc(tid).update({
      stage: 5,
      isLeased: true,
      isCompleted: true,
      status: 'Leased, No Feedback Yet',
      doc_status: 'Deleted',
      dateFinalizedLease: new Date()
    });
  }

  endLease(tid) {
    return this.db.collection('transaction').doc(tid).update({
      isLeased: false,
      status: 'Completed, Was Leased',
      dateCompleted: new Date()
    });
  }

  deleteTransaction(tid) {
    return this.db.collection('transaction').doc(tid).delete();
  }
}
