import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordeVideoComponent } from './recorde-video.component';

describe('RecordeVideoComponent', () => {
  let component: RecordeVideoComponent;
  let fixture: ComponentFixture<RecordeVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecordeVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordeVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
