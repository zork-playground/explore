import { Component, OnInit, Input } from '@angular/core';
import { GameDataService } from '../game-data.service';


@Component({
  selector: 'app-zil-object',
  templateUrl: './zil-object.component.html',
  styleUrls: ['./zil-object.component.css']
})
export class ZilObjectComponent implements OnInit {

  @Input() public o: any;
  public objType: string;
  public stringify = JSON.stringify;
  public routerLink: any;

  constructor(private gameDataService: GameDataService) { }

  ngOnInit(): void {
    if (this.o.A != undefined) {
      this.objType = "Atom";
      let objMeta = this.gameDataService.getMetadata(this.o.A);
      if (objMeta) {
        console.log("AtomType for " + this.o.A + " is " + objMeta["type"]);
      } else {
        console.log("AtomType for " + this.o.A + " is unknown");
      }
    } else if (this.o.F != undefined) {
      this.objType = "Form";
    } else if (Array.isArray(this.o)) {
      this.objType = "Array";
    } else {
      this.objType = "Other";
    }
  }

  public normalizeWhitespace(s: string): string {
    let r = s;
    r = r.replace(/\s*\\r?\\n\s*/gi, " ");
    // r = r.replace(/\\n/gi, "\n");
    // r = r.replace(/\s+/gi, " ");
    return r;
  }

}
