import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddVideoComponent } from './add-video/add-video.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard'; // Import your auth guard


const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin-dashboard', component: AddVideoComponent, canActivate: [AuthGuard] },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
