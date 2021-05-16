import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GameDataReceiver } from '../game-data-receiver';

@Component({
  selector: 'app-all-rooms',
  templateUrl: './all-rooms.component.html',
  styleUrls: ['./all-rooms.component.css']
})
export class AllRoomsComponent implements OnInit {

  public gameId: string;
  public isInitialized: boolean = false;
  public allRooms: any[] = null;

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
    this.gameDataService.getAllRooms().subscribe((response: any[]) => {
      this.allRooms = response;
      this.isInitialized = true;
    });
  }

  public getRoomCardText(r) {
    if (r.Properties.FDESC) { return r.Properties.FDESC; }
    if (r.Properties.LDESC) { return r.Properties.LDESC; }
    if (r.Properties.ACTION && r.Properties.ACTION[0] && r.Properties.ACTION[0].Atom) {
      return "(described by " + r.Properties.ACTION[0].Atom + ")";
    }
    console.log("WARN: Could not find room description or ACTION for:", r);
    return "";
  }

  public passesFilters(o) {
    return true;
  }

}
