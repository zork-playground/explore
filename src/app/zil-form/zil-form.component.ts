import { Component, OnInit, Input } from '@angular/core';
import { GameDataService } from '../game-data.service';


@Component({
  selector: 'app-zil-form',
  templateUrl: './zil-form.component.html',
  styleUrls: ['./zil-form.component.css']
})
export class ZilFormComponent implements OnInit {

  @Input() public o: any;
  public formType: string;
  public gvalName: string;
  public gvalType: string;
  public gvalColor: string;
  public gvalBgColor: string;
  public stringify = JSON.stringify;
  public isArray = Array.isArray;

  constructor(private gameDataService: GameDataService) { }

  ngOnInit(): void {
    this.formType = "Generic"; // default
    if (!this.o.F[0]) {
      this.formType = "Null";
    } else {
      let atom = this.o.F[0].A;
      if (atom == "LVAL") {
        this.formType = "LVAL";
      } else if (atom == "GVAL") {
        this.formType = "GVAL";
        this.gvalName = this.o.F[1].A;
        let objMetaType = this.gameDataService.getMetadata(this.gvalName)?.type;
        if (objMetaType == "OBJECT") {
          this.gvalType = "objects";
          this.gvalColor = "var(--primary-700)";
          this.gvalBgColor = "var(--primary-200)";
        } else if (objMetaType == "ROOM") {
          this.gvalType = "rooms";
          this.gvalColor = "var(--primary-700)";
          this.gvalBgColor = "var(--primary-200)";
        } else {
          this.gvalType = null;
          this.gvalColor = "inherit";
          this.gvalBgColor = "inherit";
        }
      } else if (atom == "COND") {
        this.formType = "COND";
      } else {
        this.formType = "Generic";
      }
    }
    console.log("form type for " + this.o.Name + " is " + this.formType);
  }

}
