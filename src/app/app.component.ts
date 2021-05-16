import { Component, OnInit } from '@angular/core';
import { GameDataService } from './game-data.service';
import { GameChangeListener } from './game-change-listener';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, GameChangeListener {

  title = 'explore';
  public gameId: string;

  constructor(private gameDataService: GameDataService) {
    this.gameDataService.setMainAppComponent(this);
  }

  onChangeGame(newGameId: string): void {
    this.gameId = newGameId;
  }

  ngOnInit() {
    this.gameId = this.gameDataService.getSelectedGameId(null);
  }
}
