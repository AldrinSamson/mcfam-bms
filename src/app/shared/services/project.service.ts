import { AngularFirestore, validateEventsArray } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { Project } from '../models';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(public afAuth: AngularFireAuth,
    public db: AngularFirestore) { }
  
  getProjects(isArchived: Boolean) {
    return this.db.collection('project' , ref => ref.where('isArchived', '==', isArchived) 
    ).valueChanges({ idField: 'id' });
  }

  createProject(values) {
    
  }

  updateProject(id , values) {
    return this.db.collection('project').doc(id).update({
      name: values.name,
      overview: values.overview,
      saleType: values.saleType,
      propertyType: values.propertyType,
      ownerClientName: values.ownerClientName,
      addressStreet: values.addressStreet,
      addressTown: values.addressTown,
      addressCity: values.addressCity,
      addressRegion: values.addressRegion, 
      cost: values.cost,
      photoURL: values.photoURL,
      status: values.status,
      agentName: values.agentName, 
    });
  }

}
