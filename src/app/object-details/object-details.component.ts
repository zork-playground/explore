import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { ActivatedRoute, Params } from '@angular/router';
import { GameDataReceiver } from '../game-data-receiver';

@Component({
  selector: 'app-object-details',
  templateUrl: './object-details.component.html',
  styleUrls: ['./object-details.component.css']
})
export class ObjectDetailsComponent implements OnInit, GameDataReceiver {

  public stringify = JSON.stringify;
  public isInitialized: boolean = false;
  public gameId: string;
  public id: string = null;
  public gameData: any;
  public o: any = null;
  public contains: any[] = [];
  public parentObject: any = null;
  public parentRoomName: any = null;
  public knownProperties: string[] = [
    "#IN",
    "FDESC",
    "LDESC",
    "DESC",
    "TEXT",
    "ADJECTIVE",
    "SYNONYM",
    "FLAGS",
    "ACTION"
  ];

  constructor(
    private route: ActivatedRoute,
    private gameDataService: GameDataService
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.onRoute(params);
    });
  }

  public onRoute(params: Params) {
    console.log("Routed to ObjectDetails, params:", params);
    this.isInitialized = false;
    this.gameId = params["gameId"];
    this.id = params["id"];
    this.gameData = null;
    this.o = null;
    this.contains = [];
    this.parentObject = null;
    this.parentRoomName = null;
    this.gameDataService.getAllGameData(this.gameId, this);
  }

  public receiveGameData(gameData: any) {
    this.gameData = gameData;
    let allObjects = gameData.Objects.filter(o => !o.IsRoom);
    console.log("allObjects:", allObjects);
    for (let obj of allObjects) {
      if (obj.Name == this.id) {
        this.o = obj;
      } else {
        if (obj.Properties["#IN"] == this.id) {
          this.contains.push(obj);
        }
      }
    }
    for (let obj of allObjects) {
      if (this.o.Properties["#IN"] == obj.Name) {
        this.parentObject = obj;
      }
    }
    if (!this.o) {
      console.log("Error: object not found.");
    } else if (!this.parentObject) {
      console.log("parentObject not found, probably a room.");
    }
    console.log("this.o:", this.o);
    this.isInitialized = true;
  }

  public getContainsLabel() {
    if (this.hasFlag(this.o, "SURFACEBIT")) {
      return "Sitting on the " + this.o.Properties["DESC"] + " is:";
    }
    if (this.hasFlag(this.o, "ACTORBIT")) {
      return "The " + this.o.Properties["DESC"] + " is holding:";
    }
    return "The " + this.o.Properties["DESC"] + " contains:";
  }

  public getContainerLabel() {
    if (!this.parentObject) {
      // not in an object, but probably in a room
      return "Located in";
    }
    if (this.hasFlag(this.parentObject, "SURFACEBIT")) {
      return "Sitting on";
    }
    if (this.hasFlag(this.parentObject, "ACTORBIT")) {
      return "Held by";
    }
    return "Contained in";
  }

  public hasFlag(obj: any, flag: string) {
    if (!obj.Properties) {
      return false;
    }
    if (!obj.Properties["FLAGS"]) {
      return false;
    }
    for (let objFlag of obj.Properties["FLAGS"]) {
      if (objFlag == flag) {
        return true;
      }
    }
    return false;
  }

  public isKnownProperty(name: string): boolean {
    return this.knownProperties.includes(name);
  }

}
