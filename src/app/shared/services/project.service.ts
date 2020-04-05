import { AngularFirestore, validateEventsArray } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { Project } from '../models';
import { AlertService } from './alert.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(public afAuth: AngularFireAuth,
    public db: AngularFirestore) { }

  getProjects(isArchived: Boolean) {
    return this.db.collection('project', ref => ref.where('isArchived', '==', isArchived)
    ).valueChanges({ idField: 'id' });
  }

  createProject(values) {

  }

  getProject(id) {
    return this.db.collection('project').doc(id).snapshotChanges()
  }

  // //   //return this.db.collection('project').doc(id).valueChanges();
  // // }

  // getProject(id: string) {
  //   return this.db.collection('projects').where("capital", "==", true)
  //   .get()
  //   .then(function(querySnapshot) {
  //       querySnapshot.forEach(function(doc) {
  //           // doc.data() is never undefined for query doc snapshots
  //           console.log(doc.id, " => ", doc.data());
  //       });
  //   })
  //   .catch(function(error) {
  //       console.log("Error getting documents: ", error);
  //   });
  // }

  // db.collection("cities").where("capital", "==", true)
  //   .get()
  //   .then(function(querySnapshot) {
  //       querySnapshot.forEach(function(doc) {
  //           // doc.data() is never undefined for query doc snapshots
  //           console.log(doc.id, " => ", doc.data());
  //       });
  //   })
  //   .catch(function(error) {
  //       console.log("Error getting documents: ", error);
  //   });

  updateProject(id, values) {
    return this.db.collection('project').doc(id).update({
      name: values.name,
      overview: values.overview,
      saleType: values.saleType,
      propertyType: values.propertyType,
      ownerClientName: values.ownerClientName,
      //addressStreet: values.addressStreet,
      addressTown: values.addressTown,
      //addressCity: values.addressCity,
      addressRegion: values.addressRegion,
      cost: values.cost,
      photoURL: values.photoURL,
      status: values.status,
      agentName: values.agentName,
      cover_photo: values.cover_photo
    });
  }

}
