import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../shared/services';
import { Router, Params } from '@angular/router';

@Component({
  selector: 'app-broker',
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.scss']
})
export class BrokerComponent implements OnInit {

  items : Array<any>;

  constructor( public firebaseService : FirebaseService) { }

  ngOnInit() {
    this.getData();
  }

  getData(){
    this.firebaseService.getAllData('broker')
    .subscribe(result => {
      this.items = result;
    })
  }

}
