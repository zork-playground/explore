import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { GameDataService } from './game-data.service';
import { GameAwareMenu } from './game-aware-menu';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, GameAwareMenu {

  title = 'explore';
  public gameId: string;
  public searchText: string = "";

  constructor(private router: Router, private route: ActivatedRoute, private gameDataService: GameDataService) {
    //this.gameId = this.route.snapshot.params["gameId"];
    console.log("In AppComponent, gameId=" + this.gameId);
    this.gameDataService.registerGameAwareMenu(this);
  }

  setGameId(gameId: string): void {
    console.log("AppComponent now knows that gameId=" + gameId);
    //////this.gameId = gameId;
  }

  ngOnInit() {
  }

  onActivate($event) {
    if ($event.route) {
      this.gameId = $event.route.snapshot.params.gameId;
    } else {
      this.gameId = null;
    }
  }

  public onSearchBarEnter() {
    console.log("searchText=" + this.searchText);
    console.log("gameId=" + this.searchText);
    this.router.navigate(["games", this.gameId, "search", this.searchText]);
  }
}
