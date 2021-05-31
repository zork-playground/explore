import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { ActivatedRoute, Params } from '@angular/router';
import { GameDataReceiver } from '../game-data-receiver';


@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {

  public isInitialized: boolean = false;
  public gameId: string;
  public searchText: string;
  public gameData: any;
  public searchResults: any[];

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
    console.log("Routed to ObjectDetails, params:", params);
    this.isInitialized = false;
    this.gameId = params["gameId"];
    this.searchText = params["text"];
    this.searchResults = null;
    this.gameDataService.getAllGameData(this.gameId, this);
  }

  public receiveGameData(gameData: any) {
    this.gameData = gameData;
    this.searchResults = this.gameDataService.doSearch(this.searchText, this.gameData);
    this.isInitialized = true;
  }

}
