import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyntaxDetailsComponent } from './syntax-details.component';

describe('SyntaxDetailsComponent', () => {
  let component: SyntaxDetailsComponent;
  let fixture: ComponentFixture<SyntaxDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SyntaxDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SyntaxDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
