import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayvisitorsComponent } from './todayvisitors.component';

describe('TodayvisitorsComponent', () => {
  let component: TodayvisitorsComponent;
  let fixture: ComponentFixture<TodayvisitorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayvisitorsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodayvisitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
