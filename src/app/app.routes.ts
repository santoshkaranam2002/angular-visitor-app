import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AllvisitorsComponent } from './pages/allvisitors/allvisitors.component';
import { ApprovalsComponent } from './pages/approvals/approvals.component';
import { ActivevisitsComponent } from './pages/activevisits/activevisits.component';
import { HistoryComponent } from './pages/history/history.component';
import { ConfigurationComponent } from './pages/configuration/configuration.component';
import { DepratementdasboardComponent } from './dephead/depratementdasboard/depratementdasboard.component';
import { PendingApprovalsComponent } from './dephead/pending-approvals/pending-approvals.component';
import { TodayvisitorsComponent } from './dephead/todayvisitors/todayvisitors.component';
import { DepactivevisitorsComponent } from './dephead/depactivevisitors/depactivevisitors.component';
import { DepvisitorhistoryComponent } from './dephead/depvisitorhistory/depvisitorhistory.component';
import { DepreportsComponent } from './dephead/depreports/depreports.component';
import { DepstaffmanagementComponent } from './dephead/depstaffmanagement/depstaffmanagement.component';
import { AdmindashboardComponent } from './admins/admindashboard/admindashboard.component';
import { DepartmentsComponent } from './admins/departments/departments.component';
import { RolesComponent } from './admins/roles/roles.component';
import { UsersComponent } from './admins/users/users.component';
import { VisitorDetailsComponent } from './admins/visitor-details/visitor-details.component';




export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Security
  { path: 'security/dashboard', component: DashboardComponent },
  { path: 'allvisitors', component: AllvisitorsComponent },
  { path: 'approvals', component: ApprovalsComponent },
  { path: 'activevisits', component: ActivevisitsComponent },
  { path: 'configuration', component: ConfigurationComponent },
  { path: 'history', component: HistoryComponent },

  // Dept Head
  { path: 'dept-head/dashboard', component: DepratementdasboardComponent },
  { path: 'dept-head/pending-approvals', component: PendingApprovalsComponent },
  { path: 'dept-head/today-visitors', component: TodayvisitorsComponent },
  { path: 'dept-head/active-visitors', component: DepactivevisitorsComponent },
  { path: 'dept-head/visitor-history', component: DepvisitorhistoryComponent },
  { path: 'dept-head/reports', component: DepreportsComponent },
  { path: 'dept-head/staff-management', component: DepstaffmanagementComponent },

  // Admin
  { path: 'admin/dashboard', component: AdmindashboardComponent },
  { path: 'admin/departments', component: DepartmentsComponent },
  { path: 'admin/roles', component: RolesComponent },
  { path: 'admin/users', component: UsersComponent },
  { path: 'admin/visitor-details', component: VisitorDetailsComponent },

  // Wildcard
  { path: '**', redirectTo: 'security/dashboard' }
];
