import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepvisitorhistoryComponent } from './depvisitorhistory.component';

describe('DepvisitorhistoryComponent', () => {
  let component: DepvisitorhistoryComponent;
  let fixture: ComponentFixture<DepvisitorhistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepvisitorhistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepvisitorhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
