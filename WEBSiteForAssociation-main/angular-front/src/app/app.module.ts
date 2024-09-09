import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Add this line
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule, Routes, Scroll } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from './footer/footer.component';
import { VideosComponent } from './videos/videos.component';
import { SafeUrlPipe } from './videos/safe-url.pipe';
import { AddVideoComponent } from './add-video/add-video.component';
import { LoginComponent } from './login/login.component';
import { AvatarServiceComponent } from './avatar-service/avatar-service.component';
import { TranslationVideoComponent } from './translation-video/translation-video.component';
import { UploadVideoComponent } from './upload-video/upload-video.component';
import { RecordeVideoComponent } from './recorde-video/recorde-video.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  {path : '', component : NavbarComponent},
  // Define more routes as needed
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    VideosComponent,
    SafeUrlPipe,
    AddVideoComponent,
    LoginComponent,
    AvatarServiceComponent,
    TranslationVideoComponent,
    UploadVideoComponent,
    RecordeVideoComponent,
    AboutComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule, // Add this line
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled', // Enable scrolling restoration
      anchorScrolling: 'enabled', // Enable anchor scrolling
      scrollOffset: [0, 64], // Adjust scroll offset as needed
    })],
    exports: [RouterModule],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
