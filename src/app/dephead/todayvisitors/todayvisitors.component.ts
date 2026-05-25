import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type VisitStatus = 'Awaiting Entry' | 'In Progress' | 'Completed' | 'Cancelled';

export interface TodayVisitor {
  id: string;
  name: string;
  company: string;
  purpose: string;
  inTime: string;
  outTime: string | null;
  approvalStatus: ApprovalStatus;
  visitStatus: VisitStatus;
  teams: number;
  devices: number;
}

@Component({
  selector: 'app-todayvisitors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todayvisitors.component.html',
  styleUrl: './todayvisitors.component.scss'
})
export class TodayvisitorsComponent {

  showDetailModal = signal(false);
  selectedVisitor = signal<TodayVisitor | null>(null);

  visitors = signal<TodayVisitor[]>([
    {
      id: 'V001',
      name: 'Amit Patel',
      company: 'Cloud Services Ltd',
      purpose: 'Technical Support - Server Migration',
      inTime: '12:33',
      outTime: null,
      approvalStatus: 'Pending',
      visitStatus: 'Awaiting Entry',
      teams: 1,
      devices: 1
    },
    {
      id: 'V002',
      name: 'Priya Sharma',
      company: 'Infosys Ltd',
      purpose: 'Business Meeting - Q4 Planning',
      inTime: '10:00',
      outTime: '11:30',
      approvalStatus: 'Approved',
      visitStatus: 'Completed',
      teams: 2,
      devices: 1
    },
    {
      id: 'V003',
      name: 'Arjun Mehta',
      company: 'Global Ventures',
      purpose: 'Interview - Senior Developer',
      inTime: '14:00',
      outTime: null,
      approvalStatus: 'Approved',
      visitStatus: 'In Progress',
      teams: 1,
      devices: 2
    }
  ]);

  totalRequests = computed(() => this.visitors().length);

  viewVisitor(v: TodayVisitor) {
    this.selectedVisitor.set(v);
    this.showDetailModal.set(true);
  }

  closeModal() {
    this.showDetailModal.set(false);
    this.selectedVisitor.set(null);
  }

  getApprovalClass(status: ApprovalStatus): string {
    const map: Record<ApprovalStatus, string> = {
      Pending:  'badge--pending',
      Approved: 'badge--approved',
      Rejected: 'badge--rejected'
    };
    return map[status];
  }

  getVisitClass(status: VisitStatus): string {
    const map: Record<VisitStatus, string> = {
      'Awaiting Entry': 'vbadge--awaiting',
      'In Progress':    'vbadge--inprogress',
      'Completed':      'vbadge--completed',
      'Cancelled':      'vbadge--cancelled'
    };
    return map[status];
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  truncate(text: string, len = 22): string {
    return text.length > len ? text.slice(0, len) + '…' : text;
  }

}
