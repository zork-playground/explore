import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-linkable-zil-atom',
  templateUrl: './linkable-zil-atom.component.html',
  styleUrls: ['./linkable-zil-atom.component.css']
})
export class LinkableZilAtomComponent implements OnInit {

  @Input() public atomName: any;

  constructor() { }

  ngOnInit(): void {
    console.log("atomName=" + this.atomName);
  }

  public getLink() {
    // TODO: check atom type (using metadata) and do appropriate link
    return "routines/" + encodeURIComponent(this.atomName);
  }

}
