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
  public stringify = JSON.stringify;
  public isArray = Array.isArray;
  private static TEXT_COLOR_LOOKUP = {
    "UEXIT": "var(--green-500)",
    "CEXIT": "var(--yellow-600)",
    "DEXIT": "var(--yellow-600)",
    "FEXIT": "var(--yellow-600)",
    "NEXIT": "var(--red-500)"
  };
  private static BG_COLOR_LOOKUP = {
    "UEXIT": "var(--green-100)",
    "CEXIT": "var(--yellow-100)",
    "DEXIT": "var(--yellow-100)",
    "FEXIT": "var(--yellow-100)",
    "NEXIT": "var(--red-100)"
  };
  private static BORDER_COLOR_LOOKUP = {
    "UEXIT": "var(--green-200)",
    "CEXIT": "var(--yellow-200)",
    "DEXIT": "var(--yellow-200)",
    "FEXIT": "var(--yellow-200)",
    "NEXIT": "var(--red-200)"
  };

  constructor() { }

  ngOnInit(): void {
  }

  getTextColor(exit) {
    if (this.dirLabel && this.dirLabel[0] == 'HERE') {
      return "var(--primary-900)";
    }
    if (exit) {
      return RoomExitComponent.TEXT_COLOR_LOOKUP[this.exit.TYPE];
    }
    return "inherit";
  }

  getBgColor(exit) {
    if (this.dirLabel && this.dirLabel[0] == 'HERE') {
      return "white";
    }
    if (exit) {
      return RoomExitComponent.BG_COLOR_LOOKUP[this.exit.TYPE];
    }
    return "inherit";
  }

  getBorderColor(exit) {
    if (this.dirLabel && this.dirLabel[0] == 'HERE') {
      return "var(--grey-700)";
    }
    if (exit) {
      return RoomExitComponent.BORDER_COLOR_LOOKUP[this.exit.TYPE];
    }
    return "rgba(255,255,255,0.0)";
  }

  getPrettyLabel() {
    return this.dirLabel[0] == "HERE" ? "here" : this.exit != null ? this.dirLabel.join(", ").toLowerCase() : "";
  }

}
