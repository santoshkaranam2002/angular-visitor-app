import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ActiveVisitor {
  id: number;
  name: string;
  company: string;
  phone: string;
  purpose: string;
  inTime: string;
  inDate: string;
  outTime?: string;
  securityGate: string;
  visitStatus: 'Checked-In' | 'Checked-Out' | 'Pending';
  avatarUrl?: string;
}

@Component({
  selector: 'app-depactivevisitors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depactivevisitors.component.html',
  styleUrl: './depactivevisitors.component.scss'
})
export class DepactivevisitorsComponent {

  // ── Data ──────────────────────────────────
  allVisitors: ActiveVisitor[] = [
    {
      id: 1,
      name: 'Priya Sharma',
      company: 'Design Studio Inc',
      phone: '+91 9876543210',
      purpose: 'Interview - Senior Designer Position',
      inTime: '09:00 AM',
      inDate: 'Feb 06',
      outTime: undefined,
      securityGate: 'Gate B - Side Entrance',
      visitStatus: 'Checked-In'
    },
    {
      id: 2,
      name: 'Rahul Verma',
      company: 'Tech Corp Ltd',
      phone: '+91 8765432109',
      purpose: 'Client Meeting - Q2 Review',
      inTime: '10:30 AM',
      inDate: 'Feb 06',
      outTime: undefined,
      securityGate: 'Gate A - Main Entrance',
      visitStatus: 'Checked-In'
    },
    {
      id: 3,
      name: 'Neha Singh',
      company: 'Finance Group',
      phone: '+91 7654321098',
      purpose: 'Audit Meeting',
      inTime: '11:15 AM',
      inDate: 'Feb 06',
      outTime: undefined,
      securityGate: 'Gate C - Front Gate',
      visitStatus: 'Checked-In'
    },
    {
      id: 4,
      name: 'Arjun Patel',
      company: 'Supply Chain Co',
      phone: '+91 6543210987',
      purpose: 'Vendor Discussion',
      inTime: '02:00 PM',
      inDate: 'Feb 06',
      outTime: '03:30 PM',
      securityGate: 'Gate A - Main Entrance',
      visitStatus: 'Checked-Out'
    }
  ];

  filteredVisitors: ActiveVisitor[] = [];
  activeVisitors: ActiveVisitor[] = [];

  // ── Search ────────────────────────────────
  searchQuery = '';

  // ── Pagination ────────────────────────────
  currentPage = 1;
  itemsPerPage = 8;

  // ── Dropdown ──────────────────────────────
  openDropdownId: number | null = null;

  // ── Modal ─────────────────────────────────
  selectedVisitor: ActiveVisitor | null = null;
  showViewModal = false;

  // ── Loading ───────────────────────────────
  isLoading = false;

  // ── Toast ─────────────────────────────────
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor() {
    this.activeVisitors = this.allVisitors.filter(v => v.visitStatus === 'Checked-In');
    this.filteredVisitors = [...this.activeVisitors];
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
    this.filteredVisitors = !q
      ? [...this.activeVisitors]
      : this.activeVisitors.filter(v =>
          v.name.toLowerCase().includes(q) ||
          v.phone.includes(q) ||
          v.company.toLowerCase().includes(q) ||
          v.purpose.toLowerCase().includes(q) ||
          v.securityGate.toLowerCase().includes(q)
        );
  }

  // ── Pagination ────────────────────────────
  get paginatedVisitors(): ActiveVisitor[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredVisitors.slice(start, start + this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredVisitors.length);
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.endIndex < this.filteredVisitors.length) this.currentPage++;
  }

  // ── Dropdown ──────────────────────────────
  toggleDropdown(id: number, event: Event): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(): void {
    this.openDropdownId = null;
  }

  // ── Modal ─────────────────────────────────
  openViewModal(visitor: ActiveVisitor): void {
    this.selectedVisitor = visitor;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedVisitor = null;
  }

  // ── Checkout ──────────────────────────────
  checkoutVisitor(visitor: ActiveVisitor): void {
    const now = new Date();
    visitor.outTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ' ' + (now.getHours() >= 12 ? 'PM' : 'AM');
    visitor.visitStatus = 'Checked-Out';
    this.applySearch();
    this.closeViewModal();
    this.triggerToast(`${visitor.name} has been checked out successfully.`, 'success');
  }

  // ── Export ────────────────────────────────
  exportData(): void {
    const csv = this.convertToCSV(this.filteredVisitors);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'active-visitors.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: ActiveVisitor[]): string {
    const headers = ['ID', 'Name', 'Phone', 'Company', 'Purpose', 'In-Time', 'Out-Time', 'Gate', 'Status'];
    const rows = data.map(v => [v.id, v.name, v.phone, v.company, v.purpose, v.inTime, v.outTime || '—', v.securityGate, v.visitStatus]);
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
