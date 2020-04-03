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
    const body : any = {
      'email' : email,
      'subject' : subject,
      'message' : message,
    }
    let output = <JSON>body;
    let httpOptions = {
      responseType: 'text' as 'json'
    }
    return this.http.post<any>(url , <JSON>output , httpOptions ).subscribe({
      error: error => console.error('There was an error!', error)
    }).unsubscribe();
  }

  genTransactionMessage(role: any, stage: any, project:String, otherValues?: Array<any>){

    let subject : String
    let message : String
    let content = []

    let header = '';
    let footer = '';

    switch (stage && role){

      //broker initiate
      case 1 && 'manager':

        subject = 'hiyyaa'
        message = header + otherValues[0] +' pepe go '+ otherValues[1] + footer

        content.push(subject);
        content.push(message);
        return content

      //client has uploaded
      case 2 && 'manager':

        subject = ''
        message = header + '' + footer

        content.push(subject);
        content.push(message);
        return content

      //manager has approved
      case 3 && 'client': 

        subject = ''
        message = header + '' + footer

        content.push(subject);
        content.push(message);
        return content 

      case 3 && 'agent': 

        subject = ''
        message = header + '' + footer

        content.push(subject);
        content.push(message);
        return content 
      
      // transaction has been finalized
      case 4 && 'client':

        subject = ''
        message = header + '' + footer

        content.push(subject);
        content.push(message);
        return content

      // client has feedback
      case 5 && 'agent':
       
        subject = ''
        message = header + '' + footer

        content.push(subject);
        content.push(message);
        return content

      //client has cancelled
      case 'cancelled' && 'agent':

        subject = ''
        message = header + '' + footer

        content.push(subject);
        content.push(message);
        return content

      //manager disapproved
      case 'disapproved' && 'client':

        subject = ''
        message = header + '' + footer

        content.push(subject);
        content.push(message);
        return content

      case 'disapproved' && 'agent':

        subject = ''
        message = header + '' + footer

        content.push(subject);
        content.push(message);
        return content

      //manager restored 
      case 'restored' && 'client':

        subject = ''
        message = header + '' + footer

        content.push(subject);
        content.push(message);
        return content

      case 'restored' && 'agent':

        subject = ''
        message = header + '' + footer

        content.push(subject);
        content.push(message);
        return content
    }

  }

  mailTransactionMessage( uid: string , role: string, stage: number, project: String, otherValues?: Array<any>){

    let content = []
    let email : any;
    let table = 'broker'
    let getEmail: Subscription

    if( role == 'client'){
      table = 'client'
    }

    if(otherValues == null) {
      content = this.genTransactionMessage(role, stage, project)
    }else {
      content = this.genTransactionMessage(role, stage, project, otherValues)
    }

    getEmail = this.db.collection(table, ref => ref.where('uid', '==', uid)).valueChanges().subscribe( (res: any) => {
      email = res[0].email
      this.sendEmail(email , content[0] , content[1])
      getEmail.unsubscribe();
    })
  }
}
