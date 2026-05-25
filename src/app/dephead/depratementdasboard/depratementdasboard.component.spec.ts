import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepratementdasboardComponent } from './depratementdasboard.component';

describe('DepratementdasboardComponent', () => {
  let component: DepratementdasboardComponent;
  let fixture: ComponentFixture<DepratementdasboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepratementdasboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepratementdasboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
