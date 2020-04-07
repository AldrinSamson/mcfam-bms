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
    let output = <JSON>body;
    let httpOptions = {
      responseType: 'text' as 'json'
    };
    return this.http.post<any>(url , <JSON>output , httpOptions ).subscribe({
      error: error => console.error('There was an error!', error)
    }).unsubscribe();
  }

  genTransactionMessage(role: any, stage: any, project: String, otherValues?: Array<any>){

    let subject: String;
    let message: String;
    let content = [];

    let header = '<img _ngcontent-arm-c2="" src="/assets/img/temp-icon.jpg">';
    let footer = '&copy; 2020 MCFam Reality. All rights Reserved.'
                  + '<br>' +
                  'Insert Address here'
                  + '<br>' +
                  'Sales Hotline: insert Number'
    ;

    switch (stage && role) {

      //broker initiate
      case 1 && 'manager':

        subject = 'Assigned Agent';
        message = header + otherValues[0] + ' pepe go ' + otherValues[1] + footer;

        content.push(subject);
        content.push(message);
        return content;

      //client has uploaded
      case 2 && 'manager':

        subject = 'Client Documents';
        message = header + '<h3>Good day  ' + name + '!</h3>'
                + '<br>' +
                '<p> ' + otherValues[0] +  ', has already uploaded the required documents. </p>'
                + footer;
        // 0= client's name
        content.push(subject);
        content.push(message);
        return content;

      //manager has approved
      case 3 && 'client':

        subject = 'Approval of Manager';
        message = header + '<h3>Good day  ' + name + '!</h3>'
                + '<br>' +
                '<p>The manager has received and approved your uploaded documents.</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      case 3 && 'agent':

        subject = 'Approval of Manager';
        message = header + '<h3>Good day  ' + name + '!</h3>'
                + '<br>' +
                '<p>The manager has received and approved your request.</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      // transaction has been finalized
      case 4 && 'client':

        subject = 'Transaction Status';
        message = header + '<h3>Good day  ' + name + '!</h3>'
                + '<br>' +
                '<p>The transaction of the project is now complete. Please contact the agent for further informations.</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      // client has feedback
      case 5 && 'agent':

        subject = 'Project Client Upload';
        message = header + '<h3>Good day  ' + name + '!</h3>'
                + '<br>' +
                '<p>A client has sent a feedback on you. </p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      //client has cancelled
      case 'cancelled' && 'agent':

        subject = 'Project Client Upload';
        message = header + '<h3>Good day  ' + name + '!</h3>'
                + '<br>' +
                '<p>' + otherValues[0] + 'has cancelled their request. </p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;
      //0= client's name

      //manager disapproved
      case 'disapproved' && 'client':

        subject = 'Document Status';
        message = header + '<h3>Good day  ' + name + '!</h3>'
                + '<br>' +
                '<p>Your request is disapproved by the manager. Please contact the manager for more information. Thank you very much!</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      case 'disapproved' && 'agent':

        subject = 'Document Status';
        message = header + '<h3>Good day  ' + name + '!</h3>'
                + '<br>' +
                '<p>Your request is disapproved by the manager. Please contact the agent or manager for more information. Thank you very much!</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      //manager restored 
      case 'restored' && 'client':

        subject = 'Project Status';
        message = header + '<h3>Good day  ' + name + '!</h3>'
                + '<br>' +
                '<p>The manager has restored the status of the project that you requested. For more information contact the agent or manager. Thank you!</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;

      case 'restored' && 'agent':

        subject = 'Project Status';
        message = header + '<h3>Good day  ' + name + '!</h3>'
                + '<br>' +
                '<p>The manager has restored the status of the project that you requested. For more information contact the manager. Thank you!</p>'
                + footer;

        content.push(subject);
        content.push(message);
        return content;
    }

  }

  mailTransactionMessage( uid: string , role: string, stage: number, project: String, otherValues?: Array<any>){

    let content = [];
    let email: any;
    let table = 'broker';
    let getEmail: Subscription

    if ( role == 'client') {
      table = 'client';
    }

    if (otherValues == null) {
      content = this.genTransactionMessage(role, stage, project);
    } else {
      content = this.genTransactionMessage(role, stage, project, otherValues);
    }

    getEmail = this.db.collection(table, ref => ref.where('uid', '==', uid)).valueChanges().subscribe( (res: any) => {
      email = res[0].email;
      this.sendEmail(email , content[0] , content[1]);
      getEmail.unsubscribe();
    });
  }
}
