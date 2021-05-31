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

  private indexCached: any = null;
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
    return "https://raw.githubusercontent.com/zork-playground/zil-to-json/main/data";
    ////return "assets/zil-to-json/data";
  }

  // Private. Components should use getIndex() instead.
  private fetchIndex() {
    return this.http.get(this.getDataBaseUrl() + "/index.json");
  }

  // Private. Components should use getAllGameData() instead.
  private fetchAllGameData(index: any, gameId: string) {
    return this.http.get(this.getDataBaseUrl() + "/" + index[gameId]["src"]);
  }

  public getIndex() {
    if (this.indexCached != null) {
      // If it's in the cache, just give it
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

  public getAllGameData(gameId: string, receiver: GameDataReceiver): void {
    this.mostRecentSelectedGameId = gameId;
    console.log("calling setGameIdForMenu with gameId=" + gameId);
    this.setGameIdForMenu(gameId);
    if (this.allGameDataCache[gameId]) {
      // If it's in the cache, just give it
      receiver.receiveGameData(this.allGameDataCache[gameId]);
    } else {
      // Otherwise, fetch and cache and give it
      this.getIndex().subscribe((index) => {
        this.fetchAllGameData(index, gameId).subscribe(allGameData => {
          console.log("Fetched allGameData for " + gameId + ":", allGameData);
          this.allGameDataCache[gameId] = allGameData;
          this.analyzeGameData(this.allGameDataCache[gameId]);
          receiver.receiveGameData(this.allGameDataCache[gameId]);
        });
      });
    }
  }

  public analyzeGameData(gameData: any) {
    gameData["metadata"] = {};
    var metadata = gameData["metadata"];

    // First, ensure that every object, room, and routine has a metadata entry
    // keyed by ID (o.Name) and having fields:
    //   name (o.Name)
    //   type (OBJECT|ROOM|ROUTINE)
    //   references (array to be populated later)
    for (let o of gameData.Objects) {
      if (metadata[o.Name]) { console.warn("WARN: Object name " + o.Name + " conflicts and overrides other entity:", metadata[o.Name]); }
      metadata[o.Name] = {
        "name": o.Name,
        "type": o.IsRoom? "ROOM" : "OBJECT",
        "references": []
      };
    }
    for (let o of gameData.Routines) {
      if (metadata[o.Name]) { console.warn("WARN: Routine name " + o.Name + " conflicts and overrides other entity:", metadata[o.Name]); }
      metadata[o.Name] = {
        "name": o.Name,
        "type": "ROUTINE",
        "references": [],
        "isActionForObjects": [],
        "isActionForRooms": [],
        "isPreactionForSyntaxes": [],
        "isActionForSyntaxes": []
      };
    }

    // Here we annotate routines that are used as Object Actions,
    // Room Actions, Syntax Pre-Action, Syntax Actions

    for (let o of gameData.Objects) {
      if (o.IsRoom && o.Properties["ACTION"]) {
        let actionFunctionName = o.Properties["ACTION"][0].A;
        if (actionFunctionName) {
          let meta = metadata[actionFunctionName];
          meta["isActionForRooms"].push(o.Name);
        }
      }
    }
    for (let o of gameData.Objects) {
      if (!o.IsRoom && o.Properties["ACTION"]) {
        let actionFunctionName = o.Properties["ACTION"][0].A;
        if (actionFunctionName) {
          let meta = metadata[actionFunctionName];
          meta["isActionForObjects"].push(o.Name);
        }
      }
    }
    for (let syntax of gameData.Syntaxes) {
      let actionFunctionName = syntax["Preaction"];
      if (actionFunctionName) {
        let meta = metadata[actionFunctionName];
        meta["isPreactionForSyntaxes"].push(syntax);
        ////console.log("meta:", meta);
      }
    }
    for (let syntax of gameData.Syntaxes) {
      let actionFunctionName = syntax["Action"];
      if (actionFunctionName) {
        let meta = metadata[actionFunctionName];
        meta["isActionForSyntaxes"].push(syntax);
      }
    }

    // Now look in routines and find their references to objects, rooms, and other routines
    // TODO: Finish this implementation
    for (let routine of gameData.Routines) {
      let hasProcessed = {}; // track which gvars we've already processed
      let routineName = routine.Name;
      // TODO: Remove the following condition
      //////if (routineName == "GO") {
        // routine.Body is an array of things
        let gvars = this.getGlobalVarsRecursive(routine.Body);
        // translate to set
        let gvarSet = {};
        for (let gvar of gvars) {
          gvarSet[gvar] = true;
        }
        ////console.log("routine " + routineName + " contains atoms: " + JSON.stringify(Object.keys(gvarSet), null, 0));
        for (let gvar in gvarSet) {
          let objMeta = metadata[gvar];
          if (objMeta && objMeta.references) {
            objMeta.references.push(routineName);
          }
          hasProcessed[gvar] = true;
        }
      //////}
    }
  }

  public getGlobalVarsRecursive(o: any) {
    let gvars: any[] = [];
    if (!o) {
      ////console.log("AZ: null");
      return gvars;
    }
    ////console.log("AZ: PROCESSING: ", o);
    if (o.A != undefined) { // Atom
      ////console.log("AZ: atom: " + o.A);
      // let objMeta = metadata[o.A]; let objType = objMeta["type"] || "unknown";
      gvars.push(o.A);
      return gvars;
    }
    if (o.F != undefined) { // Form
      ////console.log("AZ: form: " + o.F);
      if (!o.F[0]) { // "Null" i.e. <>
        ////console.log("AZ: Null <>");
        return gvars;
      }
      let atom = o.F[0].A;
      if (atom == "GVAL") { // Found a Global Var!
        ////console.log("AZ: FOUND GVAL: " + o.F[1].A);
        let gvalName = o.F[1].A;
        gvars.push(gvalName);
      } else if (atom != "LVAL") {
        // o.F is always an array of things
        ////console.log("AZ: recursively calling on o.F");
        let childGvars = this.getGlobalVarsRecursive(o.F);
        gvars = gvars.concat(childGvars);
      }
      ////console.log("AZ: returning gvars:", gvars);
      return gvars;
    }
    if (Array.isArray(o)) {
      // o is an Array
      ////console.log("AZ: IS ARRAY");
      for (let o2 of o) {
        let childGvars = this.getGlobalVarsRecursive(o2);
        gvars = gvars.concat(childGvars);
      }
      return gvars;
    }
    // o is Other
    ////console.log("AZ: IS OTHER");
    return gvars;
  }

  public getMetadata(objName: string) {
    return this.allGameDataCache[this.mostRecentSelectedGameId]["metadata"][objName];
  }

  public doSearch(searchText: string, gameData: any) {
    let searchResults = [];
    searchText = searchText.toLowerCase(); // all searches are case insensitive
    var metadata = gameData["metadata"];
    for (let o of gameData.Objects) {
      let objMeta = metadata[o.Name];
      if (o.Name.toLowerCase().includes(searchText)) {
        searchResults.push({"type": objMeta.type, "name": o.Name, "desc": o.Properties["DESC"]});
      } else if (typeof(o.Properties["DESC"])=="string" && o.Properties["DESC"].toLowerCase().includes(searchText)) {
        searchResults.push({"type": objMeta.type, "name": o.Name, "desc": o.Properties["DESC"]});
      }
    }
    for (let o of gameData.Routines) {
      let objMeta = metadata[o.Name];
      if (o.Name.toLowerCase().includes(searchText)) {
        let desc = "Routine";
        if (objMeta.isActionForObjects.length > 0) {
          desc = "Action for Object: " + objMeta.isActionForObjects.join(", ");
        } else if (objMeta.isActionForRooms.length > 0) {
          desc = "Action for Room: " + objMeta.isActionForRooms.join(", ");
        } else if (objMeta.isPreactionForSyntaxes.length > 0) {
          desc = "Pre-Action for Syntax";
        } else if (objMeta.isActionForSyntaxes.length > 0) {
          desc = "Action for Syntax";
        }
        searchResults.push({"type": objMeta.type, "name": o.Name, "desc": desc});
      }
    }
    // TODO: after syntax support is enhanced, add syntaxes/words to search
    // TODO: after adding support for other types like global vars, add to search
    return searchResults;
  }

}
