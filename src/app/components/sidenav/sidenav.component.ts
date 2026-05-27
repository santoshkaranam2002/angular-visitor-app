import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  section?: string;
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Input() open = false;
  @Output() closeRequest = new EventEmitter<void>();

  userRole: string = '';
  navItems: NavItem[] = [];

  ngOnInit(): void {
    // New login stores 'roleName' = "Admin" / "Security" / "User"
    // Old login stored 'userRole' = "admin" / "security" / "dept_head"
    // Read both and normalise to lowercase
    const roleName = localStorage.getItem('roleName') || '';
    const userRole = localStorage.getItem('userRole') || '';

    const raw = (roleName || userRole).toLowerCase().trim();

    if (raw === 'admin') {
      this.userRole = 'admin';
    } else if (raw === 'security') {
      this.userRole = 'security';
    } else if (raw === 'dept_head' || raw === 'user' || raw === 'depthead') {
      this.userRole = 'dept_head';
    } else {
      this.userRole = 'admin'; // fallback
    }

    this.setMenuByRole();
  }

  setMenuByRole(): void {

    if (this.userRole === 'security') {
      this.navItems = [
        { label: 'Overview',      route: '/security/dashboard', icon: 'overview',  section: 'NAVIGATION' },
        // { label: 'All Visitors',  route: '/allvisitors',        icon: 'visitors' },
        { label: 'Approvals',     route: '/approvals',          icon: 'approvals' },
        { label: 'Active Visits', route: '/activevisits',       icon: 'active' },
        { label: 'History',       route: '/history',            icon: 'history' },
      ];
    }

    else if (this.userRole === 'dept_head') {
      this.navItems = [
        { label: 'Overview',           route: '/dept-head/dashboard',         icon: 'overview',   section: 'NAVIGATION' },
        { label: 'Pending Approvals',  route: '/dept-head/pending-approvals', icon: 'approvals' },
        { label: "Today's Visitors",   route: '/dept-head/today-visitors',    icon: 'calendar' },
        { label: 'Active Visitors',    route: '/dept-head/active-visitors',   icon: 'active' },
        { label: 'Visit History',      route: '/dept-head/visitor-history',   icon: 'history' },
        { label: 'Reports',            route: '/dept-head/reports',           icon: 'reports' },
      ];
    }

    else if (this.userRole === 'admin') {
      this.navItems = [
        { label: 'Admin Dashboard',  route: '/admin/dashboard',       icon: 'overview',   section: 'NAVIGATION' },
        { label: 'Departements',     route: '/admin/departments',     icon: 'visitors' },
        { label: 'Roles',            route: '/admin/roles',           icon: 'approvals' },
        { label: 'Users',            route: '/admin/users',           icon: 'active' },
        { label: 'Visitor Details',  route: '/admin/visitor-details', icon: 'history' },
      ];
    }
  }

  onNavClick(): void {
    if (window.innerWidth <= 768) {
      this.closeRequest.emit();
    }
  }

  private isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  getIcon(icon: string): string {
    switch (icon) {
      case 'overview':   return 'grid_view';
      case 'approvals':  return 'assignment';
      case 'calendar':   return 'calendar_today';
      case 'active':     return 'groups';
      case 'history':    return 'history';
      case 'reports':    return 'bar_chart';
      case 'staff':      return 'manage_accounts';
      case 'config':     return 'settings';
      default:           return 'circle';
    }
  }
}