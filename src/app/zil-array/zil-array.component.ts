import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-zil-array',
  templateUrl: './zil-array.component.html',
  styleUrls: ['./zil-array.component.css']
})
export class ZilArrayComponent implements OnInit {

  @Input() public o: any;
  @Input() public indented: boolean = false;
  public stringify = JSON.stringify;
  public isArray = Array.isArray;

  constructor() { }

  ngOnInit(): void {
  }

}
