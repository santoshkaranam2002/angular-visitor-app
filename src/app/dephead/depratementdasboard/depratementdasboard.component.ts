import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface PendingApproval {
  id: string;
  name: string;
  company: string;
  purpose: string;
  date: string;
  time: string;
}

@Component({
  selector: 'app-depratementdasboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './depratementdasboard.component.html',
  styleUrl: './depratementdasboard.component.scss'
})
export class DepratementdasboardComponent implements OnInit {

  userName = signal('');

  stats = signal({ pending: 1, active: 1, today: 1, staff: 0 });
  weeklySummary = signal({ approved: 1, rejected: 0, completedVisits: 1 });
  responseTime = signal({ minutes: 15, fasterPercent: 20 });
  pendingApprovals = signal<PendingApproval[]>([
    {
      id: 'A45', name: 'Amit Patel', company: 'Cloud Services Ltd',
      purpose: 'Technical Support - Server Maintenance', date: 'May 15', time: '12:33'
    }
  ]);

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Read logged-in user's name from localStorage
    const storedName = localStorage.getItem('userName') ?? '';
    this.userName.set(storedName || 'User');
  }

  viewAll()       { this.router.navigateByUrl('/user/pending-approvals'); }
  manageTeam()    { this.router.navigateByUrl('/user/staff-management'); }
  requiresAction(){ this.router.navigateByUrl('/user/pending-approvals'); }
}