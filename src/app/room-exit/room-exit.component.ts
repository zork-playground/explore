import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-room-exit',
  templateUrl: './room-exit.component.html',
  styleUrls: ['./room-exit.component.css']
})
export class RoomExitComponent implements OnInit {

  @Input() public gameId: string; // room object, e.g. {"Name":"...","Properties":{...}}
  @Input() public room: any; // room object, e.g. {"Name":"...","Properties":{...}}
  @Input() public dir: string; // direction property name, e.g. "NORTH"
  public dirLabel: string;
  public textColor: string;
  public bgColor: string;
  public borderColor: string;
  public stringify = JSON.stringify;
  public isArray = Array.isArray;
  public exit: any = null;

  constructor() { }

  ngOnInit(): void {
    if (this.room != null && this.room.Exits != null) {
      this.exit = this.room.Exits[this.dir];
      console.log("for " + this.dir + ", this.exit:", this.exit);
    }
    let dirLabelLookup = {
      "NORTH": "n",
      "SOUTH": "s",
      "EAST": "e",
      "WEST": "w"
    };
    this.dirLabel = dirLabelLookup[this.dir] || this.dir.toLowerCase();
    let bgColorLookup = {
      "UEXIT": "var(--green-100)",
      "CEXIT": "var(--yellow-100)",
      "DEXIT": "var(--yellow-100)",
      "FEXIT": "var(--yellow-100)",
      "NEXIT": "var(--red-100)"
    };
    let borderColorLookup = {
      "UEXIT": "var(--green-200)",   // "rgba(255,255,255,0)"
      "CEXIT": "var(--yellow-200)",  // "rgba(255,255,255,0)"
      "DEXIT": "var(--yellow-200)",  // "rgba(255,255,255,0)"
      "FEXIT": "var(--yellow-200)",  // "rgba(255,255,255,0)"
      "NEXIT": "var(--red-200)"      // "rgba(255,255,255,0)"
    };
    let textColorLookup = {
      "UEXIT": "var(--green-500)",
      "CEXIT": "var(--yellow-600)",
      "DEXIT": "var(--yellow-600)",
      "FEXIT": "var(--yellow-600)",
      "NEXIT": "var(--red-500)"
    };
    if (this.dir == 'HERE') {
      this.bgColor = "white";
      this.borderColor = "var(--grey-700)";
      this.textColor = "var(--primary-900)";
    } else if (this.exit) {
      this.bgColor = bgColorLookup[this.exit.TYPE];
      this.borderColor = borderColorLookup[this.exit.TYPE];
      this.textColor = textColorLookup[this.exit.TYPE];
    } else {
      this.bgColor = "inherit";
      this.borderColor = "rgba(255,255,255,0.0)";
      this.textColor = "inherit";
    }
    console.log("textColor=" + this.textColor + ", bgColor=" + this.bgColor + ", borderColor=" + this.borderColor);
  }

}
