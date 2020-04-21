import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user.model';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MailerService {

  constructor(
    public http: HttpClient,
    public db: AngularFirestore
  ) { }

  sendEmail(email: any , subject: any , message: any ) {
    const url = 'https://us-central1-mcfam-systems.cloudfunctions.net/sendMail';
    const body: any = {
      'email' : email,
      'subject' : subject,
      'message' : message,
    };
    const output = <JSON>body;
    const httpOptions = {
      responseType: 'text' as 'json'
    };
    return this.http.post<any>(url , <JSON>output , httpOptions ).subscribe({
      error: error => console.error('There was an error!', error)
    });
  }

  genTransactionMessage(role: any, stage: any, project: String, otherValues?: Array<any>) {

    let subject: String;
    let message: String;
    const content = [];

    const header = '<img _ngcontent-arm-c2="" src="https://firebasestorage.googleapis.com/v0/b/mcfam-systems.appspot.com/o/broker%2FstoreFile1587285467947_image.png?alt=media&token=ebf3e94d-3df2-485c-a03e-dbdf7e63e06c">';
    const footer = '&copy; 2020 MCFam Reality. All rights Reserved.'
                  + '<br>' +
                  'Insert Address here'
                  + '<br>' +
                  'Sales Hotline: insert Number';

    switch (stage && role) {

      // broker initiate
      case 1 && 'manager':

        subject = 'Transaction for ' + project + ' was started';
        message = header +   'Agent ' + otherValues[0] + ' has started a transaction on project ' + project +
        ' for Client ' + otherValues[1]  + footer;

        content.push(subject);
        content.push(message);
        return content;

      case 1 && 'client':

        subject = 'Your Transaction for ' + project + 'has been started';
        message = header +   'Agent ' + otherValues[0] + ' has started your trasaction, kindly go to your transactions section '
        + 'in the our website and upload the required documents'  + footer;

        content.push(subject);
        content.push(message);
        return content;

      // manager has approved
      case 3 && 'client':

        subject = 'Approval of Manager for transaction on ' + project;
        message = header +
                '<p>The Manager has received and approved your uploaded documents. Please wait for Agent '
                + otherValues[0] + 'to contact you </p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      case 3 && 'agent':

        subject = 'Approval of Manager for transaction on ' + project;
        message = header +
                '<p>The manager has received and approved your client&#39;s documents. Please contact them as soon as possible.</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      // transaction has been finalized
      case 4 && 'client':

        subject = 'Transaction Status for ' + project;
        message = header +
                '<p>The transaction of the project is now complete. We have deleted your documents from our database. ' +
                'Please contact Agent ' + otherValues[0] + ' for more information.</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      // manager disapproved
      case 'disapproved' && 'client':

        subject = 'Document Status';
        message = header +
                '<p>Your transaction for ' + project + ' was disapproved by our manager. We have deleted your documents from our database. Please contact Agent ' +
                otherValues[0] + ' for more information. Thank you very much!</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      case 'disapproved' && 'agent':

        subject = 'Document Status';
        message = header +
                '<p>Your client&#39;s transaction for ' + project + ' was disapproved by the manager. Please contact the manager for more information.</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      // manager restored
      case 'restored' && 'client':

        subject = 'Transaction Status Restored';
        message = header +
                '<p>The manager has restored your transaction for ' + project + '. Please return to your transactions section of our website and upload the required documents. Thank you!</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      case 'restored' && 'agent':

        subject = 'Transaction Status Restored';
        message = header +
                '<p>The manager has restored the transaction for ' + project + ' of Client' + otherValues[0] + '.</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;
    }

  }

  mailTransactionMessage( destUid: string , role: string, stage: any, project: String, otherValues?: Array<any>) {

    let content = [];
    let email: any;
    let table = 'broker';
    let getEmail: Subscription;

    if ( role === 'client') {
      table = 'client';
    }

    if (otherValues == null) {
      content = this.genTransactionMessage(role, stage, project);
    } else {
      content = this.genTransactionMessage(role, stage, project, otherValues);
    }

    getEmail = this.db.collection(table, ref => ref.where('email', '==', destUid)).valueChanges().subscribe( (res: any) => {
      email = res[0].email;
      this.sendEmail(email , content[0] , content[1]);
      getEmail.unsubscribe();
    });
  }
}
