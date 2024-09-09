import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-translation-video',
  templateUrl: './translation-video.component.html',
  styleUrls: ['./translation-video.component.css']
})
export class TranslationVideoComponent {
  isUpload = false;
  isRecord = false;
  isSelect = true;
  showList = false;
  stringList: string[] = [
    'agrandir', 'clavier', 'disque_dur', 'ecran', 'imprimante', 'ordinateur', 'ouvrir', 'reduire', 'souris', 'stop'
  ];

  constructor(private router: Router) { }

  recordPressed() {
    this.isRecord = true;
    this.isSelect = false;
    this.isUpload = false;
  }

  uploadPressed() {
    this.isRecord = false;
    this.isSelect = false;
    this.isUpload = true;
  }

  selectPressed() {
    this.isRecord = false;
    this.isSelect = true;
    this.isUpload = false;
  }

  toggleList() {
    this.showList = !this.showList;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const listButton = document.querySelector('.btn-secondary');
    const listContainer = document.querySelector('.list-container');

    if (listButton && !listButton.contains(target) && listContainer && !listContainer.contains(target)) {
      this.showList = false;
    }
  }
}
