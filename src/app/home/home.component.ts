import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public selectedGameName: string;
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

  constructor(private gameDataService: GameDataService) {

  }

  ngOnInit(): void {
    this.gameDataService.getIndex().subscribe(index => {
      let gameId = this.gameDataService.getSelectedGameId(null);
      let gameData = index[gameId];
      this.selectedGameName = gameData.name;
      this.isInitialized = true;
    });
  }

}
