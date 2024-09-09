// navbar.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuOpen = false;
  loginMode = false;
  isLoggedIn = false;

  

  constructor(public authService: AuthService) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(loginClicked: boolean = false) {
    this.menuOpen = false;
    if (loginClicked) {
      this.toggleLogin();
    }
  }

  toggleLogin() {
    this.loginMode = !this.loginMode;
  }
  showVideos() {
    this.loginMode = false;  // Ensure login mode is off
    this.scrollToSection('videos');  // Optionally scroll to videos section
  }

  scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }
}
