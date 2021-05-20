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
  private mostRecentSelectedGameId: string = null; // a bit of a hack
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
    this.mostRecentSelectedGameId = gameId;
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

  public getMetadata(objName: string) {
    return this.allGameDataCache[this.mostRecentSelectedGameId]["metadata"][objName];
  }


}
