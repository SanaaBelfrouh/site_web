import { Component, OnDestroy } from '@angular/core';
import { UploadVideoServiceService } from './upload-video-service.service'; // Ensure the path is correct

@Component({
  selector: 'app-recorde-video',
  templateUrl: './recorde-video.component.html',
  styleUrls: ['./recorde-video.component.css'] // Corrected typo: styleUrls instead of styleUrl
})
export class RecordeVideoComponent implements OnDestroy {
  videoRef: any;
  recordedVideoRef: any;
  mediaStream: MediaStream | null = null;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  isCameraOn = false;
  isRecording = false;
  isBackToSelection = false;
  prediction: string | null = null; // Variable to store prediction

  constructor(private uploadService: UploadVideoServiceService) {}

  ngOnInit() {
    this.videoRef = document.getElementById('video');
    this.recordedVideoRef = document.getElementById('recorded-video');
  }

  setupCamera() {
    navigator.mediaDevices.getUserMedia({
      video: { width: 400, height: 300 },
      audio: false
    }).then((stream) => {
      this.mediaStream = stream;
      this.videoRef.srcObject = stream;
      this.isCameraOn = true;
    }).catch((error) => {
      console.error('Error accessing camera: ', error);
    });
  }

  backToSelection() {
    this.isBackToSelection = true;
    this.stopCamera();
  }

  startCamera() {
    if (!this.mediaStream) {
      this.setupCamera();
    }
  }

  stopCamera() {
    if (this.mediaStream) {
      const tracks = this.mediaStream.getTracks();
      tracks.forEach(track => track.stop());
      this.mediaStream = null;
      this.videoRef.srcObject = null;
      this.isCameraOn = false;
      this.isRecording = false;
    }
  }

  startRecording() {
    if (this.mediaStream && !this.isRecording) {
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        this.recordedVideoRef.src = url;
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      this.prediction = null; // Reset prediction when recording starts
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  uploadVideo() {
    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const videoFile = new File([blob], 'video.webm', { type: 'video/webm' });

    this.uploadService.uploadVideo(videoFile).subscribe(response => {
      console.log('Video uploaded successfully', response);
      this.prediction = response.prediction_text; // Assuming response has a prediction field
    }, error => {
      console.error('Error uploading video', error);
      this.prediction = 'Error uploading video';
    });
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}
