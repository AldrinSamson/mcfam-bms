import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(public db: AngularFirestore) {}

  getOne(id , tableName) {
    return this.db.collection(tableName).doc(id).snapshotChanges();
  }

  updateOne(id, value , tableName) {
    return this.db.collection(tableName).doc(id).set(value);
  }

  deleteOne(id , tableName) {
    return this.db.collection(tableName).doc(id).delete();
  }

  getAllData(tableName) {
    return this.db.collection(tableName).snapshotChanges();
  }

  // search(searchValue){
  //   return this.db.collection('users', ref => ref.where('nameToSearch', '>=', searchValue)
  //     .where('nameToSearch', '<=', searchValue + '\uf8ff'))
  //     .snapshotChanges();
  // }
}
