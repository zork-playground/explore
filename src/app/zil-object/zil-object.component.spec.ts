import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZilObjectComponent } from './zil-object.component';

describe('ZilObjectComponent', () => {
  let component: ZilObjectComponent;
  let fixture: ComponentFixture<ZilObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZilObjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZilObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
