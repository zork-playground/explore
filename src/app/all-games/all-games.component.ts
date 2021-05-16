import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { GameDataReceiver } from '../game-data-receiver';

@Component({
  selector: 'app-all-games',
  templateUrl: './all-games.component.html',
  styleUrls: ['./all-games.component.css']
})
export class AllGamesComponent implements OnInit, GameDataReceiver {

  public gameId: string;
  public isInitialized: boolean = false;
  public cards: any[] = [
    {
      "imageText": "Rooms",
      "title": "Rooms",
      "description": "All rooms in the game",
      "link": "rooms"
    },
    {
      "imageText": "Objects",
      "title": "Objects",
      "description": "All objects in the game",
      "link": "objects"
    },
    {
      "imageText": "Routines",
      "title": "Routines",
      "description": "All routines in the game",
      "link": "routines"
    },
    {
      "imageText": "Syntaxes",
      "title": "Syntaxes",
      "description": "All commands in the game",
      "link": "syntaxes"
    },
  ];
  public index: any = null;

  constructor(private gameDataService: GameDataService) { }

  ngOnInit(): void {
    this.gameId = this.gameDataService.getSelectedGameId(null);
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
    this.gameDataService.setSelectedGameId(gameId, this);
    this.gameId = gameId;
  }

  public receiveGameData(gameData: any) {
    console.log("Finished re-fetching game data for newly selected game.");
    // If this page is enhanced to show game-specific information
    // on this page, here is where we would catch when the data is ready
  }

  getSelectedGameId() {
    return this.gameId;
    //return this.gameDataService.getSelectedGameId(null);
  }

  public getSelectedGameName() {
    let gameId = this.getSelectedGameId();
    return this.index[gameId].name;
  }

}
