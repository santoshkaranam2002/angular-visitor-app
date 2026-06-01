import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, ReplaySubject } from 'rxjs';
import { VisitorService } from 'src/app/services/visitor.service';

// ── Inline event bus ──
interface DeptChangeEvent {
  action: string;
  name: string;
}

export const deptChanged$ = new ReplaySubject<DeptChangeEvent>(1);

@Component({
  selector: 'app-admindashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admindashboard.component.html',
  styleUrl: './admindashboard.component.scss'
})
export class AdmindashboardComponent implements OnInit, OnDestroy {

  deptCount  = 0;
  rolesCount = 0;
  usersCount = 0;

  private deptSub!: Subscription;
  private staticCleared = false;

  activities: { icon: string; iconClass: string; title: string; desc: string; time: string }[] = [
    { icon: '●', iconClass: 'act-teal',   title: 'New user added',      desc: 'Assigned to department',    time: '2m ago'  },
    { icon: '◈', iconClass: 'act-purple', title: 'Role created',        desc: 'Permissions set in system', time: '18m ago' },
    { icon: '□', iconClass: 'act-orange', title: 'Department added',    desc: 'Registered in system',      time: '1h ago'  },
    { icon: '✏', iconClass: 'act-blue',   title: 'User updated',        desc: 'Details updated in system', time: '3h ago'  },
    { icon: '□', iconClass: 'act-orange', title: 'Department modified', desc: 'Narration field updated',   time: '5h ago'  },
  ];

  distribution = [
    { name: 'Maintenance',       sub: 'Dept · Code 001', value: 72, color: '#f97316' },
    { name: 'Sr. Manager',       sub: 'Top role count',  value: 60, color: '#8b5cf6' },
    { name: 'Active Users',      sub: 'Online sessions', value: 88, color: '#14b8a6' },
    { name: 'Proc. & Contracts', sub: 'Dept activity',   value: 45, color: '#3b82f6' },
    { name: 'Entry Coverage',    sub: 'Visitor system',  value: 95, color: '#f59e0b' },
  ];

  constructor(
    private router: Router,
    private visitorService: VisitorService
  ) {}

  ngOnInit(): void {
    this.loadAllCounts();
    this.listenToDeptChanges();
  }

  ngOnDestroy(): void {
    this.deptSub?.unsubscribe();
  }

  // ── Load all counts ──
  loadAllCounts(): void {
    const unitId = Number(localStorage.getItem('unitID') ?? 1);

    this.visitorService.getAllDepartments().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.response ?? []);
        this.deptCount = list.length;
      },
      error: () => { this.deptCount = 0; }
    });

    this.visitorService.getAllRoles().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.response ?? []);
        this.rolesCount = list.length;
      },
      error: () => { this.rolesCount = 0; }
    });

    this.visitorService.getAllUsers(unitId).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.response ?? []);
        this.usersCount = list.length;
      },
      error: () => { this.usersCount = 0; }
    });
  }

  // ── Listen to dept/user/role changes ──
  listenToDeptChanges(): void {
    this.deptSub = deptChanged$.subscribe((event: DeptChangeEvent) => {
      console.log('Dashboard received event:', event);

      const action = event.action;
      const name   = event.name;
      const unitId = Number(localStorage.getItem('unitID') ?? 1);

      // ── Refresh dept count ──
      if (action.toLowerCase().includes('department')) {
        this.visitorService.getAllDepartments().subscribe({
          next: (res: any) => {
            const list = Array.isArray(res) ? res : (res?.response ?? []);
            this.deptCount = list.length;
          },
          error: () => {}
        });
      }

      // ── Refresh users count ──
      if (action.toLowerCase().includes('user')) {
        this.visitorService.getAllUsers(unitId).subscribe({
          next: (res: any) => {
            const list = Array.isArray(res) ? res : (res?.response ?? []);
            this.usersCount = list.length;
          },
          error: () => {}
        });
      }

      // ── Refresh roles count ──
      if (action.toLowerCase().includes('role')) {
        this.visitorService.getAllRoles().subscribe({
          next: (res: any) => {
            const list = Array.isArray(res) ? res : (res?.response ?? []);
            this.rolesCount = list.length;
          },
          error: () => {}
        });
      }

      // ── Determine event type ──
      const isDelete  = action.toLowerCase().includes('deleted');
      const isUpdated = action.toLowerCase().includes('updated');
      const isUser    = action.toLowerCase().includes('user');
      const isRole    = action.toLowerCase().includes('role');
      const isDept    = action.toLowerCase().includes('department');

      // ── Build title & desc ──
      let title = '';
      let desc  = '';

      if (isDept) {
        if (isDelete) {
          title = `Department "${name}" deleted`;
          desc  = `"${name}" removed from system`;
        } else if (isUpdated) {
          title = `Department "${name}" modified`;
          desc  = `Details updated in system`;
        } else {
          title = `Department "${name}" added`;
          desc  = `Registered in system`;
        }
      } else if (isUser) {
        if (isDelete) {
          title = `User "${name}" deleted`;
          desc  = `"${name}" removed from system`;
        } else if (isUpdated) {
          title = `User ${name} updated`;
          desc  = `"${name}" details updated`;
        } else {
          title = `New user ${name} added`;
          desc  = `"${name}" added to system`;
        }
      } else if (isRole) {
        if (isDelete) {
          title = `Role "${name}" deleted`;
          desc  = `"${name}" removed from system`;
        } else if (isUpdated) {
          title = `Role "${name}" updated`;
          desc  = `Permissions updated in system`;
        } else {
          title = `Role "${name}" created`;
          desc  = `Permissions set in system`;
        }
      } else {
        title = action;
        desc  = `"${name}" updated in system`;
      }

      // ── Build icon & color ──
      const icon      = isDelete ? '🗑' : isUpdated ? '✏' : isUser ? '●' : isRole ? '◈' : '□';
      const iconClass = isDelete ? 'act-red' : isUpdated ? 'act-blue' : isUser ? 'act-teal' : isRole ? 'act-purple' : 'act-orange';

      // ── Clear static placeholders on first real event ──
      if (!this.staticCleared) {
        this.activities = [];
        this.staticCleared = true;
      }

      // ── Prepend to activity list ──
      this.activities.unshift({
        icon,
        iconClass,
        title,
        desc,
        time: 'Just now'
      });

      // ── Keep max 10 entries ──
      if (this.activities.length > 10) {
        this.activities = this.activities.slice(0, 10);
      }
    });
  }

  navigateTo(page: 'admin/departments' | 'admin/roles' | 'admin/users'): void {
    this.router.navigate([page]);
  }
}