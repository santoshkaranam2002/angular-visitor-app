import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from 'src/app/services/visitor.service';

export interface ApprovalVisitor {
  visitID: number;
  visitorID: number;
  visitorID_Display: string;
  visitorName: string;
  contact: string;
  company: string;
  department: string;
  personToMeet: string | null;
  dateAndTime: string;
  approvalStatus: string;
  visitStatus: string;
  isEmergencyVisit: boolean;
  rawDate: Date | null;
  formattedDate: string;
  formattedTime: string;
}

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.scss'
})
export class ApprovalsComponent implements OnInit {

  constructor(private visitorService: VisitorService) {}

  // ── Data ──────────────────────────────────
  allVisitors: ApprovalVisitor[]      = [];
  filteredVisitors: ApprovalVisitor[] = [];

  // ── Search ────────────────────────────────
  searchQuery = '';

  // ── Pagination ────────────────────────────
  currentPage   = 1;
  itemsPerPage  = 8;

  // ── Dropdown ──────────────────────────────
  openDropdownId: number | null = null;

  // ── Modal ─────────────────────────────────
  selectedVisitor: ApprovalVisitor | null = null;
  showViewModal = false;

  // ── Loading ───────────────────────────────
  isLoading = false;

  // ── Toast ─────────────────────────────────
  toast: { show: boolean; message: string; type: 'success' | 'error' } =
    { show: false, message: '', type: 'success' };

  // ─────────────────────────────────────────
  ngOnInit(): void {
    this.loadApprovals();
  }

  // ── Parse date (same logic as dashboard) ──
  private parseLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    try {
      let s = dateStr.trim().replace(' ', 'T');
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    } catch { return null; }
  }

  // ── Load via getVisitorDashboard ───────────
  loadApprovals(): void {
    this.isLoading = true;

    this.visitorService.getVisitorDashboard().subscribe({
      next: (res: any) => {
        // Same unwrap pattern as dashboard
        const raw: any[] = Array.isArray(res)
          ? res
          : (res?.response?.visitors || res?.visitors || res?.data || []);

        // Keep only Pending approvals
        this.allVisitors = raw
          .filter(item => item.approvalStatus === 'Pending')
          .map(item => {
            const rawDate = this.parseLocalDate(item.dateAndTime ?? '');
            return {
              visitID:          item.visitID,
              visitorID:        item.visitorID,
              visitorID_Display: item.visitorID_Display ?? '',
              visitorName:      item.visitorName,
              contact:          item.contact ?? item.mobileNumber ?? '',
              company:          item.company,
              department:       item.department,
              personToMeet:     item.personToMeet ?? null,
              dateAndTime:      item.dateAndTime,
              approvalStatus:   item.approvalStatus,
              visitStatus:      item.visitStatus,
              isEmergencyVisit: item.isEmergencyVisit ?? false,
              rawDate,
              formattedDate: rawDate
                ? rawDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '',
              formattedTime: rawDate
                ? rawDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
                : ''
            } as ApprovalVisitor;
          });

        this.applySearch();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Approvals load error:', err);
        this.isLoading = false;
        this.showToast('Failed to load approvals!', 'error');
      }
    });
  }

  // ── Search ────────────────────────────────
  onSearch(): void {
    this.currentPage = 1;
    this.applySearch();
  }

  applySearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredVisitors = !q
      ? [...this.allVisitors]
      : this.allVisitors.filter(v =>
          v.visitorName.toLowerCase().includes(q)         ||
          v.contact.includes(q)                           ||
          v.company.toLowerCase().includes(q)             ||
          v.visitorID_Display.toLowerCase().includes(q)   ||
          (v.personToMeet?.toLowerCase().includes(q) ?? false) ||
          v.department.toLowerCase().includes(q)
        );
  }

  // ── Pagination ────────────────────────────
  get paginatedVisitors(): ApprovalVisitor[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredVisitors.slice(start, start + this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.filteredVisitors.length ? this.filteredVisitors.length : end;
  }

  nextPage(): void {
    if (this.endIndex < this.filteredVisitors.length) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  // ── Dropdown ──────────────────────────────
  toggleDropdown(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openDropdownId = null;
  }

  // ── Modal ─────────────────────────────────
  openViewModal(visitor: ApprovalVisitor): void {
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

  // ── Approve / Reject ─────────────────────
  private getLoggedInUser(): any {
    try { return JSON.parse(sessionStorage.getItem('loggedInUser') || '{}'); }
    catch { return {}; }
  }

  // approveVisitor(visitor: ApprovalVisitor): void {
  //   const user = this.getLoggedInUser();
  //   this.visitorService.approveVisit(visitor.visitID, 'Approved', user?.userID ?? 1).subscribe({
  //     next: () => {
  //       this.showToast('Visitor approved successfully!', 'success');
  //       this.loadApprovals();
  //     },
  //     error: () => this.showToast('Failed to approve visitor!', 'error')
  //   });
  // }

  // rejectVisitor(visitor: ApprovalVisitor): void {
  //   const user = this.getLoggedInUser();
  //   this.visitorService.approveVisit(visitor.visitID, 'Rejected', user?.userID ?? 1, 'Rejected by approver').subscribe({
  //     next: () => {
  //       this.showToast('Visitor rejected!', 'error');
  //       this.loadApprovals();
  //     },
  //     error: () => this.showToast('Failed to reject visitor!', 'error')
  //   });
  // }

  // ── Export ────────────────────────────────
  exportData(): void {
    const rows = this.filteredVisitors.map(v =>
      `${v.visitorID_Display},${v.visitorName},${v.contact},${v.company},${v.department},${v.personToMeet ?? ''},${v.formattedDate} ${v.formattedTime},${v.approvalStatus}`
    );
    const csv = `ID,Name,Contact,Company,Department,Person To Meet,Date & Time,Status\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'approvals.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Helpers ───────────────────────────────
  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '';
  }

  // ── Toast ─────────────────────────────────
  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => this.toast.show = false, 3000);
  }
}