import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-zil-object',
  templateUrl: './zil-object.component.html',
  styleUrls: ['./zil-object.component.css']
})
export class ZilObjectComponent implements OnInit {

  @Input() public o: any;
  public stringify = JSON.stringify;
  public isArray = Array.isArray;

  constructor() { }

  ngOnInit(): void {
  }

  public normalizeWhitespace(s: string): string {
    let r = s;
    r = r.replace(/\\r/gi, "\r");
    r = r.replace(/\\n/gi, "\n");
    r = r.replace(/\s+/gi, " ");
    return r;
  }

}
