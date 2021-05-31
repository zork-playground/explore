import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { ActivatedRoute, Params } from '@angular/router';
import { GameDataReceiver } from '../game-data-receiver';


@Component({
  selector: 'app-routine-details',
  templateUrl: './routine-details.component.html',
  styleUrls: ['./routine-details.component.css']
})
export class RoutineDetailsComponent implements OnInit, GameDataReceiver {

  public stringify = JSON.stringify;
  public gameId: string;
  public id: string;
  public gameData: any;
  public o: any;
  public zilSourceUrl: string;
  public isInitialized: boolean;

  constructor(
    private route: ActivatedRoute,
    private gameDataService: GameDataService) {
    this.gameId = this.route.snapshot.params["gameId"];
    this.id = route.snapshot.params["id"];
    console.log("this.selectedId:", this.id);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.onRoute(params);
    });
  }

  public onRoute(params: Params) {
    console.log("Routed to RoutineDetails, params:", params);
    this.isInitialized = false;
    this.gameId = params["gameId"];
    this.gameData = null;
    this.id = params["id"];
    this.o = null;
    this.gameDataService.getAllGameData(this.gameId, this);
  }

  public receiveGameData(gameData: any) {
    this.gameData = gameData;
    let allRoutines = gameData.Routines;
    console.log("allRoutines:", allRoutines);
    for (let o of allRoutines) {
      if (o.Name == this.id) {
        this.o = o;
      }
    }
    if (!this.o) {
      console.log("Error: routine not found.");
    }
    console.log("this.o:", this.o);
    this.gameDataService.getIndex().subscribe(index => {
      let zilBaseUrl = index[this.gameId]["zil"];
      this.zilSourceUrl = this.constructZilSourceUrl(zilBaseUrl, this.o.Source);
      console.log("zilSourceUrl=" + this.zilSourceUrl);
    });
    this.isInitialized = true;
  }

  private constructZilSourceUrl(zilBaseUrl, sourceLine): string {
    // zilBaseUrl is something like "https://github.com/historicalsource/zork1/blob/master"
    // sourceLine is something like "1ACTIONS.zil:4137"
    // return something like "https://github.com/historicalsource/zork1/blob/master/1actions.zil#L4137"
    let filename = sourceLine;
    let lineNumber = null;
    let colonPos = sourceLine.lastIndexOf(":");
    if (colonPos > 0) {
      lineNumber = filename.substring(colonPos + 1);
      filename = filename.substring(0, colonPos);
    }
    // github URLs are case sensitive
    // unfortunately, zil-to-json capitalizes filenames in the output JSON
    // so we currently don't truly know whether the original filename was lowercase
    // most/all of our current data comes from historicalsource, and
    // most of those filenames are lowercase. so for now, this is an
    // ugly hack: we assume the source zil file is lowercase in github
    filename = filename.toLowerCase();
    console.log("zilBaseUrl=" + zilBaseUrl);
    console.log("filename=" + filename);
    console.log("lineNumber=" + lineNumber);
    // return something like 
    return zilBaseUrl + "/" + filename + "#L" + lineNumber;
  }

}
