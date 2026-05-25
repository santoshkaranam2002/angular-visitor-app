import { Component, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() menuToggle = new EventEmitter<void>();

  hasNotifications = true;
  searchOpen = false;

  userDropdownOpen = signal(false);
  userInitials = 'JS';
  userName = 'John Security';
  userEmail = '@security1';
  dashboardTitle = 'Dashboard';
  dashboardSubtitle = 'Professional service management platform';

  ngOnInit(): void {

    const role = localStorage.getItem('userRole');

    if (role === 'security') {

      this.dashboardTitle = 'Security Dashboard';
      this.dashboardSubtitle = 'Security service management platform';
      this.userInitials = 'SC';
      this.userInitials = 'SC';
      this.userName = 'John Security';
      this.userEmail = '@security1';

    } 
    else if (role === 'dept_head') {

      this.dashboardTitle = 'Department Dashboard';
      this.dashboardSubtitle = 'Department management platform';
      this.userInitials = 'DH';
      this.userInitials = 'DH';
      this.userName = 'Dept Head';
      this.userEmail = '@depthead1';

    } 
    else if (role === 'admin') {

      this.dashboardTitle = 'Admin Dashboard';
      this.dashboardSubtitle = 'Administration management platform';
      this.userInitials = 'AD';
      this.userName = 'Admin User';
      this.userEmail = '@admin1';

    }
  }

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
  }



  toggleUserDropdown(): void {
    this.userDropdownOpen.update(v => !v);
  }

  closeUserDropdown(): void {
    this.userDropdownOpen.set(false);
  }

  logout(): void {
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  } 

}