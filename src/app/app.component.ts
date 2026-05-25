import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './components/header/header.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HeaderComponent,
    SidenavComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  sidebarOpen = signal(false);
  isAuthPage = signal(false);

  userRole: string = 'security';

  constructor(private router: Router) {}

  ngOnInit(): void {

    this.router.events.subscribe(() => {

      const url = this.router.url;

      // Hide header/sidenav on login/register pages
      this.isAuthPage.set(
        url.includes('login') || url.includes('register')
      );

      // Read role from localStorage
      this.userRole = localStorage.getItem('userRole') || 'security';
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}