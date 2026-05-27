import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from '../register/register.component';
import { VisitorService } from 'src/app/services/visitor.service';

export interface Visitor {
  visitID: string;
  visitorID?: string;
  id: string;
  name: string;
  initials?: string;
  avatarColor?: string;
  contact?: string;
  company: string;
  department: string;
  personToMeet: string;
  date: string;
  time: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Approved' | 'Rejected';
  approvalStatus?: string;
  visitStatus?: string;
  hasAvatar?: boolean;
  rawDate?: Date | null;
}

export interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  iconColor: string;
  isSpecial?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RegisterComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  constructor(private visitorService: VisitorService) {}

  searchText = '';

  // ── Loading / error states ──
  checkInLoading  = false;
  checkOutLoading = false;
  checkInError    = '';
  checkOutError   = '';

  ngOnInit(): void {
    this.getDashboardData();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openDropdownId = null;
    this.showCalendar = false;
  }

  openDropdownId: string | null = null;

  toggleDropdown(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  exportData(): void {
    const rows = this.filteredVisitors.map(v =>
      `${v.id},${v.name},${v.contact || ''},${v.company},${v.department},${v.date} ${v.time},${v.status}`
    );
    const csv = `ID,Name,Contact,Company,Department,Date & Time,Status\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visitors.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  statCards: StatCard[] = [
    { label: 'Total',    value: 0, icon: 'total',    iconColor: '#64748b' },
    { label: 'Pending',  value: 0, icon: 'pending',  iconColor: '#f97316' },
    { label: 'Approved', value: 0, icon: 'approved', iconColor: '#22c55e' },
    { label: 'CheckIn',  value: 0, icon: 'checkin',  iconColor: '#16a34a' },
    { label: 'CheckOut', value: 0, icon: 'checkout', iconColor: '#3b82f6' },
  ];

  allVisitors: Visitor[] = [];

  // ───────────────── PARSE DATE ─────────────────
  parseLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    try {
      let normalized = dateStr.trim();
      if (normalized.includes('Z') || normalized.includes('+') || normalized.includes('-', 10)) {
        const d = new Date(normalized);
        return isNaN(d.getTime()) ? null : d;
      }
      normalized = normalized.replace(' ', 'T');
      const d = new Date(normalized);
      return isNaN(d.getTime()) ? null : d;
    } catch { return null; }
  }

  private mapItemToVisitor(item: any): Visitor {
    const rawDate = this.parseLocalDate(item.dateAndTime ?? item.startDate ?? '');

    let displayStatus: 'Pending' | 'Active' | 'Completed' | 'Approved' | 'Rejected' = 'Pending';

    if (item.approvalStatus === 'Rejected' || item.visitStatus === 'Rejected' || item.visitStatus === 'Cancelled' || item.statusLabel === 'Cancelled') {
      displayStatus = 'Rejected';
    } else if (item.visitStatus === 'CheckedIn' || item.statusLabel === 'Active') {
      displayStatus = 'Active';
    } else if (item.visitStatus === 'CheckedOut' || item.visitStatus === 'Completed' || item.statusLabel === 'Completed') {
      displayStatus = 'Completed';
    } else if (item.approvalStatus === 'Approved' && item.visitStatus === 'AwaitingEntry') {
      displayStatus = 'Approved';
    } else if (item.approvalStatus === 'Approved') {
      displayStatus = 'Approved';
    } else if (item.approvalStatus === 'Pending' || item.statusLabel === 'Pending') {
      displayStatus = 'Pending';
    }

    return {
      visitID:        item.visitID,
      visitorID:      item.visitorID,
      id:             item.visitorID_Display ?? item.visitorCode ?? '',
      name:           item.visitorName,
      initials:       this.getInitials(item.visitorName),
      contact:        item.contact ?? item.mobileNumber,
      company:        item.company,
      department:     item.department,
      personToMeet:   item.personToMeet ?? item.personToMeetName ?? '',
      date: rawDate
        ? rawDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '',
      time: rawDate
        ? rawDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        : '',
      status:         displayStatus,
      approvalStatus: item.approvalStatus,
      visitStatus:    item.visitStatus,
      hasAvatar:      true,
      avatarColor:    '#0f8cab',
      rawDate:        rawDate
    };
  }

  // ───────────────── STAT CARDS ─────────────────
  private recalculateStatCards(): void {
    const data = this.getBaseData();
    this.statCards[0].value = data.length;
    this.statCards[1].value = data.filter(v => v.status === 'Pending').length;
    this.statCards[2].value = data.filter(v => v.status === 'Approved').length;
    this.statCards[3].value = data.filter(v => v.status === 'Active').length;
    this.statCards[4].value = data.filter(v => v.status === 'Completed').length;
  }

  // ───────────────── GET DASHBOARD DATA ─────────────────
  getDashboardData(): void {
    this.visitorService.getVisitorDashboard().subscribe({
      next: (res: any) => {
        const visitors = Array.isArray(res)
          ? res
          : (res?.response?.visitors || res?.visitors || res?.data || []);

        this.allVisitors = visitors.map((item: any) => this.mapItemToVisitor(item));

        const now = new Date();
        this.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        this.quickFilter  = 'today';

        this.recalculateStatCards();
      },
      error: (err) => {
        console.error('❌ [Dashboard API Error]', err);
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map((w: string) => w.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

 filters = ['All', 'Pending', 'Approved', 'Check-In', 'Check-Out', 'Rejected'];
  activeFilterIndex = 0;

  setFilter(index: number): void { this.activeFilterIndex = index; }

getFilterCount(filter: string): number {
  const base = this.getBaseData();
  if (filter === 'All')       return base.length;
  if (filter === 'Check-In')  return base.filter(v => v.status === 'Active').length;
  if (filter === 'Check-Out') return base.filter(v => v.status === 'Completed').length;
  return base.filter(v => v.status === filter).length;
}

  private getBaseData(): Visitor[] {
    if (this.selectedDate) {
      return this.allVisitors.filter(v => {
        if (!v.rawDate) return false;
        return this.isSameDay(v.rawDate, this.selectedDate!);
      });
    }
    return [...this.allVisitors];
  }

  // ───────────────── DATE FILTER ─────────────────
  showCalendar  = false;
  selectedDate: Date | null = null;
  quickFilter   = '';
  calendarMonth = new Date();
  dayNames      = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  toggleCalendar(): void { this.showCalendar = !this.showCalendar; }

  clearDate(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedDate = null;
    this.quickFilter  = '';
    this.showCalendar = false;
    this.recalculateStatCards();
  }

  setQuickFilter(filter: string): void {
    const now = new Date();
    this.quickFilter = filter;
    if (filter === 'today') {
      this.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filter === 'yesterday') {
      this.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (filter === 'tomorrow') {
      this.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }
    this.calendarMonth = new Date(this.selectedDate!);
    this.showCalendar  = false;
    this.recalculateStatCards();
  }

  selectDate(date: Date): void {
    this.selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.quickFilter  = '';
    const now       = new Date();
    const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const tomorrow  = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    if (this.isSameDay(date, today))     this.quickFilter = 'today';
    if (this.isSameDay(date, yesterday)) this.quickFilter = 'yesterday';
    if (this.isSameDay(date, tomorrow))  this.quickFilter = 'tomorrow';
    this.showCalendar = false;
    this.recalculateStatCards();
  }

  prevMonth(): void {
    const d = new Date(this.calendarMonth);
    d.setMonth(d.getMonth() - 1);
    this.calendarMonth = d;
  }

  nextMonth(): void {
    const d = new Date(this.calendarMonth);
    d.setMonth(d.getMonth() + 1);
    this.calendarMonth = d;
  }

  getMonthLabel(): string {
    return this.calendarMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }

  get calendarCells(): (Date | null)[] {
    const year        = this.calendarMonth.getFullYear();
    const month       = this.calendarMonth.getMonth();
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }

  isToday(date: Date): boolean     { return this.isSameDay(date, new Date()); }
  isSelected(date: Date): boolean  { return !!this.selectedDate && this.isSameDay(date, this.selectedDate); }
  isSameMonth(date: Date): boolean { return date.getMonth() === this.calendarMonth.getMonth(); }

  isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
  }

  formatSelectedDate(date: Date): string {
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

    get filteredVisitors(): Visitor[] {
      let data = this.getBaseData();
      const selectedFilter = this.filters[this.activeFilterIndex];

      if (selectedFilter === 'Check-In') {
        data = data.filter(v => v.status === 'Active');
      } else if (selectedFilter === 'Check-Out') {
        data = data.filter(v => v.status === 'Completed');
      } else if (selectedFilter !== 'All') {
        data = data.filter(v => v.status === selectedFilter);
      }

      if (this.searchText.trim()) {
        const search = this.searchText.toLowerCase();
        data = data.filter(v =>
          v.name.toLowerCase().includes(search)       ||
          v.company.toLowerCase().includes(search)    ||
          v.department.toLowerCase().includes(search) ||
          v.id.toLowerCase().includes(search)         ||
          (v.contact || '').toLowerCase().includes(search)
        );
      }
      return data;
    }
  // ───────────────── REGISTER ─────────────────
  showRegisterPopup = false;
  openNewVisitor(): void     { this.showRegisterPopup = true; }
  closeRegisterPopup(): void { this.showRegisterPopup = false; this.getDashboardData(); }

  // ───────────────── VIEW MODAL ─────────────────
  selectedVisitor: Visitor | null = null;
  showViewModal = false;

  openViewModal(visitor: Visitor): void {
    this.openDropdownId = null;
    this.selectedVisitor = visitor;
    this.showViewModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedVisitor = null;
    document.body.style.overflow = '';
  }

  // ───────────────── CHECK IN ─────────────────
  showCheckInModal  = false;
  checkInVisitor: Visitor | null = null;

  openCheckInModal(visitor: Visitor): void {
    this.openDropdownId = null;
    this.checkInVisitor  = visitor;
    this.checkInError    = '';
    this.showCheckInModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCheckInModal(): void {
    this.showCheckInModal = false;
    this.checkInVisitor   = null;
    this.checkInError     = '';
    this.checkInLoading   = false;
    document.body.style.overflow = '';
  }

  // ── GET logged-in user from sessionStorage (same pattern as your login) ──
  private getLoggedInUser(): any {
    try {
      return JSON.parse(sessionStorage.getItem('loggedInUser') || '{}');
    } catch { return {}; }
  }

  confirmCheckIn(): void {
    if (!this.checkInVisitor) return;

    const user = this.getLoggedInUser();
    const now  = new Date().toISOString();

    const payload = {
      actionByName:      user?.userName ?? user?.name ?? 'Security',
      action:            'CheckedIn',
      notes:             'Visitor entered into premises',
      actionAt:          now,
      timelineID:        0,
      visitID:           Number(this.checkInVisitor.visitID),
      actionBy:          user?.userID ?? user?.id ?? 0,
      checkInByUserID:   user?.userID ?? user?.id ?? 0,
      checkOutByUserID:  0
    };

    this.checkInLoading = true;
    this.checkInError   = '';

    this.visitorService.addCheckIn(payload).subscribe({
      next: (res: any) => {
        console.log('✅ CheckIn Success:', res);

        // ── Update status locally — no need to reload entire list ──
        const idx = this.allVisitors.findIndex(v => v.visitID === this.checkInVisitor!.visitID);
        if (idx !== -1) {
          this.allVisitors[idx] = {
            ...this.allVisitors[idx],
            status:      'Active',
            visitStatus: 'CheckedIn'
          };
          this.allVisitors = [...this.allVisitors];
          this.recalculateStatCards();
        }

        this.checkInLoading = false;
        this.closeCheckInModal();
      },
      error: (err: any) => {
        console.error('❌ CheckIn Error:', err);
        this.checkInLoading = false;
        this.checkInError   = err?.error?.message ?? err?.message ?? 'Check-in failed. Please try again.';
      }
    });
  }

  // ───────────────── CHECK OUT ─────────────────
  showCheckOutModal  = false;
  checkOutVisitor: Visitor | null = null;

  openCheckOutModal(visitor: Visitor): void {
    this.openDropdownId  = null;
    this.checkOutVisitor  = visitor;
    this.checkOutError    = '';
    this.showCheckOutModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCheckOutModal(): void {
    this.showCheckOutModal = false;
    this.checkOutVisitor   = null;
    this.checkOutError     = '';
    this.checkOutLoading   = false;
    document.body.style.overflow = '';
  }

  confirmCheckOut(): void {
    if (!this.checkOutVisitor) return;

    const user = this.getLoggedInUser();
    const now  = new Date().toISOString();

    const payload = {
      actionByName:      user?.userName ?? user?.name ?? 'Security',
      action:            'CheckedOut',
      notes:             'Visitor exited from premises',
      actionAt:          now,
      timelineID:        0,
      visitID:           Number(this.checkOutVisitor.visitID),
      actionBy:          user?.userID ?? user?.id ?? 0,
      checkInByUserID:   0,
      checkOutByUserID:  user?.userID ?? user?.id ?? 0
    };

    this.checkOutLoading = true;
    this.checkOutError   = '';

    this.visitorService.addCheckOut(payload).subscribe({
      next: (res: any) => {
        console.log('✅ CheckOut Success:', res);

        // ── Update status locally ──
        const idx = this.allVisitors.findIndex(v => v.visitID === this.checkOutVisitor!.visitID);
        if (idx !== -1) {
          this.allVisitors[idx] = {
            ...this.allVisitors[idx],
            status:      'Completed',
            visitStatus: 'CheckedOut'
          };
          this.allVisitors = [...this.allVisitors];
          this.recalculateStatCards();
        }

        this.checkOutLoading = false;
        this.closeCheckOutModal();
      },
      error: (err: any) => {
        console.error('❌ CheckOut Error:', err);
        this.checkOutLoading = false;
        this.checkOutError   = err?.error?.message ?? err?.message ?? 'Check-out failed. Please try again.';
      }
    });
  }

  approveVisitor(visitor: any): void { this.closeViewModal(); }
  rejectVisitor(visitor: any): void  { this.closeViewModal(); }
  printPass(visitor: any): void      { window.print(); }
}