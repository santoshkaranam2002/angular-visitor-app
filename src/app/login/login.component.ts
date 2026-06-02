import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from '../services/visitor.service';

interface Role {
  roleID: number;
  roleName: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  username        = '';
  password        = '';
  showPassword    = false;
  selectedRoleID: number | null = null;
  roles: Role[]   = [];
  rolesLoading    = false;
  isLoading       = false;
  errorMessage    = '';
  usernameError   = false;
  passwordError   = false;
  roleError       = false;

  constructor(private router: Router, private visitorService: VisitorService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.rolesLoading = true;
    this.visitorService.getAllRoles().subscribe({
      next: (data: any) => {
        this.roles = Array.isArray(data) ? data : (data?.response ?? []);
        this.rolesLoading = false;
      },
      error: () => {
        this.rolesLoading = false;
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  clearError(): void {
    this.errorMessage = '';
    this.usernameError = false;
    this.passwordError = false;
    this.roleError = false;
  }

  onSubmit(): void {
    this.clearError();

    if (this.selectedRoleID === null) {
      this.roleError = true;
      this.errorMessage = 'Please select a role.';
      return;
    }

    if (!this.username.trim()) {
      this.usernameError = true;
      this.errorMessage = 'Please enter your username.';
      return;
    }

    if (!this.password.trim()) {
      this.passwordError = true;
      this.errorMessage = 'Please enter your password.';
      return;
    }

    this.isLoading = true;

    this.visitorService
      .validateUserByRole(this.selectedRoleID, this.username.trim(), this.password.trim())
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;

          const users = Array.isArray(response)
            ? response
            : (response?.response ?? []);

          if (users && users.length > 0) {
            const user = users[0];

            localStorage.setItem('userID',   String(user.userID   ?? ''));
            localStorage.setItem('unitID',   String(user.unitID   ?? ''));
            localStorage.setItem('deptID',   String(user.deptID   ?? ''));
            localStorage.setItem('roleID',   String(user.roleID   ?? ''));
            localStorage.setItem('userName', user.userName         ?? '');
            localStorage.setItem('roleName', user.roleName         ?? '');
            localStorage.setItem('unitName', user.unitName         ?? '');
            localStorage.setItem('email',    user.email            ?? '');

            const role = (user.roleName ?? '').toLowerCase().trim();

            if (role === 'admin') {
              this.router.navigateByUrl('/admin/dashboard');
            } else if (role === 'security') {
              this.router.navigateByUrl('/security/dashboard');
            } else {
              this.router.navigateByUrl('/user/dashboard');
            }

          } else {
            this.usernameError = true;
            this.passwordError = true;
            this.errorMessage  = 'Invalid credentials. Please try again.';
          }
        },
        error: () => {
          this.isLoading    = false;
          this.errorMessage = 'Unable to connect to server. Please try again.';
        }
      });
  }
}