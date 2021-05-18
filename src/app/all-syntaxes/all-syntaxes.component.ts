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
  public gameData: any;
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
    this.gameDataService.getAllGameData(this.gameId, this);
  }

  public receiveGameData(gameData: any) {
    this.gameData = gameData;
    this.allSyntaxes = gameData.Syntaxes;
    this.isInitialized = true;
  }

}
