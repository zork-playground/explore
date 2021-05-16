import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkableZilAtomComponent } from './linkable-zil-atom.component';

describe('LinkableZilAtomComponent', () => {
  let component: LinkableZilAtomComponent;
  let fixture: ComponentFixture<LinkableZilAtomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkableZilAtomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkableZilAtomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
