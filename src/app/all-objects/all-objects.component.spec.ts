import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllObjectsComponent } from './all-objects.component';

describe('AllObjectsComponent', () => {
  let component: AllObjectsComponent;
  let fixture: ComponentFixture<AllObjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllObjectsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllObjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
