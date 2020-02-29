import { AngularFirestore } from '@angular/fire/firestore';
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

  createProject(values) {
    return this.db.collection('broker').add({
                    
                  });
  }

}
