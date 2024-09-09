import { Component } from '@angular/core';
import { UploadVideoServiceService } from './upload-video-service.service';

@Component({
  selector: 'app-upload-video',
  templateUrl: './upload-video.component.html',
  styleUrls: ['./upload-video.component.css']
})
export class UploadVideoComponent {
  title = 'To translate your sign please upload a video (.mp4)';
  predictionText: string = '';
  selectedFile: File | null = null;
  videoUrl: string | null = null; // Track the video URL for preview

  constructor(private uploadVideoService: UploadVideoServiceService) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
    if (this.selectedFile) {
      this.videoUrl = URL.createObjectURL(this.selectedFile); // Create URL for video preview
      this.predictionText = ''; // Clear prediction text when a new file is selected
    }
  }

  onPredictClicked(): void {
    if (this.selectedFile) {
      this.uploadVideoService.uploadVideo(this.selectedFile).subscribe(
        (response: any) => {
          if (response.status === 'progress') {
            console.log(`Upload progress: ${response.message}%`);
          } else {
            this.predictionText = response.prediction_text;
          }
        },
        (error) => {
          console.error('Upload error:', error);
          this.predictionText = 'An error occurred while processing the video.';
        }
        // Comment out or remove the following two lines to keep the video preview
        /*
        () => {
          this.selectedFile = null; // Clear selected file after processing
          this.videoUrl = null; // Clear video URL after processing
        }
        */
      );
    } else {
      this.predictionText = 'Please select a video file before predicting.';
    }
  }
}
