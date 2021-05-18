import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
//import { GameDataReceiver } from '../game-data-receiver';

@Component({
  selector: 'app-all-games',
  templateUrl: './all-games.component.html',
  styleUrls: ['./all-games.component.css']
})
export class AllGamesComponent implements OnInit {

  //public gameId: string;
  public index: any = null;
  public isInitialized: boolean = false;

  constructor(private gameDataService: GameDataService) { }

  ngOnInit(): void {
    this.gameDataService.getIndex().subscribe((response: any) => {
      this.index = response;
      this.isInitialized = true;
    });
  }

  getGameIdsSortedByRank() {
    let allKeys = Object.keys(this.index);
    console.log("pre-sort:", allKeys);
    allKeys.sort((a,b)=>{return a["rank"]-b["rank"]});
    console.log("post-sort:", allKeys);
    return allKeys;
  }

  onClickGame(gameId: string) {
    console.log("TODO: Go to game details page for: " + gameId);
    //this.gameDataService.setSelectedGameId(gameId, this);
    //this.gameId = gameId;
  }

}
