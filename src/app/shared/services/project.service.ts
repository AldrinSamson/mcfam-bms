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
      ownerClientUid: values.ownerClientUid,
      ownerClientName: values.ownerClientName,
      addressStreet: values.addressStreet,
      addressTown: values.addressTown,
      addressCity: values.addressCity,
      addressRegion: values.addressRegion,
      addressLatitude: values.addressLatitude,
      addressLongtitude: values.addressLongtitude,
      amenities: values.amenities,
      cost: values.cost,
      status: values.status,
      agentUid: values.agentUid,
      agentName: values.agentName,
      photoURL: values.photoURL,
      cover_photo: values.cover_photo,
      card_photo: values.card_photo,
      isFeatured: values.isFeatured
    });
  }

}
