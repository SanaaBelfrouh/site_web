import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-video',
  templateUrl: './add-video.component.html',
  styleUrls: ['./add-video.component.css']
})
export class AddVideoComponent implements OnInit {
  addVideoForm: FormGroup;
  videoType: string = 'drive_link'; // Default video type
  domains: any[] = []; // List of available domains
  creatingNewDomain: boolean = false;
  successMessage: boolean = false; // Variable to control the display of the success message

  constructor(private fb: FormBuilder, private http: HttpClient) {
    // Initialize the form with validation
    this.addVideoForm = this.fb.group({
      domainId: ['', Validators.required],
      newDomainName: [''], // Only required if creating a new domain
      name: ['', Validators.required],
      definition: ['', Validators.required],
      type: ['drive_link', Validators.required],
      link: [''],  // Only required if type is 'drive_link'
      file: [null]  // Only required if type is 'mp4'
    });

    // Watch for changes in the video type to update form validation
    this.addVideoForm.get('type')?.valueChanges.subscribe(type => {
      this.videoType = type;
      this.updateFormValidation();
    });
  }

  ngOnInit() {
    this.fetchDomains();
  }

  fetchDomains() {
    this.http.get<any[]>('http://localhost:3000/api/domains')
      .subscribe(data => {
        this.domains = data;
      }, error => {
        console.error('Error fetching domains:', error);
      });
  }

  updateFormValidation() {
    if (this.videoType === 'drive_link') {
      this.addVideoForm.get('link')?.setValidators(Validators.required);
      this.addVideoForm.get('file')?.clearValidators();
    } else if (this.videoType === 'mp4') {
      this.addVideoForm.get('file')?.setValidators(Validators.required);
      this.addVideoForm.get('link')?.clearValidators();
    }
    this.addVideoForm.get('link')?.updateValueAndValidity();
    this.addVideoForm.get('file')?.updateValueAndValidity();
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.addVideoForm.patchValue({
        file: file
      });
    }
  }

  toggleNewDomain() {
    this.creatingNewDomain = !this.creatingNewDomain;
    if (this.creatingNewDomain) {
      this.addVideoForm.get('domainId')?.clearValidators();
      this.addVideoForm.get('newDomainName')?.setValidators(Validators.required);
    } else {
      this.addVideoForm.get('domainId')?.setValidators(Validators.required);
      this.addVideoForm.get('newDomainName')?.clearValidators();
    }
    this.addVideoForm.get('domainId')?.updateValueAndValidity();
    this.addVideoForm.get('newDomainName')?.updateValueAndValidity();
  }

  submitForm() {
    const formData = new FormData();
    formData.append('name', this.addVideoForm.get('name')?.value);
    formData.append('definition', this.addVideoForm.get('definition')?.value);
    formData.append('type', this.addVideoForm.get('type')?.value);

    if (this.videoType === 'drive_link') {
      formData.append('link', this.addVideoForm.get('link')?.value);
    } else if (this.videoType === 'mp4') {
      formData.append('video', this.addVideoForm.get('file')?.value);
    }

    let apiUrl = 'http://localhost:3000/api/domains/';
    if (this.creatingNewDomain) {
      apiUrl += 'create';
      formData.append('domainName', this.addVideoForm.get('newDomainName')?.value);
    } else {
      apiUrl += `${this.addVideoForm.get('domainId')?.value}/videos`;
    }

    this.http.post(apiUrl, formData)
      .subscribe(response => {
        console.log('Video added successfully:', response);
        this.successMessage = true; // Show success message
        setTimeout(() => this.successMessage = false, 3000); // Hide message after 3 seconds
      }, error => {
        console.error('Error adding video:', error);
      });
  }
}
