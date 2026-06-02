import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from 'src/app/services/visitor.service';
import { RegisterComponent } from 'src/app/pages/register/register.component';


interface VisitorDetail {
  visitID: string;
  visitorID_Display: string;
  visitorName: string;
  contact: string;
  company: string;
  department: string;
  personToMeet: string;
  purposeOfVisit: string;
  dateAndTime: string;
  statusLabel: 'Pending' | 'Approved' | 'Active' | 'Completed' | 'Rejected';
  approvalStatus: string;
  visitStatus: string;
  entryGate: string;
  visitType: string;
  date: string;
  time: string;
  initials: string;
  rawDate: Date | null;
}

@Component({
  selector: 'app-visitor-details',
  standalone: true,
  imports: [CommonModule, FormsModule,RegisterComponent],
  templateUrl: './visitor-details.component.html',
  styleUrls: ['./visitor-details.component.scss']
})
export class VisitorDetailsComponent implements OnInit {

  allVisitors:      VisitorDetail[] = [];
  todayVisitors:    VisitorDetail[] = [];
  filteredVisitors: VisitorDetail[] = [];

  searchText   = '';
  activeFilter = 'All';
  filters      = ['All', 'Pending', 'Approved', 'Active', 'Completed'];
  loading      = false;

loggedInUserName: string = '';
userInitials: string     = '';
loggedInUserID: number   = 0; 

  selectedVisitor: VisitorDetail | null = null;
  showDetailModal = false;
  isActioning     = false;

  showSuccessPopup   = false;
  successAction: 'approved' | 'rejected' = 'approved';
  successVisitorName = '';

  // ───────────────── REGISTER ─────────────────
showRegisterPopup = false;

openNewVisitor(): void {
  this.showRegisterPopup = true;
}

closeRegisterPopup(): void {
  this.showRegisterPopup = false;
  this.loadVisitors();
}

  // ───────────────── DATE FILTER ─────────────────
  showCalendar  = false;
  selectedDate: Date | null = null;
  quickFilter   = '';
  calendarMonth = new Date();
  dayNames      = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  constructor(private visitorService: VisitorService) {}

  ngOnInit(): void {
  // ✅ Read AFTER login has saved to localStorage
  this.loggedInUserID   = Number(localStorage.getItem('userID') ?? 0);
  this.loggedInUserName = localStorage.getItem('userName') ?? 'User';
  this.userInitials     = this.getInitials(this.loggedInUserName);

  console.log('👤 loggedInUserID:', this.loggedInUserID); // verify correct ID

      const now = new Date();
  this.selectedDate  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  this.quickFilter   = 'today';
  this.calendarMonth = new Date(this.selectedDate);
    this.loadVisitors();
  }

  // ───────────────── HOST LISTENER ─────────────────
  @HostListener('document:click')
  onDocumentClick(): void {
    this.showCalendar = false;
  }

  // ───────────────── LOAD VISITORS ─────────────────
  loadVisitors(): void {
    this.loading = true;
    // console.log('📡 [loadVisitors] Calling API for userID:', this.loggedInUserID);
// 
    this.visitorService.getVisitorsByLoggedInUser(this.loggedInUserID).subscribe({
      next: (res: any) => {
        console.log('✅ [API Response] Raw:', res);

        const data = Array.isArray(res) ? res : (res?.response ?? []);
        // console.log('📋 [API Response] Extracted data array length:', data.length);
        console.log('📋 [API Response] Data:', data);
        

        // Map all visitors
        this.allVisitors = data.map((v: any) => this.mapToVisitorDetail(v));
        // console.log('🗂️ [allVisitors] Total mapped:', this.allVisitors.length);
        // console.log('🗂️ [allVisitors] List:', this.allVisitors);

        // ── TODAY FILTER ──
        const today = new Date();
        const todayY = today.getFullYear();
        const todayM = today.getMonth();
        const todayD = today.getDate();

        // console.log(`📅 [Today] ${todayD}/${todayM + 1}/${todayY}`);

        this.todayVisitors = this.allVisitors.filter(v => {
          if (!v.rawDate) {
            console.warn(`⚠️ [Filter] "${v.visitorName}" has NULL rawDate — skipped`);
            return false;
          }
          const match =
            v.rawDate.getFullYear() === todayY &&
            v.rawDate.getMonth()    === todayM &&
            v.rawDate.getDate()     === todayD;

          // console.log(
          //   `🔍 [Filter] "${v.visitorName}" rawDate=${v.rawDate.toISOString()} → match=${match}`
          // );
          return match;
        });

        // console.log('📌 [todayVisitors] Count:', this.todayVisitors.length);
        // console.log('📌 [todayVisitors] List:', this.todayVisitors);

        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ [API Error]', err);
        this.loading = false;
      }
    });
  }

  // ───────────────── MAP VISITOR ─────────────────
  mapToVisitorDetail(v: any): VisitorDetail {
    // console.log('🔨 [mapToVisitorDetail] Raw visitor:', v);

    // Try multiple date fields
    const rawDateStr = v.startDate ?? v.visitDate ?? v.dateAndTime ?? null;
    let startDate: Date | null = null;

    if (rawDateStr) {
      startDate = new Date(rawDateStr);
      // Check for invalid date
      if (isNaN(startDate.getTime())) {
        // console.warn(`⚠️ [mapToVisitorDetail] Invalid date string: "${rawDateStr}" for visitor "${v.visitorName}"`);
        startDate = null;
      } else {
        // console.log(`📅 [mapToVisitorDetail] "${v.visitorName}" → rawDateStr="${rawDateStr}" → parsed="${startDate.toISOString()}"`);
      }
    } else {
      // console.warn(`⚠️ [mapToVisitorDetail] No date field found for visitor "${v.visitorName}". Available keys:`, Object.keys(v));
    }

    return {
      visitID:           String(v.visitID ?? ''),
      visitorID_Display: v.visitorCode      ?? '',
      visitorName:       v.visitorName      ?? '',
      contact:           v.mobileNumber     ?? '',
      company:           v.company          ?? '',
      department:        v.department       ?? '',
      personToMeet:      v.personToMeetName ?? '',
      purposeOfVisit:    v.purposeOfVisit   ?? '',
      dateAndTime:       rawDateStr         ?? '',
      statusLabel:       (v.statusLabel as any) ?? 'Pending',
      approvalStatus:    v.approvalStatus   ?? '',
      visitStatus:       v.visitStatus      ?? '',
      entryGate:         v.entryGate        ?? '',
      visitType:         v.visitType        ?? '',
      rawDate: startDate,
      date: startDate
        ? startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '',
      time: startDate
        ? startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '',
      initials: this.getInitials(v.visitorName ?? ''),
    };
  }

  // ───────────────── GET BASE DATA ─────────────────
  private getBaseData(): VisitorDetail[] {
    if (this.selectedDate) {
      const result = this.allVisitors.filter(v => {
        if (!v.rawDate) return false;
        return this.isSameDay(v.rawDate, this.selectedDate!);
      });
      // console.log(`📅 [getBaseData] selectedDate filter → ${result.length} visitors`);
      return result;
    }
    // console.log(`📅 [getBaseData] Using todayVisitors → ${this.todayVisitors.length} visitors`);
    return [...this.todayVisitors];
  }

  // ───────────────── FILTER ─────────────────
  applyFilter(): void {
    let data = this.getBaseData();
    // console.log(`🔎 [applyFilter] Base data count: ${data.length}, activeFilter: ${this.activeFilter}`);

    if (this.activeFilter !== 'All') {
      data = data.filter(v => v.statusLabel === this.activeFilter);
      // console.log(`🔎 [applyFilter] After status filter: ${data.length}`);
    }

    if (this.searchText.trim()) {
      const s = this.searchText.toLowerCase();
      data = data.filter(v =>
        v.visitorName.toLowerCase().includes(s)    ||
        v.company.toLowerCase().includes(s)        ||
        v.contact.toLowerCase().includes(s)        ||
        v.purposeOfVisit.toLowerCase().includes(s)
      );
      // console.log(`🔎 [applyFilter] After search filter: ${data.length}`);
    }

    this.filteredVisitors = data;
    // console.log('✅ [filteredVisitors] Final count:', this.filteredVisitors.length);
  }

  setFilter(f: string): void {
    this.activeFilter = f;
    this.applyFilter();
  }

  getCount(status: string): number {
    const base = this.getBaseData();
    if (status === 'All') return base.length;
    return base.filter(v => v.statusLabel === status).length;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  openDetail(visitor: VisitorDetail): void {
    this.selectedVisitor = { ...visitor };
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedVisitor = null;
  }

  // ───────────────── DATE FILTER METHODS ─────────────────
  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
  }

  clearDate(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedDate = null;
    this.quickFilter  = '';
    this.showCalendar = false;
    this.applyFilter();
  }

  setQuickFilter(filter: string): void {
    const today = new Date();
    this.quickFilter = filter;

    if (filter === 'today') {
      this.selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    } else if (filter === 'yesterday') {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      this.selectedDate = d;
    } else if (filter === 'tomorrow') {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      this.selectedDate = d;
    }

    // console.log(`📅 [setQuickFilter] filter="${filter}" selectedDate=`, this.selectedDate);
    this.calendarMonth = new Date(this.selectedDate!);
    this.showCalendar  = false;
    this.applyFilter();
  }

  selectDate(date: Date): void {
    this.selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.quickFilter  = '';

    const today     = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const tomorrow  = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    if (this.isSameDay(date, today))     { this.quickFilter = 'today'; }
    if (this.isSameDay(date, yesterday)) { this.quickFilter = 'yesterday'; }
    if (this.isSameDay(date, tomorrow))  { this.quickFilter = 'tomorrow'; }

    // console.log(`📅 [selectDate] selected=`, this.selectedDate, `quickFilter="${this.quickFilter}"`);
    this.showCalendar = false;
    this.applyFilter();
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
    const year      = this.calendarMonth.getFullYear();
    const month     = this.calendarMonth.getMonth();
    const firstDay  = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }

  isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  isSelected(date: Date): boolean {
    return !!this.selectedDate && this.isSameDay(date, this.selectedDate);
  }

  isSameMonth(date: Date): boolean {
    return date.getMonth() === this.calendarMonth.getMonth();
  }

  isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth()    === b.getMonth()    &&
      a.getDate()     === b.getDate()
    );
  }

  formatSelectedDate(date: Date): string {
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ───────────────── APPROVE ─────────────────
  approveVisitor(): void {
    if (!this.selectedVisitor || this.isActioning) return;
    this.isActioning = true;

    const visitID          = Number(this.selectedVisitor.visitID);
    const approvedByUserID = this.loggedInUserID;
    // console.log('✅ [approveVisitor] visitID:', visitID, 'approvedBy:', approvedByUserID);

    this.visitorService.approveVisit(visitID, 'Approved', approvedByUserID, '').subscribe({
      next: (res: any) => {
        console.log('✅ [approveVisitor] API response:', res);
        this.isActioning = false;

        const updateStatus = (list: VisitorDetail[]) => {
          const idx = list.findIndex(v => v.visitID === this.selectedVisitor!.visitID);
          if (idx !== -1) {
            list[idx].statusLabel    = 'Approved';
            list[idx].approvalStatus = 'Approved';
          }
        };
        updateStatus(this.allVisitors);
        updateStatus(this.todayVisitors);

        this.successAction      = 'approved';
        this.successVisitorName = this.selectedVisitor!.visitorName;
        this.showDetailModal    = false;
        this.selectedVisitor    = null;
        this.applyFilter();
        this.showSuccessPopup   = true;
        setTimeout(() => { this.showSuccessPopup = false; }, 3500);
      },
      error: (err) => {
        console.error('❌ [approveVisitor] Error:', err);
        this.isActioning = false;
      }
    });
  }

  // ───────────────── REJECT ─────────────────
  rejectVisitor(): void {
    if (!this.selectedVisitor || this.isActioning) return;
    this.isActioning = true;

    const visitID          = Number(this.selectedVisitor.visitID);
    const approvedByUserID = this.loggedInUserID;
    // console.log('❌ [rejectVisitor] visitID:', visitID, 'rejectedBy:', approvedByUserID);

    this.visitorService.approveVisit(visitID, 'Rejected', approvedByUserID, 'Rejected by user').subscribe({
      next: (res: any) => {
        // console.log('✅ [rejectVisitor] API response:', res);
        this.isActioning = false;

        const updateStatus = (list: VisitorDetail[]) => {
          const idx = list.findIndex(v => v.visitID === this.selectedVisitor!.visitID);
          if (idx !== -1) {
            list[idx].statusLabel    = 'Rejected';
            list[idx].approvalStatus = 'Rejected';
          }
        };
        updateStatus(this.allVisitors);
        updateStatus(this.todayVisitors);

        this.successAction      = 'rejected';
        this.successVisitorName = this.selectedVisitor!.visitorName;
        this.showDetailModal    = false;
        this.selectedVisitor    = null;
        this.applyFilter();
        this.showSuccessPopup   = true;
        setTimeout(() => { this.showSuccessPopup = false; }, 3500);
      },
      error: (err) => {
        console.error('❌ [rejectVisitor] Error:', err);
        this.isActioning = false;
      }
    });
  }

  closeSuccessPopup(): void {
    this.showSuccessPopup = false;
  }
}