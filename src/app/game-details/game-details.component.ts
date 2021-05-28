import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { GameDataService } from '../game-data.service';


@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.css']
})
export class GameDetailsComponent implements OnInit {

  public isInitialized: boolean = false;
  public gameId: string;
  public index: any;
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

  constructor(
    private route: ActivatedRoute,
    private gameDataService: GameDataService
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.onRoute(params);
    });
  }

  public onRoute(params: Params) {
    console.log("Routed to GameDetails, params:", params);
    this.isInitialized = false;
    this.gameId = params["gameId"];
    this.index = null;
    this.gameDataService.getIndex().subscribe((response: any) => {
      this.index = response;
      this.isInitialized = true;
    });
  }

}
