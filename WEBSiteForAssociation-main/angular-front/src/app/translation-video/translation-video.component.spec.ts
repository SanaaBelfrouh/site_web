import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslationVideoComponent } from './translation-video.component';

describe('TranslationVideoComponent', () => {
  let component: TranslationVideoComponent;
  let fixture: ComponentFixture<TranslationVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TranslationVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranslationVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
