import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZilAtomMiniCardComponent } from './zil-atom-mini-card.component';

describe('ZilAtomMiniCardComponent', () => {
  let component: ZilAtomMiniCardComponent;
  let fixture: ComponentFixture<ZilAtomMiniCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZilAtomMiniCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZilAtomMiniCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
