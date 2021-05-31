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
    this.atomType = meta["type"];
    if (this.atomType == "ROUTINE") {
      this.typeColor           = 'var(--red-700)';
      this.typeBackgroundColor = 'var(--red-300)';
      if (meta.isActionForObjects.length > 0) {
        this.desc = "Action for " + meta.isActionForObjects.join(", ");
      } else if (meta.isActionForRooms.length > 0) {
        this.desc = "Action for " + meta.isActionForRooms.join(", ") + " (Room)";
      } else if (meta.isPreactionForSyntaxes.length > 0) {
        this.desc = "Pre-Action for (Syntax)";
      } else if (meta.isActionForSyntaxes.length > 0) {
        this.desc = "Action for (Syntax)";
      } else {
        this.desc = "Routine";
      }
    } else if (this.atomType == "OBJECT") {
      console.log("MINICARD OBJECT, gameData:", this.gameData);
      this.typeColor           = 'var(--primary-900)';
      this.typeBackgroundColor = 'var(--primary-300)';
      let obj = this.getObject(this.atomName);
      this.desc = obj.Properties["DESC"];
    } else if (this.atomType == "ROOM") {
      this.typeColor           = 'var(--primary-900)';
      this.typeBackgroundColor = 'var(--primary-300)';
      let obj = this.getObject(this.atomName);
      this.desc = obj.Properties["DESC"];
    } else {
      this.typeColor           = 'var(--yellow-900)';
      this.typeBackgroundColor = 'var(--yellow-300)';
      this.desc = "";
    }
  }

  private getObject(atomName) {
    for (let o of this.gameData.Objects) {
      if (o.Name == atomName) {
        return o;
      }
    }
    return null;
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
