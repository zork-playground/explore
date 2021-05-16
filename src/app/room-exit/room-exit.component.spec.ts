import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomExitComponent } from './room-exit.component';

describe('RoomExitComponent', () => {
  let component: RoomExitComponent;
  let fixture: ComponentFixture<RoomExitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomExitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomExitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
