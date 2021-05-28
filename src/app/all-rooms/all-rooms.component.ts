import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { ActivatedRoute } from '@angular/router';
import { GameDataReceiver } from '../game-data-receiver';

@Component({
  selector: 'app-all-rooms',
  templateUrl: './all-rooms.component.html',
  styleUrls: ['./all-rooms.component.css']
})
export class AllRoomsComponent implements OnInit, GameDataReceiver {

  public gameId: string;
  public gameData: any;
  public isInitialized: boolean = false;
  public allRooms: any[] = null;

  constructor(
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
    this.allRooms = this.gameData.Objects.filter(o => o.IsRoom);
    this.isInitialized = true;
  }

  public getRoomCardText(r) {
    if (r.Properties.FDESC) { return r.Properties.FDESC; }
    if (r.Properties.LDESC) { return r.Properties.LDESC; }
    if (r.Properties.ACTION && r.Properties.ACTION[0] && r.Properties.ACTION[0].A) {
      return "(described by " + r.Properties.ACTION[0].A + ")";
    }
    console.log("WARN: Could not find room description or ACTION for:", r);
    return "";
  }

  public passesFilters(o) {
    return true;
  }

}
