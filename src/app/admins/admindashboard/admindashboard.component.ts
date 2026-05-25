import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admindashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admindashboard.component.html',
  styleUrl: './admindashboard.component.scss'
})
export class AdmindashboardComponent implements OnInit {


  
  // ── Stat counters (animated in ngOnInit) ──
  deptCount  = 0;
  rolesCount = 0;
  usersCount = 0;

  // ── Departments preview list ──
  departments = [
    { num: 1, name: 'Maintenance',    code: '001' },
    { num: 2, name: 'Mechanical',     code: '002' },
    { num: 3, name: 'C&I',            code: '003' },
    { num: 4, name: 'AHP',            code: '004' },
    { num: 5, name: 'Coal Logistics', code: '005' },
  ];

  // ── Roles preview list ──
  roles = [
    { num: 1, name: 'Admin',                 sub: 'Full access' },
    { num: 2, name: 'Sr. Vice President',    sub: 'Executive' },
    { num: 3, name: 'Chief Security Officer',sub: 'Security' },
    { num: 4, name: 'Manager',               sub: 'Management' },
    { num: 5, name: 'Finance Controller',    sub: 'Finance' },
  ];

  // ── Users preview list ──
  users = [
    { initials: 'PA', name: 'P. Ashok',              role: 'Engg.',            dept: 'Commercial', avatarClass: 'ua1' },
    { initials: 'GL', name: 'Ms. S. Gruha',          role: 'Asst. Manager',    dept: 'Contracts',  avatarClass: 'ua2' },
    { initials: 'LR', name: 'Mr. Lokireddy',         role: 'Asst. Officer',    dept: 'Contracts',  avatarClass: 'ua3' },
    { initials: 'GP', name: 'P.S.S.G.S. Gopalakrishna', role: 'Sr. Manager',  dept: 'C&I',        avatarClass: 'ua4' },
    { initials: 'PC', name: 'P. N. Chakravarthi',    role: 'Sr. Manager',      dept: 'Mechanical', avatarClass: 'ua5' },
  ];

  // ── Recent activity feed ──
  activities = [
    { icon: '●', iconClass: 'act-teal',   title: 'New user ASHOKREDDY added',         desc: 'Assigned to Commercial & DMS as Engg.', time: '2m ago'  },
    { icon: '◈', iconClass: 'act-purple', title: 'Role "Finance Controller" created',  desc: 'Permissions set for Finance module',    time: '18m ago' },
    { icon: '□', iconClass: 'act-orange', title: 'Department "Coal Logistics" added',  desc: 'Code 005 registered in system',         time: '1h ago'  },
    { icon: '✏', iconClass: 'act-blue',   title: 'User GOPALAKRISHNA updated',         desc: 'Department changed to C&I',             time: '3h ago'  },
    { icon: '□', iconClass: 'act-orange', title: 'Department "AHP" modified',          desc: 'Narration field updated',               time: '5h ago'  },
  ];

  // ── Distribution bar stats ──
  distribution = [
    { name: 'Maintenance',      sub: 'Dept · Code 001',  value: 72, color: '#f97316' },
    { name: 'Sr. Manager',      sub: 'Top role count',   value: 60, color: '#8b5cf6' },
    { name: 'Active Users',     sub: 'Online sessions',  value: 88, color: '#14b8a6' },
    { name: 'Proc. & Contracts',sub: 'Dept activity',    value: 45, color: '#3b82f6' },
    { name: 'Entry Coverage',   sub: 'Visitor system',   value: 95, color: '#f59e0b' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Animate counters after a short delay
    setTimeout(() => {
      this.animateCounter('dept',  10);
      this.animateCounter('roles', 10);
      this.animateCounter('users', 10);
    }, 300);
  }

  /**
   * Animate a numeric counter from 0 to target.
   * @param type  - 'dept' | 'roles' | 'users'
   * @param target - final number
   */
  private animateCounter(type: 'dept' | 'roles' | 'users', target: number): void {
    let current = 0;
    const step     = Math.ceil(target / 20);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      if (type === 'dept')  this.deptCount  = current;
      if (type === 'roles') this.rolesCount = current;
      if (type === 'users') this.usersCount = current;
      if (current >= target) clearInterval(interval);
    }, 40);
  }

  /**
   * Navigate to a sub-page route.
   * Adjust the route paths to match your app's routing configuration.
   */
  navigateTo(page: 'admin/departments' | 'admin/roles' | 'admin/users'): void {
    this.router.navigate([page]);
  }


}
