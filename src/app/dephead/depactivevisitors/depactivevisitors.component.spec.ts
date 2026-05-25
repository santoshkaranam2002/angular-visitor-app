import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepactivevisitorsComponent } from './depactivevisitors.component';

describe('DepactivevisitorsComponent', () => {
  let component: DepactivevisitorsComponent;
  let fixture: ComponentFixture<DepactivevisitorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepactivevisitorsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepactivevisitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
