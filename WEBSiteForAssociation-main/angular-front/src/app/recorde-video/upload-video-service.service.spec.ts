import { TestBed } from '@angular/core/testing';

import { UploadVideoServiceService } from './upload-video-service.service';

describe('UploadVideoServiceService', () => {
  let service: UploadVideoServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadVideoServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
