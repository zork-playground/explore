import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { GameDataReceiver } from './game-data-receiver';
import { GameAwareMenu } from './game-aware-menu';

@Injectable({
  providedIn: 'root'
})
export class GameDataService {

  //private defaultSelectedGameId: string = "zork-1";
  //private cachedSelectedGameId: string = null;
  private indexCached: any = null;
  //private allObjectsCached: any[] = null;
  //private allRoomsCached: any[] = null;
  //private allRoutinesCached: any[] = null;
  //private allSyntaxesCached: any[] = null;
  //private allGameData: any = null;
  private allGameDataCache: any = {}; // {gameId => allGameData}
  private gameAwareMenu: GameAwareMenu = null;

  constructor(private http: HttpClient) { }

  public registerGameAwareMenu(gameAwareMenu: GameAwareMenu) {
    this.gameAwareMenu = gameAwareMenu;
  }

  public setGameIdForMenu(gameId: string) {
    this.gameAwareMenu.setGameId(gameId);
  }

  private getDataBaseUrl() {
    return "assets/zil-to-json/data";
  }

  private getGameBaseUrl(gameId: string) {
    // Example: "assets/zil-to-json/data/zork1/"
    return this.getDataBaseUrl() + "/" + gameId;
  }

  // Private. Components should use getIndex() instead.
  private fetchIndex() {
    return this.http.get(this.getDataBaseUrl() + "/index.json");
  }

  public getIndex() {
    // If it's in the cache, just give it
    if (this.indexCached != null) {
      return of(this.indexCached);
    } else {
      // Otherwise, fetch and cache and give it
      return this.fetchIndex().pipe(
        map((res: any) => {
          this.indexCached = res;
          console.log("getIndex() returning just-fetched-and-cached:", this.indexCached);
          return this.indexCached;
        }),
        catchError(err => of({}))
      )
    };
  }

  // Private. Components should use getAllGameData() instead.
  private fetchAllGameData(gameId: string) {
    return this.http.get(this.getGameBaseUrl(gameId) + "/all.json");
  }

  public getAllGameData(gameId: string, receiver: GameDataReceiver): void {
    console.log("calling setGameIdForMenu with gameId=" + gameId);
    this.setGameIdForMenu(gameId);
    if (this.allGameDataCache[gameId]) {
      // If it's in the cache, just give it
      receiver.receiveGameData(this.allGameDataCache[gameId]);
    } else {
      // Otherwise, fetch and cache and give it
      this.fetchAllGameData(gameId).subscribe(allGameData => {
        console.log("Fetched allGameData for " + gameId + ":", allGameData);
        this.allGameDataCache[gameId] = allGameData;
        this.analyzeGameData(this.allGameDataCache[gameId]);
        receiver.receiveGameData(this.allGameDataCache[gameId]);
      });
    }
  }

  /*
  public setSelectedGameIdAndGetAllGameData(selectedGameId: string, gameDataReceiver: GameDataReceiver) {
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
    this.allGameDataCached = null;
    //this.allObjectsCached = null;
    //this.allRoomsCached = null;
    //this.allRoutinesCached = null;
    //this.allSyntaxesCached = null;
  }

  // gameIdInPath is optional
  // if a user visits a link to a page for a specific game directly,
  // the gameIdInPath should be supplied, to prevent
  // unnecessarily fetching data for the default zork1 game
  public getOrSetSelectedGameId(gameIdInPath: string) {
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
  */

  /*
  public getAllGameData(receiver: GameDataReceiver) {
    this.fetchAllGameData().subscribe(allGameData => {
      this.allGameDataCached = allGameData;
      this.analyzeGameData(this.allGameDataCached);
      receiver.receiveGameData(this.allGameDataCached);
    });
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
            this.analyzeGameData(this.allGameDataCached);
            receiver.receiveGameData();
          })
        })
      })
    });
  }
    */

  public analyzeGameData(gameData: any) {
    gameData["metadata"] = {};
    var metadata = gameData["metadata"];
    for (let o of gameData.Objects) {
      if (metadata[o.Name]) { console.warn("WARN: Object name " + o.Name + " conflicts and overrides other entity:", metadata[o.Name]); }
      metadata[o.Name] = {"name": o.Name, "type": o.IsRoom? "ROOM" : "OBJECT"};
    }
    for (let o of gameData.Routines) {
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
    for (let o of gameData.Objects) {
      if (o.IsRoom && o.Properties["ACTION"]) {
        let actionFunctionName = o.Properties["ACTION"][0].A;
        if (actionFunctionName) {
          let meta = metadata[actionFunctionName];
          meta["isActionForRooms"].push(o.Name);
        }
      }
    }
    // Mark routines that are object action functions
    for (let o of gameData.Objects) {
      if (!o.IsRoom && o.Properties["ACTION"]) {
        let actionFunctionName = o.Properties["ACTION"][0].A;
        if (actionFunctionName) {
          let meta = metadata[actionFunctionName];
          meta["isActionForObjects"].push(o.Name);
        }
      }
    }
    // Mark routines that are syntax preaction functions
    for (let syntax of gameData.Syntaxes) {
      let actionFunctionName = syntax["Preaction"];
      if (actionFunctionName) {
        let meta = metadata[actionFunctionName];
        meta["isPreactionForSyntaxes"].push(syntax);
        ////console.log("meta:", meta);
      }
    }
    // Mark routines that are syntax action functions
    for (let syntax of gameData.Syntaxes) {
      let actionFunctionName = syntax["Action"];
      if (actionFunctionName) {
        let meta = metadata[actionFunctionName];
        meta["isActionForSyntaxes"].push(syntax);
      }
    }
  }

  // public findRoutineWithName(name) {

  // }

  /*
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
  */
}
