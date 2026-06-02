import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from 'src/app/services/visitor.service';

export interface HistoryVisitor {
  visitID: string;
  id: string;
  name: string;
  initials: string;
  contact: string;
  company: string;
  department: string;
  personToMeet: string;
  date: string;
  time: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Approved' | 'Rejected';
  rawDate: Date | null;
}

type ViewMode = 'list' | 'grid';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  constructor(private visitorService: VisitorService) {}

  // ── View mode (kept for view toggle buttons) ──
  viewMode = signal<ViewMode>('list');
  setViewMode(mode: ViewMode) { this.viewMode.set(mode); }

  // ── State ──
  allVisitors: HistoryVisitor[] = [];
  isLoading = false;
  searchText = '';
  activeFilterIndex = 0;
  currentPage = 1;
  itemsPerPage = 10;

  // ── Date range ──
  fromDate = '';
  toDate = '';

  // ── Filters ──
  filters = ['All', 'Pending', 'Approved', 'Check-In', 'Check-Out', 'Rejected'];

  // ── Stat card methods (original signals replaced with methods) ──
  totalRecords   = () => this.allVisitors.length;
  completedCount = () => this.allVisitors.filter(v => v.status === 'Completed').length;
  rejectedCount  = () => this.allVisitors.filter(v => v.status === 'Rejected').length;
  completedPct   = () => this.totalRecords()
    ? Math.round(this.completedCount() / this.totalRecords() * 100)
    : 0;
  rejectedPct    = () => this.totalRecords()
    ? Math.round(this.rejectedCount() / this.totalRecords() * 100)
    : 0;
  avgDuration    = () => {
    const completed = this.allVisitors.filter(v => v.status === 'Completed');
    if (!completed.length) return 0;
    // API has no duration field — return 0 or calculate if available
    return 0;
  };

  // ── Init ──
  ngOnInit(): void {
    const today = new Date();

    // First day of previous month
    const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Last day of previous month
    const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);

    this.fromDate = this.formatDateForInput(firstDay);
    this.toDate   = this.formatDateForInput(lastDay);

    this.loadData();
  }

  // ── Format date to yyyy-MM-dd for input ──
  private formatDateForInput(d: Date): string {
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  // ── Date change handler ──
  onDateChange(): void {
    if (this.fromDate && this.toDate) {
      this.currentPage = 1;
      this.loadData();
    }
  }

  // ── Clear dates back to previous month ──
  clearDates(): void {
    const today    = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDay  = new Date(today.getFullYear(), today.getMonth(), 0);
    this.fromDate  = this.formatDateForInput(firstDay);
    this.toDate    = this.formatDateForInput(lastDay);
    this.currentPage = 1;
    this.loadData();
  }

  // ── Load data from API ──
  loadData(): void {
    this.isLoading = true;
    this.visitorService.getPreviousMonthVisitors(this.fromDate, this.toDate).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res)
          ? res
          : (res?.response?.visitors || res?.visitors || res?.data || []);
        this.allVisitors = list.map((item: any) => this.mapItem(item));
        console.log('History visitors:', this.allVisitors);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('History API Error', err);
        this.isLoading = false;
      }
    });
  }

  // ── Parse date string ──
  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    try {
      const normalized = dateStr.trim().replace(' ', 'T');
      const d = new Date(normalized);
      return isNaN(d.getTime()) ? null : d;
    } catch { return null; }
  }

  // ── Map API item to HistoryVisitor ──
  private mapItem(item: any): HistoryVisitor {
    const rawDate = this.parseDate(item.dateAndTime ?? item.startDate ?? '');

    let status: HistoryVisitor['status'] = 'Pending';

    if (
      item.approvalStatus === 'Rejected' ||
      item.visitStatus === 'Rejected'    ||
      item.visitStatus === 'Cancelled'   ||
      item.statusLabel === 'Cancelled'   ||
      item.visitStatus === 'Closed'
    ) {
      status = 'Rejected';
    } else if (
      item.visitStatus === 'CheckedIn' ||
      item.statusLabel === 'Active'
    ) {
      status = 'Active';
    } else if (
      item.visitStatus === 'CheckedOut'  ||
      item.visitStatus === 'Completed'   ||
      item.statusLabel === 'Completed'
    ) {
      status = 'Completed';
    } else if (item.approvalStatus === 'Approved') {
      status = 'Approved';
    } else {
      status = 'Pending';
    }

    return {
      visitID:      String(item.visitID),
      id:           item.visitorID_Display ?? item.visitorCode ?? '',
      name:         item.visitorName ?? '',
      initials:     this.getInitials(item.visitorName ?? ''),
      contact:      item.contact ?? item.mobileNumber ?? '',
      company:      item.company ?? '',
      department:   item.department ?? '',
      personToMeet: item.personToMeet ?? item.personToMeetName ?? '',
      date: rawDate
        ? rawDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '',
      time: rawDate
        ? rawDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        : '',
      status,
      rawDate
    };
  }

  // ── Get initials from name ──
  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map((w: string) => w.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  // ── Filter tab ──
  setFilter(index: number): void {
    this.activeFilterIndex = index;
    this.currentPage = 1;
  }

  getFilterCount(filter: string): number {
    if (filter === 'All')       return this.allVisitors.length;
    if (filter === 'Check-In')  return this.allVisitors.filter(v => v.status === 'Active').length;
    if (filter === 'Check-Out') return this.allVisitors.filter(v => v.status === 'Completed').length;
    return this.allVisitors.filter(v => v.status === filter).length;
  }

  // ── Filtered visitors ──
  get filteredVisitors(): HistoryVisitor[] {
    let data = [...this.allVisitors];
    const selectedFilter = this.filters[this.activeFilterIndex];

    if (selectedFilter === 'Check-In') {
      data = data.filter(v => v.status === 'Active');
    } else if (selectedFilter === 'Check-Out') {
      data = data.filter(v => v.status === 'Completed');
    } else if (selectedFilter !== 'All') {
      data = data.filter(v => v.status === selectedFilter);
    }

    if (this.searchText.trim()) {
      const s = this.searchText.toLowerCase();
      data = data.filter(v =>
        v.name.toLowerCase().includes(s)       ||
        v.company.toLowerCase().includes(s)    ||
        v.department.toLowerCase().includes(s) ||
        v.id.toLowerCase().includes(s)         ||
        (v.contact || '').toLowerCase().includes(s)
      );
    }

    return data;
  }

  // ── Pagination ──
  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.filteredVisitors.length ? this.filteredVisitors.length : end;
  }

  get paginatedVisitors(): HistoryVisitor[] {
    return this.filteredVisitors.slice(this.startIndex, this.startIndex + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.endIndex < this.filteredVisitors.length) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  // ── Export CSV ──
  exportData(): void {
    const rows = this.filteredVisitors.map(v =>
      `${v.id},"${v.name}",${v.contact},"${v.company}","${v.department}","${v.personToMeet}",${v.date} ${v.time},${v.status}`
    );
    const csv = `ID,Name,Contact,Company,Department,Person To Meet,Date & Time,Status\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'visit-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}