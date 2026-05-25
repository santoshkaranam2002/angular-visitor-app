import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllvisitorsComponent } from './allvisitors.component';

describe('AllvisitorsComponent', () => {
  let component: AllvisitorsComponent;
  let fixture: ComponentFixture<AllvisitorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllvisitorsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllvisitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
