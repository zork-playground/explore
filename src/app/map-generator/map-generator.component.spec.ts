import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapGeneratorComponent } from './map-generator.component';

describe('MapGeneratorComponent', () => {
  let component: MapGeneratorComponent;
  let fixture: ComponentFixture<MapGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapGeneratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
