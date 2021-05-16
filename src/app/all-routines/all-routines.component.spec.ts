import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllRoutinesComponent } from './all-routines.component';

describe('AllRoutinesComponent', () => {
  let component: AllRoutinesComponent;
  let fixture: ComponentFixture<AllRoutinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllRoutinesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllRoutinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
