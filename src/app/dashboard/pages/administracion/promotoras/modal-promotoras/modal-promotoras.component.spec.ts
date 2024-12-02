import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPromotorasComponent } from './modal-promotoras.component';

describe('ModalPromotorasComponent', () => {
  let component: ModalPromotorasComponent;
  let fixture: ComponentFixture<ModalPromotorasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalPromotorasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPromotorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
