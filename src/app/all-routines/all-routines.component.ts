import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GameDataReceiver } from '../game-data-receiver';


@Component({
  selector: 'app-all-routines',
  templateUrl: './all-routines.component.html',
  styleUrls: ['./all-routines.component.css']
})
export class AllRoutinesComponent implements OnInit, GameDataReceiver {

  public gameId: string;
  public gameData: any;
  public isInitialized: boolean = false;
  public allRoutines: any[] = null;
  // TODO: Move this to the game index data
  public foundationRoutines = [
    {"name": "GO", "description": "The routine that starts the game"},
    {"name": "PARSER", "description": "Get input command, handles syntax errors"},
    {"name": "PERFORM", "description": "Delegates command to action routines"},
    {"name": "CLOCKER", "description": "After player turn, lamp burns, sword glows, etc."}
  ];
  public encodeURIComponent = encodeURIComponent;
  public stringify = JSON.stringify;

  constructor(
    private router: Router,
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
    this.allRoutines = gameData.Routines;
    this.isInitialized = true;
  }

}
