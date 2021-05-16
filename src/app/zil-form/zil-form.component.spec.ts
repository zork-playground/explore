import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZilFormComponent } from './zil-form.component';

describe('ZilFormComponent', () => {
  let component: ZilFormComponent;
  let fixture: ComponentFixture<ZilFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZilFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZilFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
