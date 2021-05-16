import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GameDataReceiver } from '../game-data-receiver';


@Component({
  selector: 'app-routine-details',
  templateUrl: './routine-details.component.html',
  styleUrls: ['./routine-details.component.css']
})
export class RoutineDetailsComponent implements OnInit, GameDataReceiver {

  public gameId: string;
  public stringify = JSON.stringify;
  public id: string = null;
  public o: any = null;
  public isInitialized: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gameDataService: GameDataService) {
    //console.log("router url:", this.router.url);
    this.gameId = this.route.snapshot.params["gameId"];
    this.id = route.snapshot.params["id"];
    console.log("this.selectedId:", this.id);
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
    this.gameDataService.getAllRoutines().subscribe((allRoutines) => {
      console.log("allRoutines:", allRoutines);
      for (let o of allRoutines) {
        if (o.Name == this.id) {
          this.o = o;
        }
      }
      if (!this.o) {
        console.log("Error: routine not found.");
      }
      console.log("this.o:", this.o);
      this.isInitialized = true;
    });
  }

}
