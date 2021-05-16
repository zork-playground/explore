import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GameDataReceiver } from '../game-data-receiver';

@Component({
  selector: 'app-all-syntaxes',
  templateUrl: './all-syntaxes.component.html',
  styleUrls: ['./all-syntaxes.component.css']
})
export class AllSyntaxesComponent implements OnInit, GameDataReceiver {

  public gameId: string;
  public isInitialized: boolean = false;
  public allSyntaxes: any[] = null;

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
    this.gameDataService.getAllSyntaxes().subscribe((response: any[]) => {
      this.allSyntaxes = response;
      this.isInitialized = true;
    });
  }

}
