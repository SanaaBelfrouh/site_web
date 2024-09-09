import { Component, OnInit, Inject, ElementRef, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-avatar-service',
  templateUrl: './avatar-service.component.html',
  styleUrls: ['./avatar-service.component.css']
})
export class AvatarServiceComponent implements OnInit {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private mixer!: THREE.AnimationMixer;
  private clock = new THREE.Clock();
  private currentModel: THREE.Group | undefined;
  private mediaRecorder!: MediaRecorder;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  public audioUrl?: string;
  public searchText: string = ''; // Add this line
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initScene();
      this.addLights();
      this.initRenderer();
      this.initControls();
      this.onWindowResize();
      window.addEventListener('resize', this.onWindowResize.bind(this));
      this.animate();
      this.loadModel('grogu');
    }
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 1.5, 1.7);
  }

  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xdddddd);
    const canvasContainer = this.elementRef.nativeElement.querySelector('#renderCanvasContainer');
    if (canvasContainer) {
      canvasContainer.appendChild(this.renderer.domElement);
    } else {
      console.error('Render canvas container not found');
    }
  }

  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.target.set(0, 1.5, 0);
  }

  private addLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
    this.scene.add(ambientLight);
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 2.0);
    hemisphereLight.position.set(0, 10, 0);
    this.scene.add(hemisphereLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.3);
    directionalLight.position.set(0, 1, 0);
    this.scene.add(directionalLight);
  }

  private loadModel(name: string): void {
    const loader = new GLTFLoader();
    loader.load(`/assets/glb/${name}.glb`,
      (gltf) => {
        this.removePreviousModel();
        this.currentModel = gltf.scene;
        this.scene.add(this.currentModel);
        this.mixer = new THREE.AnimationMixer(this.currentModel!);
        const animations = gltf.animations;
        if (animations && animations.length) {
          animations.forEach((clip) => {
            this.mixer!.clipAction(clip).play();
          });
        }
      },
      undefined,
      (error) => {
        console.error(`Error loading model ${name}:`, error);
      }
    );
  }

  private removePreviousModel(): void {
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
    }
  }

  private onWindowResize(): void {
    const canvasContainer = this.elementRef.nativeElement.querySelector('#renderCanvasContainer');
    if (canvasContainer) {
      this.camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    }
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    const delta = this.clock.getDelta();
    if (this.mixer) {
      this.mixer.update(delta);
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onSearch(event: Event): void {
    // Removed logic from here
  }

  performSearch(): void { // Add this method
    const phrase = this.searchText.trim();
    if (phrase) {
      this.http.post<{ gloss: string }>('http://localhost:8000/api/translate/', { text: phrase, type: 'text' })
        .subscribe(response => {
          const translatedWords = response.gloss.split(' ');
          this.loadModelsSequentially(translatedWords, 0);
        }, (error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            console.error('An error occurred:', error.error.message);
          } else {
            console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
          }
        });
    }
  }

  onAudioUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'audio');

      this.http.post<{ gloss: string }>('http://localhost:8000/api/translate/', formData)
        .subscribe(response => {
          const translatedWords = response.gloss.split(' ');
          this.loadModelsSequentially(translatedWords, 0);
        }, (error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            console.error('An error occurred:', error.error.message);
          } else {
            console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
          }
        });
    }
  }

  startRecording(): void {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
  
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        this.audioChunks.push(event.data);
      };
  
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioUrl = URL.createObjectURL(audioBlob);
  
        this.convertToWav(audioBlob).then((wavBlob) => {
          const formData = new FormData();
          formData.append('file', wavBlob, 'recording.wav');  // Ensure 'file' is the correct field name
          formData.append('type', 'audio');
    
          this.http.post<{ gloss: string }>('http://localhost:8000/api/translate/', formData)
            .subscribe(response => {
              const translatedWords = response.gloss.split(' ');
              this.loadModelsSequentially(translatedWords, 0);
            }, (error: HttpErrorResponse) => {
              console.error('Backend error:', error.message);
              if (error.error instanceof ErrorEvent) {
                console.error('Client-side error:', error.error.message);
              } else {
                console.error(`Backend returned code ${error.status}, body was:`, error.error);
              }
            });
        });
      };
  
      this.mediaRecorder.start();
      this.isRecording = true;
    }).catch(error => {
      console.error('Error accessing audio devices:', error);
    });
  }
  
  stopRecording(): void {
    if (this.isRecording && this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  private convertToWav(blob: Blob): Promise<Blob> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob);
      reader.onloadend = () => {
        const audioContext = new AudioContext();
        audioContext.decodeAudioData(reader.result as ArrayBuffer, (audioBuffer) => {
          const wavBlob = this.encodeWAV(audioBuffer);
          resolve(wavBlob);
        });
      };
    });
  }

  private encodeWAV(audioBuffer: AudioBuffer): Blob {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numberOfChannels * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let sample;
    let offset = 0;
    let pos = 44; // start of actual sound data

    // RIFF identifier
    this.writeString(view, offset, 'RIFF'); offset += 4;
    // file length minus RIFF identifier length and file description length
    view.setUint32(offset, 36 + audioBuffer.length * numberOfChannels * 2, true); offset += 4;
    // RIFF type
    this.writeString(view, offset, 'WAVE'); offset += 4;
    // format chunk identifier
    this.writeString(view, offset, 'fmt '); offset += 4;
    // format chunk length
    view.setUint32(offset, 16, true); offset += 4;
    // sample format (raw)
    view.setUint16(offset, 1, true); offset += 2;
    // channel count
    view.setUint16(offset, numberOfChannels, true); offset += 2;
    // sample rate
    view.setUint32(offset, audioBuffer.sampleRate, true); offset += 4;
    // byte rate (sample rate * block align)
    view.setUint32(offset, audioBuffer.sampleRate * 4, true); offset += 4;
    // block align (channel count * bytes per sample)
    view.setUint16(offset, numberOfChannels * 2, true); offset += 2;
    // bits per sample
    view.setUint16(offset, 16, true); offset += 2;
    // data chunk identifier
    this.writeString(view, offset, 'data'); offset += 4;
    // data chunk length
    view.setUint32(offset, audioBuffer.length * numberOfChannels * 2, true); offset += 4;

    // write interleaved data
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numberOfChannels; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  private loadModelsSequentially(words: string[], index: number): void {
    if (index < words.length) {
      const word = words[index];
      this.loadModel(word);
      setTimeout(() => {
        this.loadModelsSequentially(words, index + 1);
      }, 2900);
    } else {
      setTimeout(() => {
        this.loadModel('grogu');
      }, 200);
    }
  }
}
