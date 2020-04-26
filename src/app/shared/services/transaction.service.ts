import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { MailerService } from './mailer.service';
import * as JSZipUtils from 'jszip-utils'
import * as JSZip from 'jszip';
import { FileService } from '@shared/services/file.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {



  constructor(public db: AngularFirestore,
    public mailerService: MailerService,
    public fileservice: FileService
  ) {

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

  getOneTransaction(id) {
    console.log(id);
    const thisclass = this;
    return new Promise(function (resolve) {
      thisclass.db.collection('transaction').doc(id).ref.get()
        .then(doc => {
          const project = {
            id: doc.id,
            ...doc.data()
          };
          resolve(project);
        });
    });
  }

  approveAndSetCommission(tid, rate, total, saleTotal) {
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

  approveAndSetLease(tid, yearsToLease, leaseTotal, commissionTotal, saleTotal, leaseMonth, leaseYearStart, leaseYearEnd) {
    return this.db.collection('transaction').doc(tid).update({
      yearsToLease: yearsToLease,
      leaseTotal: leaseTotal,
      commissionTotal: commissionTotal,
      saleTotal: saleTotal,
      leaseMonth: leaseMonth,
      leaseYearStart: leaseYearStart,
      leaseYearEnd: leaseYearEnd,
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

  async finalizeSale(tid) {
    var x = await this.getOneTransaction(tid);
    console.log(x);
    const files = [
      'doc_BIS',
      'doc_RF',
      'doc_RA',
      'doc_VG1',
      'doc_VG2',
      'doc_POI',
      'doc_POB',
      'doc_PSS']

    for (var i = 0; i < files.length; i++) {
      try {
        var m = x[files[i]]['file']['id'];
        console.log(m);
        this.fileservice.delete_in_storage(m);
      } catch (err) { }
    }
    for (var i = 0; i < x['doc_others'].length; i++) {
      try {
        var m = x['doc_others'][i]['id'];
        console.log(m);
        this.fileservice.delete_in_storage(m);
      } catch (err) { }
    }


    return this.db.collection('transaction').doc(tid).update({
      stage: 5,
      isCompleted: true,
      status: 'Completed , No Feedback Yet',
      doc_status: 'Deleted',
      dateCompleted: new Date(),
      doc_BIS: "",
      doc_RF: "",
      doc_RA: "",
      doc_VG1: "",
      doc_VG2: "",
      doc_POI: "",
      doc_POB: "",
      doc_PSS: "",
      doc_others:''
    });
  }

  finalizeLease(tid) {
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
