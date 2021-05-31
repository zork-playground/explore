import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-zil-atom-mini-card',
  templateUrl: './zil-atom-mini-card.component.html',
  styleUrls: ['./zil-atom-mini-card.component.css']
})
export class ZilAtomMiniCardComponent implements OnInit {

  @Input() public gameId: string;
  @Input() public atomName: string;
  @Input() public gameData: any;
  public atomType: string;
  public desc: string;
  public typeColor: string;
  public typeBackgroundColor: string;

  constructor() { }

  ngOnInit(): void {
    let meta = this.gameData.metadata[this.atomName];
    this.atomType = meta["type"] || "Other";
    this.desc = meta["desc"] || "Other";
    if (this.atomType == "ROUTINE") {
      this.typeColor           = 'var(--red-700)';
      this.typeBackgroundColor = 'var(--red-300)';
    } else if (this.atomType == "OBJECT") {
      this.typeColor           = 'var(--primary-900)';
      this.typeBackgroundColor = 'var(--primary-300)';
    } else if (this.atomType == "ROOM") {
      this.typeColor           = 'var(--primary-900)';
      this.typeBackgroundColor = 'var(--primary-300)';
    } else {
      this.typeColor           = 'var(--yellow-900)';
      this.typeBackgroundColor = 'var(--yellow-300)';
    }
  }

  public getPathForType(atomType) {
    if (atomType == 'OBJECT') {
      return "objects";
    }
    if (atomType == 'ROOM') {
      return "rooms";
    }
    if (atomType == 'ROUTINE') {
      return "routines";
    }
    // TODO: are there any atom types that we need to support better?
    return "search"; 
  }

}
