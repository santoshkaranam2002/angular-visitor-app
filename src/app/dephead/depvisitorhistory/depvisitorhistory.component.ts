import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface HistoryVisitor {
  id: number;
  name: string;
  company: string;
  phone: string;
  purpose: string;
  visitDate: string;
  inTime: string;
  outTime: string;
  status: 'Completed' | 'Rejected';
  avatarUrl?: string;
}

@Component({
  selector: 'app-depvisitorhistory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depvisitorhistory.component.html',
  styleUrl: './depvisitorhistory.component.scss'
})
export class DepvisitorhistoryComponent {

  // ── Data ──────────────────────────────────
  allVisitors: HistoryVisitor[] = [
    {
      id: 1,
      name: 'Rahul Kumar',
      company: 'Tech Corp',
      phone: '+91 9876543210',
      purpose: 'Business Meeting - Product Review',
      visitDate: 'Feb 06',
      inTime: '11:12',
      outTime: '13:12',
      status: 'Completed'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      company: 'Design Studio',
      phone: '+91 8765432109',
      purpose: 'Interview - Frontend Developer',
      visitDate: 'Feb 05',
      inTime: '09:30',
      outTime: '11:00',
      status: 'Completed'
    },
    {
      id: 3,
      name: 'Amit Verma',
      company: 'Logistics Inc',
      phone: '+91 7654321098',
      purpose: 'Delivery - Office Supplies',
      visitDate: 'Feb 04',
      inTime: '14:00',
      outTime: '14:30',
      status: 'Completed'
    },
    {
      id: 4,
      name: 'Sneha Patel',
      company: 'IT Services Ltd',
      phone: '+91 6543210987',
      purpose: 'Vendor Meeting - IT Services',
      visitDate: 'Feb 03',
      inTime: '10:00',
      outTime: '11:30',
      status: 'Rejected'
    },
    {
      id: 5,
      name: 'Karan Singh',
      company: 'Sales Group',
      phone: '+91 5432109876',
      purpose: 'Client Visit - Sales Demo',
      visitDate: 'Feb 02',
      inTime: '15:00',
      outTime: '16:00',
      status: 'Completed'
    }
  ];

  filteredVisitors: HistoryVisitor[] = [];
  completedRejectedVisitors: HistoryVisitor[] = [];

  // ── Search ────────────────────────────────
  searchQuery = '';

  // ── Pagination ────────────────────────────
  currentPage = 1;
  itemsPerPage = 8;

  // ── Dropdown ──────────────────────────────
  openDropdownId: number | null = null;

  // ── Modal ─────────────────────────────────
  selectedVisitor: HistoryVisitor | null = null;
  showViewModal = false;

  // ── Loading ───────────────────────────────
  isLoading = false;

  // ── Toast ─────────────────────────────────
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor() {
    this.completedRejectedVisitors = this.allVisitors.filter(v => v.status === 'Completed' || v.status === 'Rejected');
    this.filteredVisitors = [...this.completedRejectedVisitors];
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
      ? [...this.completedRejectedVisitors]
      : this.completedRejectedVisitors.filter(v =>
          v.name.toLowerCase().includes(q) ||
          v.phone.includes(q) ||
          v.company.toLowerCase().includes(q) ||
          v.purpose.toLowerCase().includes(q)
        );
  }

  // ── Pagination ────────────────────────────
  get paginatedVisitors(): HistoryVisitor[] {
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
  openViewModal(visitor: HistoryVisitor): void {
    this.selectedVisitor = visitor;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedVisitor = null;
  }

  // ── Export ────────────────────────────────
  exportData(): void {
    const csv = this.convertToCSV(this.filteredVisitors);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'visitor-history.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: HistoryVisitor[]): string {
    const headers = ['ID', 'Name', 'Phone', 'Company', 'Purpose', 'Date', 'In-Time', 'Out-Time', 'Status'];
    const rows = data.map(v => [v.id, v.name, v.phone, v.company, v.purpose, v.visitDate, v.inTime, v.outTime, v.status]);
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