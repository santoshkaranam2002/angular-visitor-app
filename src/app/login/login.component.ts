import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DemoRole {
  label: string;
  username: string;
  password: string;
  icon: string;
  color: string;
}

// Demo user credentials — replace with your auth service
const DEMO_USERS: { [key: string]: { password: string; role: string } } = {
  security1: { password: 'security123', role: 'security' },
  depthead1: { password: 'dept123',     role: 'dept_head' },
  admin1:    { password: 'admin123',    role: 'admin' },
};

@Component({
  selector: 'app-login',
  standalone: true,
     imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {


    // Form fields
  username    = '';
  password    = '';
  showPassword = false;

  // UI state
  isLoading      = false;
  errorMessage   = '';
  usernameError  = false;
  passwordError  = false;
  activeQuickRole: string | null = null;

  // Demo role quick-login definitions
  demoRoles: DemoRole[] = [
    {
      label:    'Security',
      username: 'security1',
      password: 'security123',
      icon:     'security',
      color:    '#6366f1',
    },
    {
      label:    'User',
      username: 'depthead1',
      password: 'dept123',
      icon:     'dept',
      color:    '#7c3aed',
    },
    {
      label:    'Admin',
      username: 'admin1',
      password: 'admin123',
      icon:     'admin',
      color:    '#dc2626',
    },
  ];

  constructor(private router: Router) {}
  
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(): void {
    this.errorMessage  = '';
    this.usernameError = false;
    this.passwordError = false;
  }

quickLogin(role: DemoRole): void {

  this.username = role.username;
  this.password = role.password;

  this.activeQuickRole = role.label;

  const user = DEMO_USERS[role.username];

  if (user) {

    localStorage.setItem('userRole', user.role);

    this.navigateByRole(user.role);
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

    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      const user = DEMO_USERS[this.username.trim()];

      if (user && user.password === this.password.trim()) {

        localStorage.setItem('userRole', user.role);

        this.navigateByRole(user.role);
      }
       else {
        this.usernameError = true;
        this.passwordError = true;
        this.errorMessage  = 'Invalid username or password. Please try again.';
      }
    }, 1000);
  }

  private navigateByRole(role: string): void {

  if (role === 'security') {
    this.router.navigateByUrl('/security/dashboard');
  }
  else if (role === 'dept_head') {
    this.router.navigateByUrl('/dept-head/dashboard');
  }
  else if (role === 'admin') {
    this.router.navigateByUrl('/admin/dashboard');
  }
  else {
    this.router.navigateByUrl('/login');
  }
}

}
