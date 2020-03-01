import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(public db: AngularFirestore , public alertService: AlertService) {}

  getOne(id , tableName) {
    return this.db.collection(tableName).doc(id).snapshotChanges();
  }

  //DONUT USE unless you're submitting the full form data
  updateOne(id, value , tableName) {
    return this.db.collection(tableName).doc(id).set(value)
    .then((res) => {
      this.alertService.showToaster('Update Success');
    })
    .catch((_error) => {
      console.log(''+tableName+' Update Failed!', _error);
    });
  }

  addOne(value , tableName){
    return this.db.collection(tableName).add(value)
    .then((res) => {
      this.alertService.showToaster('Create Success');
    })
    .catch((_error) => {
      console.log(''+tableName+' Create Failed!', _error);
    });
  }

  deleteOne(id , tableName) {
    return this.db.collection(tableName).doc(id).delete()
    .then((res) => {
      this.alertService.showToaster('Delete Success');
    })
    .catch((_error) => {
      console.log(''+tableName+' Delete Failed!', _error);
    });
  }

  archiveOne(id, value , tableName) {
    return this.db.collection(tableName).doc(id).set({isArchived:true})
    .then((res) => {
      this.alertService.showToaster('Archive Success');
    })
    .catch((_error) => {
      console.log(''+tableName+' Archive Failed!', _error);
    });
  }

  restoreOne(id, value , tableName) {
    return this.db.collection(tableName).doc(id).set({isArchived:false})
    .then((res) => {
      this.alertService.showToaster('Restore Success');
    })
    .catch((_error) => {
      console.log(''+tableName+' Restore Failed!', _error);
    });
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
