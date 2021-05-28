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
    this.isInitialized = true;
  }

}
