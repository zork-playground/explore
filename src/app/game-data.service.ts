import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { GameDataReceiver } from './game-data-receiver';
import { GameChangeListener } from './game-change-listener';

@Injectable({
  providedIn: 'root'
})
export class GameDataService {

  private defaultSelectedGameId: string = "zork-1";
  private cachedSelectedGameId: string = null;
  private indexCached: any = null;
  private allObjectsCached: any[] = null;
  private allRoomsCached: any[] = null;
  private allRoutinesCached: any[] = null;
  private allSyntaxesCached: any[] = null;
  private allGameData: any = null;
  private mainAppComponent: GameChangeListener = null;

  constructor(private http: HttpClient) { }

  public setMainAppComponent(mainAppComponent: GameChangeListener) {
    this.mainAppComponent = mainAppComponent;
  }

  public getDataBaseUrl() {
    return "assets/zil-to-json/data";
  }

  public getGameBaseUrl() {
    // Example: "assets/zil-to-json/data/zork1/"
    return this.getDataBaseUrl() + "/" + this.getSelectedGameId(null);
  }

  public setSelectedGameId(selectedGameId: string, gameDataReceiver: GameDataReceiver) {
    localStorage.setItem('selectedGameId', selectedGameId);
    this.cachedSelectedGameId = selectedGameId;
    this.clearAllCaches();
    this.getAllGameData(gameDataReceiver);
    if (this.mainAppComponent) {
      let newGameId = this.getSelectedGameId(null);
      this.mainAppComponent.onChangeGame(newGameId);
    }
  }

  public clearAllCaches() {
    this.indexCached = null;
    this.allObjectsCached = null;
    this.allRoomsCached = null;
    this.allRoutinesCached = null;
    this.allSyntaxesCached = null;
  }

  // gameIdInPath is optional
  // if a user visits a link to a page for a specific game directly,
  // the gameIdInPath should be supplied, to prevent
  // unnecessarily fetching data for the default zork1 game
  public getSelectedGameId(gameIdInPath: string) {
    if (this.cachedSelectedGameId) {
      console.log("selectedGameId from cache: " + this.cachedSelectedGameId);
      return this.cachedSelectedGameId;
    }
    let selectedGameId = localStorage.getItem('selectedGameId');
    if (!selectedGameId) {
      if (gameIdInPath) {
        selectedGameId = gameIdInPath;
        console.log("selectedGameId from preferred default: " + selectedGameId);
      } else {
        selectedGameId = this.defaultSelectedGameId;
        console.log("selectedGameId from default: " + selectedGameId);
      }
      localStorage.setItem('selectedGameId', selectedGameId);
    } else {
      console.log("selectedGameId from localstorage: " + selectedGameId);
    }
    this.cachedSelectedGameId = selectedGameId;
    return selectedGameId;
  }

  public getIndex() {
    if (this.indexCached != null) {
      console.log("getIndex() returning already-cached:", this.indexCached);
      return of(this.indexCached);
    } else {
      console.log("getIndex() not-yet-cached, fetching...");
      return this.http
        .get(this.getDataBaseUrl() + "/index.json")
        .pipe(
          map((res: any) => {
            this.indexCached = res;
            console.log("getIndex() returning just-fetched-and-cached:", this.indexCached);
            return this.indexCached;
          }),
          catchError(err => of({})));
    }
  }

  public getAllGameData(receiver: GameDataReceiver) {
    this.getAllObjects().subscribe(allObjects => {
      this.getAllRooms().subscribe(allRooms => {
        this.getAllRoutines().subscribe(allRoutines => {
          this.getAllSyntaxes().subscribe(allSyntaxes => {
            this.allGameData = {
              allObjects: allObjects,
              allRooms: allRooms,
              allRoutines: allRoutines,
              allSyntaxes: allSyntaxes
            };
            this.analyzeGameData();
            receiver.receiveGameData(this.allGameData);
          })
        })
      })
    });
  }

  public analyzeGameData() {
    this.allGameData["metadata"] = {};
    var metadata = this.allGameData["metadata"];
    for (let o of this.allGameData.allObjects) {
      if (metadata[o.Name]) { console.warn("WARN: Object name " + o.Name + " conflicts and overrides other entity:", metadata[o.Name]); }
      metadata[o.Name] = {"name": o.Name, "type": "OBJECT"};
    }
    for (let o of this.allGameData.allRooms) {
      if (metadata[o.Name]) { console.warn("WARN: Room name " + o.Name + " conflicts and overrides other entity:", metadata[o.Name]); }
      metadata[o.Name] = {"name": o.Name, "type": "ROOM"};
    }
    for (let o of this.allGameData.allRoutines) {
      if (metadata[o.Name]) { console.warn("WARN: Routine name " + o.Name + " conflicts and overrides other entity:", metadata[o.Name]); }
      metadata[o.Name] = {
        "name": o.Name,
        "type": "ROUTINE",
        "isActionForObjects": [],
        "isActionForRooms": [],
        "isPreactionForSyntaxes": [],
        "isActionForSyntaxes": []
      };
    }
    // Mark routines that are room action functions
    for (let o of this.allGameData.allRooms) {
      if (o.Properties["ACTION"]) {
        let actionFunctionName = o.Properties["ACTION"][0].Atom;
        if (actionFunctionName) {
          let meta = metadata[actionFunctionName];
          meta["isActionForRooms"].push(o.Name);
        }
      }
    }
    // Mark routines that are object action functions
    for (let o of this.allGameData.allObjects) {
      if (o.Properties["ACTION"]) {
        let actionFunctionName = o.Properties["ACTION"][0].Atom;
        if (actionFunctionName) {
          let meta = metadata[actionFunctionName];
          meta["isActionForObjects"].push(o.Name);
        }
      }
    }
    // Mark routines that are syntax preaction functions
    for (let syntax of this.allGameData.allSyntaxes) {
      let actionFunctionName = syntax["Preaction"];
      if (actionFunctionName) {
        let meta = metadata[actionFunctionName];
        meta["isPreactionForSyntaxes"].push(syntax);
        ////console.log("meta:", meta);
      }
    }
    // Mark routines that are syntax action functions
    for (let syntax of this.allGameData.allSyntaxes) {
      let actionFunctionName = syntax["Action"];
      if (actionFunctionName) {
        let meta = metadata[actionFunctionName];
        meta["isActionForSyntaxes"].push(syntax);
      }
    }
  }

  // public findRoutineWithName(name) {

  // }

  public getAllObjects() {
    if (this.allObjectsCached != null) {
      console.log("getAllObjects() returning already-cached:", this.allObjectsCached);
      return of(this.allObjectsCached);
    } else {
      console.log("getAllObjects() not-yet-cached, fetching...");
      return this.http
        .get(this.getGameBaseUrl() + "/objects.json")
        .pipe(
          map((res: any) => {
            this.allObjectsCached = res.sort((o1, o2) => { return o1.Name < o2.Name ? -1 : 1 });
            console.log("getAllObjects() returning just-fetched-and-cached:", this.allObjectsCached);
            return this.allObjectsCached;
          }),
          catchError(err => of([])));
    }
  }

  public getAllRooms() {
    if (this.allRoomsCached != null) {
      console.log("getAllRooms() returning already-cached:", this.allRoomsCached);
      return of(this.allRoomsCached);
    } else {
      console.log("getAllRooms() not-yet-cached, fetching...");
      return this.http
        .get(this.getGameBaseUrl() + "/rooms.json")
        .pipe(
          map((res: any) => {
            this.allRoomsCached = res.sort((o1, o2) => { return o1.Name < o2.Name ? -1 : 1 });
            console.log("getAllRooms() returning just-fetched-and-cached:", this.allRoomsCached);
            return this.allRoomsCached;
          }),
          catchError(err => of([])));
    }
  }

  public getAllRoutines(): Observable<any[]> {
    if (this.allRoutinesCached != null) {
      console.log("getAllRoutines() returning already-cached:", this.allRoutinesCached);
      return of(this.allRoutinesCached);
    } else {
      console.log("getAllRoutines() not-yet-cached, fetching...");
      return this.http
        .get(this.getGameBaseUrl() + "/routines.json")
        .pipe(
          map((res: any) => {
            this.allRoutinesCached = res.sort((o1, o2) => { return o1.Name < o2.Name ? -1 : 1 });
            console.log("getAllRoutines() returning just-fetched-and-cached:", this.allRoutinesCached);
            return this.allRoutinesCached;
          }),
          catchError(err => of([])));
    }
  }

  public getAllSyntaxes() {
    if (this.allSyntaxesCached != null) {
      console.log("getAllSyntaxes() returning already-cached:", this.allSyntaxesCached);
      return of(this.allSyntaxesCached);
    } else {
      console.log("getAllSyntaxes() not-yet-cached, fetching...");
      return this.http
        .get(this.getGameBaseUrl() + "/syntaxes.json")
        .pipe(
          map((res: any) => {
            this.allSyntaxesCached = res.sort((o1, o2) => { return o1.Syntax < o2.Syntax ? -1 : 1 });
            console.log("getAllSyntaxes() returning just-fetched-and-cached:", this.allSyntaxesCached);
            return this.allSyntaxesCached;
          }),
          catchError(err => of([])));
    }
  }
}
