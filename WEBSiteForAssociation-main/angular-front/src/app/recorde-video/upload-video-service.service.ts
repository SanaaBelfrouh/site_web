import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadVideoServiceService {
  private uploadUrl = 'http://localhost:3000/upload_video';

  constructor(private http: HttpClient) { }

  uploadVideo(videoFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('video_file', videoFile);

    return this.http.post<any>(this.uploadUrl, formData);
  }
}
