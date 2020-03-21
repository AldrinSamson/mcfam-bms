import { Injectable } from '@angular/core';
import { FileModel } from '../models/file.model';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase';
@Injectable({
  providedIn: 'root'
})
export class FileService {
  private fileCollection: AngularFirestoreCollection<FileModel>;
  files: any;
  joined$: Observable<any>;
  constructor(public afAuth: AngularFireAuth, public router: Router, public firestore: AngularFirestore,
    public afs: AngularFirestore) {
    this.fileCollection = afs.collection<FileModel>('filesStored');
    this.files = this.fileCollection.snapshotChanges().subscribe(data => {
      this.files = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        } as any;
      })
    });
  }
  getFiles() {
    return this.files;
  }
  getFilesMultiple() {

  }

  async createFile(fl: any) {
    //return this.accountCollection.add(acc);
    var thisclass = this;
    return new Promise(function (resolve, reject) {
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
      thisclass.fileCollection.doc(fl.id).set(f);
      resolve(f);
    })
  }
  filedelete(id) {
    console.log(id);
    let deleteDoc = this.afs.collection('filesStored').doc(id).delete();
    console.log(deleteDoc)
  }
  delete_in_storage(path) {
    // Create a reference to the file to delete
    var storageRef = firebase.storage().ref(path);
    var desertRef = storageRef.child(path);

    // Delete the file
    desertRef.delete().then(function () {
      // File deleted successfully
    }).catch(function (error) {
      // Uh-oh, an error occurred!
    });
  }
  async upload_in_storage(path, file, uid, category) {

    var file1 = {
      name: file.name,
      lastModified: file.lastModified,
      lastModifiedDate: file.lastModifiedDate,
      webkitRelativePath: file.webkitRelativePath,
      size: file.size,
      type: file.type
    };
    var thisclass=this;

    return new Promise(function (resolve, reject) {
      console.log(file);
      
      var storageRef = firebase.storage().ref(path);
      
      var task = storageRef.put(file);
      task.then(function (snapshot) {
        snapshot.ref.getDownloadURL().then(async function (url) {
          const id = await thisclass.firestore.createId();
          var fileprop = {
            id: id,
            fileProperties: file1,
            uidUploaded: uid,
            section: 'BMS',
            fileName: `storeFile${new Date().getTime()}_${file.name}`,
            category: category,
            photoURL: url,
            path: path
          };
          await thisclass.createFile(fileprop);
          resolve(fileprop);
        })
      })

    })
  }

}
