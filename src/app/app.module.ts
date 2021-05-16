import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ObjectDetailsComponent } from './object-details/object-details.component';
import { AllObjectsComponent } from './all-objects/all-objects.component';
import { AllRoomsComponent } from './all-rooms/all-rooms.component';
import { RoomDetailsComponent } from './room-details/room-details.component';
import { AllGamesComponent } from './all-games/all-games.component';
import { GameDetailsComponent } from './game-details/game-details.component';
import { AllRoutinesComponent } from './all-routines/all-routines.component';
import { RoutineDetailsComponent } from './routine-details/routine-details.component';
import { AllSyntaxesComponent } from './all-syntaxes/all-syntaxes.component';
import { SyntaxDetailsComponent } from './syntax-details/syntax-details.component';
import { ZilFormComponent } from './zil-form/zil-form.component';
import { ZilObjectComponent } from './zil-object/zil-object.component';
import { ZilArrayComponent } from './zil-array/zil-array.component';
import { RoomExitComponent } from './room-exit/room-exit.component';
import { LinkableZilAtomComponent } from './linkable-zil-atom/linkable-zil-atom.component';

const routes: Routes = [
  //{ path: 'home', component: HomeComponent },
  { path: 'games', component: AllGamesComponent },
  //{ path: 'games/:gameId', component: GameDetailsComponent },
  { path: 'games/:gameId/objects', component: AllObjectsComponent },
  { path: 'games/:gameId/objects/:id', component: ObjectDetailsComponent },
  { path: 'games/:gameId/rooms', component: AllRoomsComponent },
  { path: 'games/:gameId/rooms/:id', component: RoomDetailsComponent },
  { path: 'games/:gameId/syntaxes', component: AllSyntaxesComponent },
  { path: 'games/:gameId/syntaxes/:id', component: SyntaxDetailsComponent },
  { path: 'games/:gameId/routines', component: AllRoutinesComponent },
  { path: 'games/:gameId/routines/:id', component: RoutineDetailsComponent },
  //{ path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '', redirectTo: 'games', pathMatch: 'full' },
]

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ObjectDetailsComponent,
    AllObjectsComponent,
    AllRoomsComponent,
    RoomDetailsComponent,
    AllGamesComponent,
    GameDetailsComponent,
    AllRoutinesComponent,
    RoutineDetailsComponent,
    AllSyntaxesComponent,
    SyntaxDetailsComponent,
    ZilFormComponent,
    ZilObjectComponent,
    ZilArrayComponent,
    RoomExitComponent,
    LinkableZilAtomComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
