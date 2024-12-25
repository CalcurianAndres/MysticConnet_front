import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPlanificacionComponent } from './new-planificacion.component';

describe('NewPlanificacionComponent', () => {
  let component: NewPlanificacionComponent;
  let fixture: ComponentFixture<NewPlanificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPlanificacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPlanificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
