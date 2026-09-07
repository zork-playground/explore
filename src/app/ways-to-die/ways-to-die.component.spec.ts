import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaysToDieComponent } from './ways-to-die.component';

describe('WaysToDieComponent', () => {
  let component: WaysToDieComponent;
  let fixture: ComponentFixture<WaysToDieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaysToDieComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaysToDieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
