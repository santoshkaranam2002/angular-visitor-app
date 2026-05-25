import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepreportsComponent } from './depreports.component';

describe('DepreportsComponent', () => {
  let component: DepreportsComponent;
  let fixture: ComponentFixture<DepreportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepreportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
