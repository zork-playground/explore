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
  public isInitialized: boolean = false;
  public allRoutines: any[] = null;
  public allGameData: any = null;
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

  initialize() {
    this.gameDataService.getAllRoutines().subscribe((response: any[]) => {
      this.allRoutines = response;
    });
    var thisComponent = this;
    let latterGameDataHandler = {
      "receiveGameData": function(allGameData: any): void {
        thisComponent.allGameData = allGameData;
        console.log("RECEIVED allGameData:", allGameData);
        thisComponent.isInitialized = true;
      }
    }
    this.gameDataService.getAllGameData(latterGameDataHandler);
  }

}
