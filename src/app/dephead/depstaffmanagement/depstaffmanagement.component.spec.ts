import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepstaffmanagementComponent } from './depstaffmanagement.component';

describe('DepstaffmanagementComponent', () => {
  let component: DepstaffmanagementComponent;
  let fixture: ComponentFixture<DepstaffmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepstaffmanagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepstaffmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
