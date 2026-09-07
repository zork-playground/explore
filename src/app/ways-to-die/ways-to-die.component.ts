import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { ActivatedRoute } from '@angular/router';
import { GameDataReceiver } from '../game-data-receiver';
import { WayToDie } from './way-to-die';
import { CodePath, CodePathItem } from './code-path';

@Component({
  selector: 'app-ways-to-die',
  templateUrl: './ways-to-die.component.html',
  styleUrls: ['./ways-to-die.component.css']
})
export class WaysToDieComponent implements OnInit, GameDataReceiver {

  public gameId: string;
  public gameData: any;
  public isInitialized: boolean = false;
  //public allRoutines: any[] = null;
  public stringify = JSON.stringify;
  public waysToDie: WayToDie[];
  public addNewPathsFlag: boolean = false; // temporary

  constructor(
    private route: ActivatedRoute,
    private gameDataService: GameDataService
  ) {
    this.gameId = this.route.snapshot.params["gameId"];
  }

  ngOnInit(): void {
    this.gameDataService.getAllGameData(this.gameId, this);
  }

  public receiveGameData(gameData: any) {
    this.gameData = gameData;
    let metadata = this.gameData.metadata;
    let jigsUpMeta = metadata["JIGS-UP"];
    console.log("jigsUpMeta:", jigsUpMeta);
    this.waysToDie = [];
    for (let routineName of jigsUpMeta.references) {
      if (routineName != "V-BURN") {
        continue;
      }
      this.addNewPathsFlag = (routineName == "V-BURN" ? true : false);
      let routine = this.getRoutineObject(routineName);
      let routineMeta = metadata[routineName];
      let allCodePaths: CodePath[] = [];
      let wayToDie: WayToDie = {
        "routine": routine,
        "routineMeta": metadata[routineName],
        "codePaths": allCodePaths
      };
      if (routineMeta.isActionForRooms.length > 0) {
        let roomAtom = routineMeta.isActionForRooms[0];
        wayToDie.room = this.getObjectByAtomName(roomAtom);
        wayToDie.roomMeta = metadata[roomAtom];
        wayToDie.title = "In " + wayToDie.roomMeta.desc;
      } else if (routineMeta.isActionForSyntaxes.length > 0) {
        let syntax = routineMeta.isActionForSyntaxes[0];
        wayToDie.syntax = syntax;
        wayToDie.syntaxDesc = this.getSyntaxDesc(syntax);
        wayToDie.title = wayToDie.syntaxDesc;
      } else {
        wayToDie.title = "From " + routineMeta.name + ", " + routineMeta.desc;
      }
      let currentPath: CodePath = {"path": [], "jigsUp": false};
      allCodePaths.push(currentPath);
      for (let node of routine.Body) {
        this.buildCodePathsRecursive(node, 0, allCodePaths);
      }
      this.waysToDie.push(wayToDie);
    }
    this.waysToDie.sort((w1,w2) => {
      let rank1 = w1.syntaxDesc ? 1 : w1.room ? 2 : 3;
      let rank2 = w2.syntaxDesc ? 1 : w2.room ? 2 : 3;
      return rank1 - rank2;
    });
    console.log("waysToDie:", this.waysToDie);
    this.isInitialized = true;
  }

  private buildCodePathsRecursive(o: any, currentIndex: number, allCodePaths: CodePath[]): void {
    for (let p=currentIndex; p<allCodePaths.length; p++) {
      let currentPath = allCodePaths[p];
      if (o) {
        if (o.A != undefined) { // Atom
          currentPath.path.push({"desc": "Atom:" + o.A});
        } else if (o.F != undefined) { // Form
          if (o.F[0]) { // make sure it's not "Null" i.e. <>
            // o.F is an array of things
            let formName = o.F[0].A;
            if (formName == "COND") {
              for (let i=1; i<o.F.length; i++) {
                let block = o.F[i];
                let blockCond = block[0];
                let truePath = currentPath;
                let falsePath = this.cloneCodePath(currentPath);
                truePath.path.push({"cond": JSON.stringify(blockCond, null, 0)}); // TODO: change back to just "o" instead of stringify
                falsePath.path.push({"notCond": JSON.stringify(blockCond, null, 0)}); // TODO: change back to just "o" instead of stringify
                // only the "true" path will go through the rest of the statements
                for (let j=1; j<block.length; j++) {
                  let stmt = block[j];
                  this.buildCodePathsRecursive(stmt, p, allCodePaths);
                }
                allCodePaths.push(falsePath);
                p++; currentPath = falsePath;
              }
            } else if (formName == "TELL") {
              currentPath.path.push({"tell": JSON.stringify(o, null, 0)}); // TODO: change back to just "o" instead of stringify
            } else if (formName == "JIGS-UP") {
              currentPath.path.push({"tell": "JIGSUP: " + JSON.stringify(o, null, 0)}); // TODO: change back to just "o" instead of stringify
              currentPath.jigsUp = true;
            } else {
              ////currentPath.path.push({"desc": "FORM:" + formName});
              this.buildCodePathsRecursive(o.F, p, allCodePaths);
              ////currentPath.path.push({"desc": "END:" + formName});
            }
          } else {
            currentPath.path.push({"desc": "<>"});
          }
        } else if (Array.isArray(o)) {
          // o is an Array
          ////currentPath.path.push({"desc": "ArrayStart"});
          for (let child of o) {
            this.buildCodePathsRecursive(child, p, allCodePaths);
          }
          ////currentPath.path.push({"desc": "ArrayEnd"});
        } else if (typeof o == 'string' || typeof o == 'number' || typeof o == 'boolean') {
          currentPath.path.push({"desc": "primitive:" + JSON.stringify(o, null, 0)});
        } else {
          currentPath.path.push({"desc": "WARN:UNHANDLED:" + JSON.stringify(o, null, 0)});
        }
      }
    }
  }

  private cloneCodePath(codePath: CodePath): CodePath {
    return JSON.parse(JSON.stringify(codePath));
  }

  private getRoutineObject(routineName) {
    for (let r of this.gameData.Routines) {
      if (r.Name == routineName) {
        return r;
      }
    }
    return null;
  }

  private getObjectByAtomName(atomName) {
    for (let o of this.gameData.Objects) {
      if (o.Name == atomName) {
        return o;
      }
    }
    return null;
  }

  private getSyntaxDesc(s): string {
    let desc = s.Verb.toLowerCase();
    if (s.Preposition1) { desc = desc + " " + s.Preposition1.toLowerCase(); }
    if (s.Object1)      { desc = desc + " " + s.Object1.toLowerCase(); }
    if (s.Preposition2) { desc = desc + " " + s.Preposition2.toLowerCase(); }
    if (s.Object2)      { desc = desc + " " + s.Object2.toLowerCase(); }
    return desc;
  }

}
