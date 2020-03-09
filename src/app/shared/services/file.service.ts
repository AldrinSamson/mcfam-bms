import { Injectable } from '@angular/core';
import { FileModel } from '../models/file.model';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
@Injectable({
  providedIn: 'root'
})
export class FileService {
  private fileCollection: AngularFirestoreCollection<FileModel>;
  constructor(public afAuth: AngularFireAuth, public router: Router, private firestore: AngularFirestore,
    afs: AngularFirestore) {
    this.fileCollection = afs.collection<FileModel>('filesStored');
    this.afAuth.authState.subscribe(user => {
      if (user) {
        
        //localStorage.setItem('user', JSON.stringify(this.user));
      } else {
        //localStorage.setItem('user', null);
      }
    });
  }
  async createFile(fl: any) {
    //return this.accountCollection.add(acc);
    

    console.log(fl);
    const f: FileModel = { 
      id: fl.id, 
      //id: id,
      fileProperties: fl.fileProperties, 
      uidUploaded: fl.uidUploaded, 
      section: 'BMS', 
      fileName: fl.fileName,
      category: fl.category,
      photoURL: fl.photoURL,
      path: fl.path
    };
    console.log(fl.id + ' = fggjhh');
    console.log(f);
    this.fileCollection.doc(fl.id).set(f);
    //return id;
  }
}
