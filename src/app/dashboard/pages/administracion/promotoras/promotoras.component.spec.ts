import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotorasComponent } from './promotoras.component';

describe('PromotorasComponent', () => {
  let component: PromotorasComponent;
  let fixture: ComponentFixture<PromotorasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotorasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
