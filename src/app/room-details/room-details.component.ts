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
  public gameData: any;
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
  public mapGrid; // 5 rows of 3 columns
  private preferredPlacements;

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
    this.gameDataService.getAllGameData(this.gameId, this);
  }

  public receiveGameData(gameData: any) {
    this.gameData = gameData;
    let allRooms = gameData.Objects.filter(o => o.IsRoom);
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
    let allObjects = gameData.Objects.filter(o => !o.IsRoom);
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
      this.placeExitsOnMap();
  
      this.isInitialized = true;
  }

  // let exitDirOrder = [
  //   "NORTH", "SOUTH", "WEST", "EAST", "NW", "NE", "SW", "SE",
  //   "UP", "DOWN", "IN", "OUT", "LAUNCH", "LAND"
  //   // "CROSS", etc. to be done later
  // ];
  private placeExitsOnMap() {
    let normalizedExits = [];
    var directionRank = {
      "NORTH":1,
      "SOUTH":2,
      "EAST":3,
      "WEST":4,
      "NW":11,
      "NE":12,
      "SW":13,
      "SE":14,
      "UP":21,
      "DOWN":22,
      "IN":31,
      "OUT":32,
      "LAUNCH":41,
      "LAND":42
    };
    // First, find and combine duplicate exits
    let dirs = Object.keys(this.o.Exits).sort((k1,k2) => {return directionRank[k1]-directionRank[k2];})
    for (let i=0; i<dirs.length; i++) {
      let dir1 = dirs[i];
      let exit1 = this.o.Exits[dir1];
      if (!exit1) {
        continue;
      }
      let allDirs = [dir1];
      for (let j=i+1; j<dirs.length; j++) {
        let dir2 = dirs[j];
        let exit2 = this.o.Exits[dir2];
        if (JSON.stringify(exit1) == JSON.stringify(exit2)) {
          allDirs.push(dir2);
          exit2["isDuplicate"] = true;
          delete this.o.Exits[dir2];
        }
      }
      exit1["allDirs"] = allDirs;
    }
    console.log("After de-dupe:", this.o.Exits);

    /////////////////////////

    let COORD_NAMES = [
      [ "NW2",  "NORTH2", "NE2"  ],
      [ "NW",   "NORTH",  "NE"   ],
      [ "WEST", "HERE",   "EAST" ],
      [ "SW",   "SOUTH",  "SE"   ],
      [ "SW2",  "SOUTH2", "SE2"  ]
    ];
    let C: any = {};
    for (let i=0; i<5; i++) {
      for (let j=0; j<3; j++) {
        let coordName = COORD_NAMES[i][j];
        C[coordName] = {"y": i, "x": j};
      }
    }
    console.log("C:", C);
    this.mapGrid = [
      [null, null, null], // [0][0], [0][1], [0][2]
      [null, null, null], // [1][0], [1][1], [1][2]
      [null, null, null], // [2][0], [2][1], [2][2]
      [null, null, null], // [3][0], [3][1], [3][2]
      [null, null, null]  // [4][0], [4][1], [4][2]
    ];
    this.putInFirstAvailable("NORTH", [C.NORTH]);
    this.putInFirstAvailable("SOUTH", [C.SOUTH]);
    this.putInFirstAvailable("EAST", [C.EAST]);
    this.putInFirstAvailable("WEST", [C.WEST]);
    this.putInFirstAvailable("NW", [C.NW]);
    this.putInFirstAvailable("NE", [C.NE]);
    this.putInFirstAvailable("SW", [C.SW]);
    this.putInFirstAvailable("SE", [C.SE]);
    this.putInFirstAvailable("UP", [C.NE, C.NW, C.NORTH, C.NORTH2]);
    this.putInFirstAvailable("DOWN", [C.SW, C.SE, C.SOUTH, C.SOUTH2]);
    this.putInFirstAvailable("IN", [C.NE, C.NW, C.SE, C.SW, C.EAST, C.NORTH, C.WEST, C.SOUTH, C.NE2]);
    this.putInFirstAvailable("OUT", [C.SW, C.SE, C.NW, C.NE, C.WEST, C.SOUTH, C.NORTH, C.EAST, C.SW2]);
    this.putInFirstAvailable("LAUNCH", [C.NE, C.NW, C.SE, C.SW, C.EAST, C.NORTH, C.WEST, C.SOUTH, C.NE2, C.NW2]);
    this.putInFirstAvailable("LAND", [C.SW, C.SE, C.NW, C.NE, C.WEST, C.SOUTH, C.NORTH, C.EAST, C.SW2, C.SE2]);
    this.putInFirstAvailable("CROSS", [C.SW, C.SE, C.NW, C.NE, C.WEST, C.SOUTH, C.NORTH, C.EAST, C.SW2, C.SE2]);
    this.mapGrid[2][1] = {'TO':this.o.Name, "allDirs": ['HERE'] };
    console.log("MAP GRID:", this.mapGrid);
  }

  private putInFirstAvailable(exitDir, coords) {
    if (this.o.Exits[exitDir]) {
      for (let c of coords) {
        if (!this.mapGrid[c.y][c.x]) {
          this.mapGrid[c.y][c.x] = this.o.Exits[exitDir];
          return;
        }
      }
      throw new Error("Internal error: not able to place exit!");
    }
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
