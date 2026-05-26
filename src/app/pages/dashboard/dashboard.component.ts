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
  status: 'Pending' | 'Active' | 'Completed' | 'Approved';
  hasAvatar?: boolean;
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

  activeFilter = 'All';
  searchText = '';

  // ───────────────── DROPDOWN ─────────────────
  openDropdownId: string | null = null;

  toggleDropdown(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  closeAllDropdowns(): void {
    this.openDropdownId = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openDropdownId = null;
  }

  ngOnInit(): void {
    this.getDashboardData();
  }

  // ───────────────── EXPORT ─────────────────
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

  // ───────────────── STAT CARDS ─────────────────
  statCards: StatCard[] = [
    { label: 'Total',   value: 0, icon: 'total',   iconColor: '#64748b' },
    { label: 'Pending', value: 0, icon: 'pending',  iconColor: '#f97316' },
    { label: 'Active',  value: 0, icon: 'active',   iconColor: '#16a34a' },
    { label: 'Done',    value: 0, icon: 'done',     iconColor: '#3b82f6' },
    { label: 'Staff',   value: 0, icon: 'staff',    iconColor: '#8b5cf6', isSpecial: true },
  ];

  // ───────────────── VISITORS DATA ─────────────────
  visitors: Visitor[] = [];

getDashboardData(): void {
  this.visitorService.getVisitorDashboard().subscribe({
    next: (res: any) => {
      console.log('DASHBOARD RESPONSE:', res);

      this.visitors = (res?.response?.visitors || []).map((item: any) => {
        const visitDate = new Date(item.dateAndTime);
        return {
          visitID: item.visitID,
          visitorID: item.visitorID,
          id: item.visitorID_Display,
          name: item.visitorName,
          initials: this.getInitials(item.visitorName),
          contact: item.contact,
          company: item.company,
          department: item.department,
          personToMeet: item.personToMeet,
          date: visitDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: visitDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          status: this.mapStatus(item.statusLabel),
          hasAvatar: true,
          avatarColor: '#0f8cab'
        };
      });

      // ✅ Count from actual visitor list — not from API summary
      const total     = this.visitors.length;
      const pending   = this.visitors.filter(v => v.status === 'Pending').length;
      const approved  = this.visitors.filter(v => v.status === 'Approved').length;
      const active    = this.visitors.filter(v => v.status === 'Active').length;
      const completed = this.visitors.filter(v => v.status === 'Completed').length;
      const staffOnDuty = res?.response?.summary?.staffOnDuty || 0;

      this.statCards = [
        { label: 'Total',   value: total,       icon: 'total',   iconColor: '#64748b' },
        { label: 'Pending', value: pending,      icon: 'pending', iconColor: '#f97316' },
        { label: 'Active',  value: active,       icon: 'active',  iconColor: '#16a34a' },
        { label: 'Done',    value: completed,    icon: 'done',    iconColor: '#3b82f6' },
        { label: 'Staff',   value: staffOnDuty,  icon: 'staff',   iconColor: '#8b5cf6', isSpecial: true }
      ];

      console.log('VISITORS:', this.visitors);
    },
    error: (err: any) => {
      console.error('Dashboard API Error:', err);
    }
  });
}

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map((w: string) => w.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  mapStatus(status: string): 'Pending' | 'Active' | 'Completed' | 'Approved' {
    switch (status) {
      case 'Pending':   return 'Pending';
      case 'Active':    return 'Active';
      case 'Approved':  return 'Approved';
      case 'Completed': return 'Completed';
      default:          return 'Pending';
    }
  }

  // ───────────────── FILTERS ─────────────────
  filters = ['All', 'Pending', 'Approved', 'Active', 'Completed'];
  activeFilterIndex = 0;

  setFilter(index: number): void {
    this.activeFilterIndex = index;
  }

  getFilterCount(filter: string): number {
    if (filter === 'All') return this.visitors.length;
    return this.visitors.filter(v => v.status === filter).length;
  }

  get filteredVisitors(): Visitor[] {
    let filteredData = [...this.visitors];

    const selectedFilter = this.filters[this.activeFilterIndex];
    if (selectedFilter !== 'All') {
      filteredData = filteredData.filter(v => v.status === selectedFilter);
    }

    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filteredData = filteredData.filter(v =>
        v.name.toLowerCase().includes(search) ||
        v.company.toLowerCase().includes(search) ||
        v.department.toLowerCase().includes(search) ||
        v.id.toLowerCase().includes(search) ||
        (v.contact || '').toLowerCase().includes(search)
      );
    }

    return filteredData;
  }

  // ───────────────── REGISTER POPUP ─────────────────
  showRegisterPopup: boolean = false;

  openNewVisitor(): void {
    this.showRegisterPopup = true;
  }

  closeRegisterPopup(): void {
    this.showRegisterPopup = false;
    this.getDashboardData();
  }

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

  printVisitor(): void {
    window.print();
  }

  // ───────────────── CHECK IN ─────────────────
  showCheckInModal = false;
  checkInVisitor: Visitor | null = null;

  openCheckInModal(visitor: Visitor): void {
    this.openDropdownId = null;
    this.checkInVisitor = visitor;
    this.showCheckInModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCheckInModal(): void {
    this.showCheckInModal = false;
    this.checkInVisitor = null;
    document.body.style.overflow = '';
  }

  confirmCheckIn(): void {
    if (this.checkInVisitor) {
      const idx = this.visitors.findIndex(v => v.id === this.checkInVisitor!.id);
      if (idx !== -1) {
        this.visitors[idx] = { ...this.visitors[idx], status: 'Active' };
        this.visitors = [...this.visitors];
      }
    }
    this.closeCheckInModal();
  }

  // ───────────────── CHECK OUT ─────────────────
  showCheckOutModal = false;
  checkOutVisitor: Visitor | null = null;

  openCheckOutModal(visitor: Visitor): void {
    this.openDropdownId = null;
    this.checkOutVisitor = visitor;
    this.showCheckOutModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCheckOutModal(): void {
    this.showCheckOutModal = false;
    this.checkOutVisitor = null;
    document.body.style.overflow = '';
  }

  confirmCheckOut(): void {
    if (this.checkOutVisitor) {
      const idx = this.visitors.findIndex(v => v.id === this.checkOutVisitor!.id);
      if (idx !== -1) {
        this.visitors[idx] = { ...this.visitors[idx], status: 'Completed' };
        this.visitors = [...this.visitors];
      }
    }
    this.closeCheckOutModal();
  }

  // ───────────────── APPROVE / REJECT ─────────────────
  approveVisitor(visitor: any): void {
    console.log('Approved:', visitor.id);
    this.closeViewModal();
  }

  rejectVisitor(visitor: any): void {
    console.log('Rejected:', visitor.id);
    this.closeViewModal();
  }

  printPass(visitor: any): void {
    window.print();
  }
}