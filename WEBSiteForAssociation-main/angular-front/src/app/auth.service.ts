// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private credentials = new BehaviorSubject<{ username: string, password: string } | null>(null);

  isLoggedIn$ = this.loggedIn.asObservable();
  credentials$ = this.credentials.asObservable();

  login(username: string, password: string): boolean {
    // Simple validation example (replace with real auth logic)
    if (username === 'admin' && password === 'admin') {
      this.loggedIn.next(true);
      this.credentials.next({ username, password });
      return true;
    } else {
      this.loggedIn.next(false);
      return false;
    }
  }

  logout() {
    this.loggedIn.next(false);
    this.credentials.next(null);
  }
}
