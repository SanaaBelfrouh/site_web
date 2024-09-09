import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarServiceComponent } from './avatar-service.component';

describe('AvatarServiceComponent', () => {
  let component: AvatarServiceComponent;
  let fixture: ComponentFixture<AvatarServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AvatarServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvatarServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
