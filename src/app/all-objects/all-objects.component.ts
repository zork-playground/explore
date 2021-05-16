import { Component, OnInit } from '@angular/core';
import { GameDataService } from '../game-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GameDataReceiver } from '../game-data-receiver';

@Component({
  selector: 'app-all-objects',
  templateUrl: './all-objects.component.html',
  styleUrls: ['./all-objects.component.css']
})
export class AllObjectsComponent implements OnInit, GameDataReceiver {

  public gameId: string;
  public isInitialized: boolean = false;
  public allObjects: any[] = null;
  public filterActor: boolean = true;
  public filterTakeable: boolean = false;
  public filterContainer: boolean = false;
  public filterInvisible: boolean = false;
  public visibilityFilterValue: string = "All"; // Visible, Invisible, All
  public containerFilterValue: string = "All"; // Container, Surface, Transparent, NonContainer, All
  public actorFilterValue: string = "All";          // Actor, NonActor, All
  public tryTakeFilterValue: string = "All";   // Takeable, Now, Not Now, Never, Taunt, All
  public lightFireFilterValue: string = "All";   // Lightable, Flaming, Burnable, All

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

  public initialize() {
    this.gameDataService.getAllObjects().subscribe((response: any[]) => {
      this.allObjects = response;
      this.isInitialized = true;
    });
  }

  public getObjectLabel(o) {
    let label: string = "";
    if (o.Properties.ADJECTIVE) {
      label = label + "(";
      label = label + o.Properties.ADJECTIVE.toString().replace(/,/g, ", ").toLowerCase();
      label = label + ") ";
    }
    if (o.Properties.SYNONYM) {
      label = label + o.Properties.SYNONYM.toString().replace(/,/g, ", ").toLowerCase();
    }
    return label;
  }

  public getAdjectivesDesc(o) {
    if (o.Properties.ADJECTIVE) {
      return "(" + o.Properties.ADJECTIVE.toString().replace(/,/g, ", ").toLowerCase() + ")";
    } else {
      return "";
    }
  }

  public getSynonymsDesc(o) {
    if (o.Properties.SYNONYM) {
      return o.Properties.SYNONYM.toString().replace(/,/g, ", ").toLowerCase();
    } else {
      return "";
    }
  }

  public passesFilters(o) {
    if (!o.Properties.FLAGS) {
      return false;
    }
    // tryTake group
    if (this.tryTakeFilterValue == 'Takeable' && !(o.Properties.FLAGS.includes('TAKEBIT'))) {
      return false;
    }
    if (this.tryTakeFilterValue == 'Now' && !(o.Properties.FLAGS.includes('TAKEBIT') && !o.Properties.FLAGS.includes('TRYTAKEBIT'))) {
      return false;
    }
    if (this.tryTakeFilterValue == 'Not Now' && !(o.Properties.FLAGS.includes('TAKEBIT') && o.Properties.FLAGS.includes('TRYTAKEBIT'))) {
      return false;
    }
    if (this.tryTakeFilterValue == 'Never' && o.Properties.FLAGS.includes('TAKEBIT')) {
      return false;
    }
    if (this.tryTakeFilterValue == 'Taunt' && !(!o.Properties.FLAGS.includes('TAKEBIT') && o.Properties.FLAGS.includes('TRYTAKEBIT'))) {
      return false;
    }
    // container group
    if (this.containerFilterValue == 'Container' && !(o.Properties.FLAGS.includes('CONTBIT'))) {
      return false;
    }
    if (this.containerFilterValue == 'Surface' && !(o.Properties.FLAGS.includes('CONTBIT') && o.Properties.FLAGS.includes('SURFACEBIT'))) {
      return false;
    }
    if (this.containerFilterValue == 'Transparent' && !(o.Properties.FLAGS.includes('CONTBIT') && o.Properties.FLAGS.includes('TRANSBIT'))) {
      return false;
    }
    if (this.containerFilterValue == 'NonContainer' && o.Properties.FLAGS.includes('CONTBIT')) {
      return false;
    }
    // actor group
    if (this.actorFilterValue == 'Actor' && !o.Properties.FLAGS.includes('ACTORBIT')) {
      return false;
    }
    if (this.actorFilterValue == 'NonActor' && o.Properties.FLAGS.includes('ACTORBIT')) {
      return false;
    }
    // visibility group
    if (this.visibilityFilterValue == 'Visible' && o.Properties.FLAGS.includes('INVISIBLE')) {
      return false;
    }
    if (this.visibilityFilterValue == 'Invisible' && !o.Properties.FLAGS.includes('INVISIBLE')) {
      return false;
    }
    // light-fire group
    if (this.lightFireFilterValue == 'Lightable' && !(o.Properties.FLAGS.includes('LIGHTBIT'))) {
      return false;
    }
    if (this.lightFireFilterValue == 'Flaming' && !(o.Properties.FLAGS.includes('FLAMEBIT'))) {
      return false;
    }
    if (this.lightFireFilterValue == 'Burnable' && !(o.Properties.FLAGS.includes('BURNBIT'))) {
      return false;
    }
    return true;
  }

}
