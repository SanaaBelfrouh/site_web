import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent {
  showDomains = false;
  domains: any[] = [];  // Will be populated with data from the server
  selectedDomain: any;
  selectedName: any;
  definition: any;
  videoUrl: SafeResourceUrl | null = null;

  // Inject HttpClient and DomSanitizer into the component
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  // Lifecycle hook to fetch data when the component initializes
  ngOnInit() {
    this.fetchDomains();
  }

  // Method to fetch domains from the backend
  fetchDomains() {
    this.http.get<any[]>('http://localhost:3000/api/domains')
      .subscribe(data => {
        this.domains = data;
      }, error => {
        console.error('Error fetching domains:', error);
      });
  }
 
  toggleDomains() {
    this.showDomains = !this.showDomains;
    this.selectedDomain = null; // Reset selected domain when the list is hidden
  }


  selectDomain(domain: any) {
    this.selectedDomain = domain;
    this.selectedName = null; // Reset selected name when a new domain is selected
    this.videoUrl = null; // Reset video URL when a new domain is selected
 
  }

  selectName(name: any) {
    this.selectedName = name;
    this.showDomains = false; // Hide the lists when a name is selected
    this.definition = name.definition;
    if (name.type === 'drive_link') {
      // If the video is a Google Drive link, sanitize the link for safe usage
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(name.link);
    } else if (name.type === 'mp4') {
      // If the video is an mp4 file, construct the file URL
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`http://localhost:3000${name.file}`);
    }
  }
}
