import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivevisitsComponent } from './activevisits.component';

describe('ActivevisitsComponent', () => {
  let component: ActivevisitsComponent;
  let fixture: ComponentFixture<ActivevisitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivevisitsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivevisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
