import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from 'src/app/services/visitor.service';

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
}

@Component({
  selector: 'app-visitor-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visitor-details.component.html',
  styleUrls: ['./visitor-details.component.scss']
})
export class VisitorDetailsComponent implements OnInit {

  allVisitors:      VisitorDetail[] = [];
  filteredVisitors: VisitorDetail[] = [];
  searchText   = '';
  activeFilter = 'All';
  filters      = ['All', 'Pending', 'Approved', 'Active', 'Completed'];
  loading      = false;

  // ── Read from localStorage ──
  loggedInUserName: string = localStorage.getItem('userName') ?? 'User';
  userInitials: string     = this.getInitials(localStorage.getItem('userName') ?? 'U');
  loggedInUserID: number   = Number(localStorage.getItem('userID') ?? 1);

  selectedVisitor: VisitorDetail | null = null;
  showDetailModal = false;

  // ── Action loading state ──
  isActioning = false;

  // ── Success popup ──
  showSuccessPopup   = false;
  successAction: 'approved' | 'rejected' = 'approved';
  successVisitorName = '';

  constructor(private visitorService: VisitorService) {}

  ngOnInit(): void {
    this.loadVisitors();
  }

  // ───────────────── LOAD VISITORS ─────────────────
  loadVisitors(): void {
    this.loading = true;
    this.visitorService.getVisitorsByLoggedInUser(this.loggedInUserID).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.response ?? []);
        this.allVisitors = data.map((v: any) => this.mapToVisitorDetail(v));
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ───────────────── MAP VISITOR ─────────────────
  mapToVisitorDetail(v: any): VisitorDetail {
    const startDate = v.startDate ? new Date(v.startDate) : null;
    return {
      visitID:           String(v.visitID),
      visitorID_Display: v.visitorCode      ?? '',
      visitorName:       v.visitorName      ?? '',
      contact:           v.mobileNumber     ?? '',
      company:           v.company          ?? '',
      department:        v.department       ?? '',
      personToMeet:      v.personToMeetName ?? '',
      purposeOfVisit:    v.purposeOfVisit   ?? '',
      dateAndTime:       v.startDate        ?? '',
      statusLabel:       (v.statusLabel as any) ?? 'Pending',
      approvalStatus:    v.approvalStatus   ?? '',
      visitStatus:       v.visitStatus      ?? '',
      entryGate:         v.entryGate        ?? '',
      visitType:         v.visitType        ?? '',
      date: startDate
        ? startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '',
      time: startDate
        ? startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '',
      initials: this.getInitials(v.visitorName ?? ''),
    };
  }

  // ───────────────── FILTER ─────────────────
  applyFilter(): void {
    let data = [...this.allVisitors];
    if (this.activeFilter !== 'All') {
      data = data.filter(v => v.statusLabel === this.activeFilter);
    }
    if (this.searchText.trim()) {
      const s = this.searchText.toLowerCase();
      data = data.filter(v =>
        v.visitorName.toLowerCase().includes(s)    ||
        v.company.toLowerCase().includes(s)        ||
        v.contact.toLowerCase().includes(s)        ||
        v.purposeOfVisit.toLowerCase().includes(s)
      );
    }
    this.filteredVisitors = data;
  }

  setFilter(f: string): void {
    this.activeFilter = f;
    this.applyFilter();
  }

  getCount(status: string): number {
    if (status === 'All') return this.allVisitors.length;
    return this.allVisitors.filter(v => v.statusLabel === status).length;
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

  // ───────────────── APPROVE — CALLS REAL API ─────────────────
  approveVisitor(): void {
    if (!this.selectedVisitor || this.isActioning) return;
    this.isActioning = true;

    const visitID         = Number(this.selectedVisitor.visitID);
    const approvedByUserID = this.loggedInUserID;

    console.log('=== APPROVING VISIT ===');
    console.log('visitID:', visitID);
    console.log('approvedByUserID:', approvedByUserID);

    this.visitorService.approveVisit(visitID, 'Approved', approvedByUserID, '').subscribe({
      next: (res: any) => {
        console.log('=== APPROVE SUCCESS ===', res);
        this.isActioning = false;

        // ── Update status in local list ──
        const idx = this.allVisitors.findIndex(v => v.visitID === this.selectedVisitor!.visitID);
        if (idx !== -1) {
          this.allVisitors[idx].statusLabel    = 'Approved';
          this.allVisitors[idx].approvalStatus = 'Approved';
        }

        this.successAction      = 'approved';
        this.successVisitorName = this.selectedVisitor!.visitorName;
        this.showDetailModal    = false;
        this.selectedVisitor    = null;
        this.applyFilter();
        this.showSuccessPopup   = true;
        setTimeout(() => { this.showSuccessPopup = false; }, 3500);
      },
      error: (err: any) => {
        console.log('=== APPROVE ERROR ===', err?.status, err?.error);
        this.isActioning = false;
      }
    });
  }

  // ───────────────── REJECT — CALLS REAL API ─────────────────
  rejectVisitor(): void {
    if (!this.selectedVisitor || this.isActioning) return;
    this.isActioning = true;

    const visitID          = Number(this.selectedVisitor.visitID);
    const approvedByUserID = this.loggedInUserID;

    console.log('=== REJECTING VISIT ===');
    console.log('visitID:', visitID);
    console.log('approvedByUserID:', approvedByUserID);

    this.visitorService.approveVisit(visitID, 'Rejected', approvedByUserID, 'Rejected by user').subscribe({
      next: (res: any) => {
        console.log('=== REJECT SUCCESS ===', res);
        this.isActioning = false;

        // ── Update status in local list ──
        const idx = this.allVisitors.findIndex(v => v.visitID === this.selectedVisitor!.visitID);
        if (idx !== -1) {
          this.allVisitors[idx].statusLabel    = 'Rejected';
          this.allVisitors[idx].approvalStatus = 'Rejected';
        }

        this.successAction      = 'rejected';
        this.successVisitorName = this.selectedVisitor!.visitorName;
        this.showDetailModal    = false;
        this.selectedVisitor    = null;
        this.applyFilter();
        this.showSuccessPopup   = true;
        setTimeout(() => { this.showSuccessPopup = false; }, 3500);
      },
      error: (err: any) => {
        console.log('=== REJECT ERROR ===', err?.status, err?.error);
        this.isActioning = false;
      }
    });
  }

  closeSuccessPopup(): void {
    this.showSuccessPopup = false;
  }
}