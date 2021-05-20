import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-room-exit',
  templateUrl: './room-exit.component.html',
  styleUrls: ['./room-exit.component.css']
})
export class RoomExitComponent implements OnInit {

  @Input() public gameId: string;
  @Input() public exit: any;
  @Input() public dirLabel: string[];
  public textColor: string;
  public bgColor: string;
  public borderColor: string;
  public stringify = JSON.stringify;
  public isArray = Array.isArray;

  constructor() { }

  ngOnInit(): void {
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
    if (this.dirLabel && this.dirLabel[0] == 'HERE') {
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

  getPrettyLabel() {
    return this.dirLabel[0] == "HERE" ? "here" : this.exit != null ? this.dirLabel.join(", ").toLowerCase() : "";
  }

}
