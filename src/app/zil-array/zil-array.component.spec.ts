import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZilArrayComponent } from './zil-array.component';

describe('ZilArrayComponent', () => {
  let component: ZilArrayComponent;
  let fixture: ComponentFixture<ZilArrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZilArrayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZilArrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
