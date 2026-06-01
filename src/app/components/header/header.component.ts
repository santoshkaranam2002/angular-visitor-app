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
  const roleName = localStorage.getItem('roleName') ?? '';
  const userName = localStorage.getItem('userName') ?? '';

  // Set initials from stored userName
  const parts = userName.trim().split(' ');
  this.userInitials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : userName.substring(0, 2).toUpperCase();

  // Set display name and email
  this.userName  = userName;
  this.userEmail = '@' + userName.toLowerCase().replace(/\s+/g, '');

  // Set dashboard title by role
  const role = roleName.toLowerCase().trim();

  if (role === 'security') {
    this.dashboardTitle = 'Security Dashboard';
  } else if (role === 'admin') {
    this.dashboardTitle = 'Admin Dashboard';
  } else {
    this.dashboardTitle = 'Department Dashboard';
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
    localStorage.removeItem('');
    window.location.href = '/login';
  } 

}