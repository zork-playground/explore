import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GameDataReceiver } from '../game-data-receiver';

@Component({
  selector: 'app-room-details',
  templateUrl: './room-details.component.html',
  styleUrls: ['./room-details.component.css']
})
export class RoomDetailsComponent implements OnInit, GameDataReceiver {

  public gameId: string;
  public stringify = JSON.stringify;
  public id: string = null;
  public o: any = null;
  public contains: any[] = [];
  public localGlobals: any[] = [];
  public parentObject: any = null;
  public isInitialized: boolean = false;
  public knownProperties: string[] = [
    "#IN", // always "ROOMS"
    "FDESC",
    "LDESC",
    "DESC",
    "GLOBAL",
    //"TEXT",
    //"ADJECTIVE",
    //"SYNONYM",
    "FLAGS",
    "ACTION",
    // TODO: Get list of directions from data instead of hard-coded here
    'NORTH', 'SOUTH', 'EAST', 'WEST', 'NW', 'NE', 'SW', 'SE',
    'UP', 'DOWN',
    'IN', 'OUT',
    'LAUNCH', 'LAND'
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gameDataService: GameDataService
  ) {
    this.gameId = this.route.snapshot.params["gameId"];
    this.id = route.snapshot.params["id"];
    console.log("this.selectedId:", this.id);
  }

  ngOnInit(): void {
    let selectedGameId = this.gameDataService.getSelectedGameId(this.gameId);
    if (selectedGameId != this.gameId) {
      this.gameDataService.setSelectedGameId(this.gameId, this); // initialize later
    } else {
      this.initialize(); // initialize now
    }
  }

  public receiveGameData(gameData: any) {
    console.log("Finished re-fetching game data for newly selected game.");
    this.initialize();
  }

  public initialize() {
    this.gameDataService.getAllRooms().subscribe((allRooms) => {
      console.log("allRooms:", allRooms);
      for (let obj of allRooms) {
        if (obj.Name == this.id) {
          this.o = obj;
        }
      }
      if (!this.o) {
        console.log("Error: object not found.");
      }
      console.log("Room = this.o:", this.o);
      let localGlobalNames = [];
      if (this.o.Properties['GLOBAL']) {
        for (let g of this.o.Properties['GLOBAL']) {
          localGlobalNames.push(g.Atom);
        }
      }
      console.log("localGlobalNames:", localGlobalNames);
      // Now look at all objects in the game...
      this.gameDataService.getAllObjects().subscribe((allObjects) => {
        console.log("allObjects:", allObjects);
        for (let obj of allObjects) {
            if (obj.Properties["#IN"] == this.id) {
              this.contains.push(obj);
            }
        }
        for (let obj of allObjects) {
          if (this.o.Properties["#IN"] == obj.Name) {
            this.parentObject = obj;
          }
          if (localGlobalNames.includes(obj.Name)) {
            this.localGlobals.push(obj);
          }
        }
        console.log("localGlobals:", this.localGlobals);
        this.isInitialized = true;
      });
  
      this.isInitialized = true;
    });
  }

  public getFriendlyExitType(t: string) {
    if (t == 'UEXIT') return "Normal";
    if (t == 'NEXIT') return "Non-Exit";
    if (t == 'DEXIT') return "Door Exit";
    if (t == 'CEXIT') return "Conditional";
    if (t == 'FEXIT') return "Function";
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
