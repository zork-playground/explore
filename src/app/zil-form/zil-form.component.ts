import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-zil-form',
  templateUrl: './zil-form.component.html',
  styleUrls: ['./zil-form.component.css']
})
export class ZilFormComponent implements OnInit {

  @Input() public o: any;
  public stringify = JSON.stringify;
  public isArray = Array.isArray;

  constructor() { }

  ngOnInit(): void {
  }

}
