import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ApprovalRequest {
  id: string;
  name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  company: string;
  requestedTime: string;
  phone: string;
  meetPerson: string;
  teamCount: number;
  deviceCount: number;
  avatarUrl?: string;
}


@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-approvals.component.html',
  styleUrl: './pending-approvals.component.scss'
})
export class PendingApprovalsComponent {


  
  requests = signal<ApprovalRequest[]>([
    {
      id: 'A45',
      name: 'Amit Patel',
      status: 'PENDING',
      company: 'Cloud Services Ltd',
      requestedTime: '12:33',
      phone: '+91 9988776655',
      meetPerson: 'John Smith - Engineering Head',
      teamCount: 1,
      deviceCount: 1
    },
    {
      id: 'A46',
      name: 'Priya Sharma',
      status: 'PENDING',
      company: 'Infosys Ltd',
      requestedTime: '13:10',
      phone: '+91 9123456780',
      meetPerson: 'Ravi Kumar - HR Manager',
      teamCount: 2,
      deviceCount: 2
    },
    {
      id: 'A47',
      name: 'Arjun Mehta',
      status: 'PENDING',
      company: 'Global Ventures',
      requestedTime: '14:05',
      phone: '+91 9988001122',
      meetPerson: 'Sneha Joshi - Sales Head',
      teamCount: 1,
      deviceCount: 3
    }
  ]);

  pendingRequests = computed(() =>
    this.requests().filter(r => r.status === 'PENDING')
  );

  showModal = signal(false);
  selectedRequest = signal<ApprovalRequest | null>(null);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showToast = signal(false);

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  viewAndProcess(req: ApprovalRequest) {
    this.selectedRequest.set(req);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedRequest.set(null);
  }

  approve(req: ApprovalRequest) {
    this.requests.update(list =>
      list.map(r => r.id === req.id ? { ...r, status: 'APPROVED' } : r)
    );
    this.closeModal();
    this.triggerToast(`${req.name} has been approved successfully.`, 'success');
  }

  reject(req: ApprovalRequest) {
    this.requests.update(list =>
      list.map(r => r.id === req.id ? { ...r, status: 'REJECTED' } : r)
    );
    this.closeModal();
    this.triggerToast(`${req.name}'s request has been rejected.`, 'error');
  }

  private triggerToast(msg: string, type: 'success' | 'error') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3500);
  }


}
