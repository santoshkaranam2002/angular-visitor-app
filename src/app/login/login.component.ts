import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from '../services/visitor.service';

interface DemoRole {
  label: string;
  username: string;
  password: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  username     = '';
  password     = '';
  showPassword = false;
  selectedUnit: number | null = null;
  loginType: 'admin' | 'security' | 'user' = 'admin';
  units: any[]  = [];
  unitsLoading  = false;
  isLoading     = false;
  errorMessage  = '';
  usernameError = false;
  passwordError = false;
  unitError     = false;
  activeQuickRole: string | null = null;

  demoRoles: DemoRole[] = [
    { label: 'Security', username: 'SEC_ALPHA',  password: 'hash_alpha',  icon: 'security', color: '#6366f1' },
    { label: 'User',     username: 'depthead1',  password: 'dept123',     icon: 'dept',     color: '#7c3aed' },
    { label: 'Admin',    username: 'ADMIN',       password: 'SANTOSH@123', icon: 'admin',    color: '#dc2626' },
  ];

  constructor(private router: Router, private visitorService: VisitorService) {}

  ngOnInit(): void {
   
  }

  get showUnitSelect(): boolean {
    return this.loginType === 'admin' || this.loginType === 'user';
  }



  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(): void {
    this.errorMessage  = '';
    this.usernameError = false;
    this.passwordError = false;
    this.unitError     = false;
  }

  quickLogin(role: DemoRole): void {
    this.username        = role.username;
    this.password        = role.password;
    this.activeQuickRole = role.label;

    if (role.label === 'Security') {
      this.loginType = 'security';
    } else if (role.label === 'Admin') {
      this.loginType = 'admin';
    } else {
      this.loginType = 'user';
    }
  }

  onSubmit(): void {
    this.clearError();

    if (!this.username.trim()) {
      this.usernameError = true;
      this.errorMessage  = 'Please enter your username.';
      return;
    }

    if (!this.password.trim()) {
      this.passwordError = true;
      this.errorMessage  = 'Please enter your password.';
      return;
    }

    if (this.loginType === 'security') {
      this.securityLogin();
    } else {
      this.adminLogin();
    }
  }

  securityLogin(): void {
    this.isLoading = true;

    this.visitorService
      .validateSecurity(this.username.trim(), this.password.trim())
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;

          const users = Array.isArray(response)
            ? response
            : (response?.response ?? []);

          if (users && users.length > 0) {
            const user = users[0];

            localStorage.setItem('userID',   String(user.userID   ?? ''));
            localStorage.setItem('userID',   String(user.userID   ?? ''));
            localStorage.setItem('unitID',   String(user.unitID   ?? ''));  
            localStorage.setItem('userName', user.userName         ?? '');
            localStorage.setItem('roleName', 'Security');
            localStorage.setItem('unitName', user.unitName         ?? '');

            this.router.navigateByUrl('/security/dashboard');

          } else {
            this.usernameError = true;
            this.passwordError = true;
            this.errorMessage  = 'Invalid security credentials. Please try again.';
          }
        },
        error: () => {
          this.isLoading    = false;
          this.errorMessage = 'Unable to connect to server. Please try again.';
        }
      });
  }

  adminLogin(): void {
    this.isLoading = true;

    this.visitorService
      .validateUser(this.username.trim(), this.password.trim())
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;

          const users = Array.isArray(response)
            ? response
            : (response?.response ?? []);

          if (users && users.length > 0) {
            const user = users[0];

            localStorage.setItem('userID',   String(user.userID));
            localStorage.setItem('unitID',   String(user.unitID));
            localStorage.setItem('deptID',   String(user.deptID));
            localStorage.setItem('roleID',   String(user.roleID));
            localStorage.setItem('userName', user.userName ?? '');
            localStorage.setItem('roleName', user.roleName ?? '');
            localStorage.setItem('unitName', user.unitName ?? '');
            localStorage.setItem('email',    user.email    ?? '');

            const role = (user.roleName ?? '').toLowerCase().trim();
            if (role === 'admin') {
              this.router.navigateByUrl('/admin/dashboard');
            } else {
              this.router.navigateByUrl('/dept-head/dashboard');
            }

          } else {
            this.usernameError = true;
            this.passwordError = true;
            this.errorMessage  = 'Invalid username or password. Please try again.';
          }
        },
        error: () => {
          this.isLoading    = false;
          this.errorMessage = 'Unable to connect to server. Please try again.';
        }
      });
  }
}