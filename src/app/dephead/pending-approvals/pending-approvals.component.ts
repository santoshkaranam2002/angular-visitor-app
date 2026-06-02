import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-approvals.component.html',
  styleUrl: './pending-approvals.component.scss'
})
export class PendingApprovalsComponent {

  // ── Data ──────────────────────────────────
  allRequests: ApprovalRequest[] = [
    {
      id: 'A45',
      name: 'Amit Patel',
      status: 'PENDING',
      company: 'Cloud Services Ltd',
      requestedTime: '12:33 PM',
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
      requestedTime: '13:10 PM',
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
      requestedTime: '14:05 PM',
      phone: '+91 9988001122',
      meetPerson: 'Sneha Joshi - Sales Head',
      teamCount: 1,
      deviceCount: 3
    },
    {
      id: 'A48',
      name: 'Neha Singh',
      status: 'PENDING',
      company: 'Tech Innovations',
      requestedTime: '14:45 PM',
      phone: '+91 8765432109',
      meetPerson: 'Vikram Patel - Manager',
      teamCount: 1,
      deviceCount: 1
    },
    {
      id: 'A49',
      name: 'Rajesh Kumar',
      status: 'PENDING',
      company: 'Digital Solutions',
      requestedTime: '15:20 PM',
      phone: '+91 7654321098',
      meetPerson: 'Ananya Verma - Director',
      teamCount: 3,
      deviceCount: 2
    },
    {
      id: 'A50',
      name: 'Kavya Desai',
      status: 'PENDING',
      company: 'Finance Corp',
      requestedTime: '16:00 PM',
      phone: '+91 6543210987',
      meetPerson: 'Ravi Shankar - CFO',
      teamCount: 2,
      deviceCount: 1
    }
  ];
  
  filteredRequests: ApprovalRequest[] = [];

  // ── Search ────────────────────────────────
  searchQuery = '';

  // ── Pagination ────────────────────────────
  currentPage = 1;
  itemsPerPage = 8;

  // ── Dropdown ──────────────────────────────
  openDropdownId: string | null = null;

  // ── Modal ─────────────────────────────────
  selectedRequest: ApprovalRequest | null = null;
  showViewModal = false;

  // ── Loading ───────────────────────────────
  isLoading = false;

  // ── Toast ─────────────────────────────────
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor() {
    this.filteredRequests = [...this.allRequests];
  }

  // ── Get initials ──────────────────────────
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // ── Search ────────────────────────────────
  onSearch(): void {
    this.currentPage = 1;
    this.applySearch();
  }

  applySearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredRequests = !q
      ? [...this.allRequests]
      : this.allRequests.filter(r =>
          r.name.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.company.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          (r.meetPerson?.toLowerCase().includes(q) ?? false)
        );
  }

  // ── Pagination ────────────────────────────
  get paginatedRequests(): ApprovalRequest[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRequests.slice(start, start + this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredRequests.length);
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.endIndex < this.filteredRequests.length) this.currentPage++;
  }

  // ── Dropdown ──────────────────────────────
  toggleDropdown(id: string, event: Event): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(): void {
    this.openDropdownId = null;
  }

  // ── Modal ─────────────────────────────────
  openViewModal(req: ApprovalRequest): void {
    this.selectedRequest = req;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedRequest = null;
  }

  // ── Approve/Reject ────────────────────────
  approve(req: ApprovalRequest): void {
    const index = this.allRequests.findIndex(r => r.id === req.id);
    if (index !== -1) {
      this.allRequests[index].status = 'APPROVED';
      this.applySearch();
    }
    this.closeViewModal();
    this.triggerToast(`${req.name} has been approved successfully.`, 'success');
  }

  reject(req: ApprovalRequest): void {
    const index = this.allRequests.findIndex(r => r.id === req.id);
    if (index !== -1) {
      this.allRequests[index].status = 'REJECTED';
      this.applySearch();
    }
    this.closeViewModal();
    this.triggerToast(`${req.name}'s request has been rejected.`, 'error');
  }

  // ── Export ────────────────────────────────
  exportData(): void {
    const csv = this.convertToCSV(this.filteredRequests);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pending-approvals.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: ApprovalRequest[]): string {
    const headers = ['ID', 'Name', 'Phone', 'Company', 'Person to Meet', 'Status', 'Requested Time'];
    const rows = data.map(r => [r.id, r.name, r.phone, r.company, r.meetPerson, r.status, r.requestedTime]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // ── Toast ─────────────────────────────────
  private triggerToast(msg: string, type: 'success' | 'error'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3500);
  }
}
