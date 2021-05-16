import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSyntaxesComponent } from './all-syntaxes.component';

describe('AllSyntaxesComponent', () => {
  let component: AllSyntaxesComponent;
  let fixture: ComponentFixture<AllSyntaxesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllSyntaxesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllSyntaxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
