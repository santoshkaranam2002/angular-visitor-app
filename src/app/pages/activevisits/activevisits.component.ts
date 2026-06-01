import { Component, signal, computed, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from '../register/register.component';
import { VisitorService } from 'src/app/services/visitor.service';

export type VisitorStatus = 'Pending' | 'Approved' | 'Active' | 'Completed';

export interface Visitor {
  id: string;
  name: string;
  photo: string;
  status: VisitorStatus;
  phone: string;
  date: string;
  time: string;
  company: string;
  personToMeet: string;
  department: string;
  teamMembers?: number;
  devices?: number;
}

export interface CheckedInVisitor {
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
  selector: 'app-activevisits',
  standalone: true,
  imports: [CommonModule, FormsModule, RegisterComponent],
  templateUrl: './activevisits.component.html',
  styleUrl: './activevisits.component.scss'
})
export class ActivevisitsComponent implements OnInit {

  constructor(private visitorService: VisitorService) {}

  // ── Data ──────────────────────────────────
  allVisitors: CheckedInVisitor[]      = [];
  filteredVisitors: CheckedInVisitor[] = [];

  // ── Search ────────────────────────────────
  searchQuery = '';

  // ── Pagination ────────────────────────────
  currentPage  = 1;
  itemsPerPage = 8;

  // ── Loading ───────────────────────────────
  isLoading = false;

  // ── Dropdown ──────────────────────────────
  openDropdownId: number | null = null;

  // ── Modal ─────────────────────────────────
  selectedVisitor: CheckedInVisitor | null = null;
  showViewModal = false;

  // ── Register Popup ────────────────────────
  showRegisterPopup = false;
  openNewVisitor(): void { this.showRegisterPopup = true; }
  closeRegisterPopup(): void { this.showRegisterPopup = false; }

  // ─────────────────────────────────────────
  ngOnInit(): void {
    this.loadCheckedIn();
  }

  private parseLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    try {
      const s = dateStr.trim().replace(' ', 'T');
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    } catch { return null; }
  }

  loadCheckedIn(): void {
    this.isLoading = true;
    this.visitorService.getVisitorDashboard().subscribe({
      next: (res: any) => {
        const raw: any[] = Array.isArray(res)
          ? res
          : (res?.response?.visitors || res?.visitors || res?.data || []);

        // ✅ Only CheckedIn / Active visitors
        this.allVisitors = raw
          .filter(item => item.visitStatus === 'CheckedIn' || item.approvalStatus === 'Active')
          .map(item => {
            const rawDate = this.parseLocalDate(item.dateAndTime ?? '');
            return {
              visitID:           item.visitID,
              visitorID:         item.visitorID,
              visitorID_Display: item.visitorID_Display ?? '',
              visitorName:       item.visitorName,
              contact:           item.contact ?? item.mobileNumber ?? '',
              company:           item.company,
              department:        item.department,
              personToMeet:      item.personToMeet ?? null,
              dateAndTime:       item.dateAndTime,
              approvalStatus:    item.approvalStatus,
              visitStatus:       item.visitStatus,
              isEmergencyVisit:  item.isEmergencyVisit ?? false,
              rawDate,
              formattedDate: rawDate
                ? rawDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '',
              formattedTime: rawDate
                ? rawDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
                : ''
            } as CheckedInVisitor;
          });

        this.applySearch();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('CheckedIn load error:', err);
        this.isLoading = false;
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
          v.visitorName.toLowerCase().includes(q)           ||
          v.contact.includes(q)                             ||
          v.company.toLowerCase().includes(q)               ||
          v.visitorID_Display.toLowerCase().includes(q)     ||
          (v.personToMeet?.toLowerCase().includes(q) ?? false) ||
          v.department.toLowerCase().includes(q)
        );
  }

  // ── Pagination ────────────────────────────
  get paginatedVisitors(): CheckedInVisitor[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredVisitors.slice(start, start + this.itemsPerPage);
  }
  get startIndex(): number { return (this.currentPage - 1) * this.itemsPerPage; }
  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.filteredVisitors.length ? this.filteredVisitors.length : end;
  }
  nextPage(): void     { if (this.endIndex < this.filteredVisitors.length) this.currentPage++; }
  previousPage(): void { if (this.currentPage > 1) this.currentPage--; }

  // ── Dropdown ──────────────────────────────
  toggleDropdown(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }
  @HostListener('document:click')
  onDocumentClick(): void { this.openDropdownId = null; }

  // ── Modal ─────────────────────────────────
  openViewModal(visitor: CheckedInVisitor): void {
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

  // ── Export ────────────────────────────────
  exportData(): void {
    const rows = this.filteredVisitors.map(v =>
      `${v.visitorID_Display},${v.visitorName},${v.contact},${v.company},${v.department},${v.personToMeet ?? ''},${v.formattedDate} ${v.formattedTime},${v.visitStatus}`
    );
    const csv = `ID,Name,Contact,Company,Department,Person To Meet,Date & Time,Status\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'active-visitors.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '';
  }
}