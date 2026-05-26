import { Component, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.scss'
})
export class ApprovalsComponent {

  searchQuery = signal('');
  activeFilterIndex = 2;

  // ── Dropdown ──────────────────────────
  openDropdownId: string | null = null;

  toggleDropdown(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openDropdownId = null;
  }

  // ── View Modal ────────────────────────
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

  // ── Visitors Data ─────────────────────
visitors = signal<Visitor[]>([
  { id: 'A45', name: 'Amit Patel',      photo: '', status: 'Approved', phone: '+91 9988776655', date: 'May 14, 2026', time: '14:59', company: 'Cloud Services Ltd', personToMeet: 'Ravi Menon',     department: 'Engineering',  teamMembers: 1, devices: 1 },
  { id: 'A47', name: 'Priya Reddy',     photo: '', status: 'Approved', phone: '+91 9123456789', date: 'May 14, 2026', time: '11:15', company: 'TCS',                personToMeet: 'Deepak Nair',    department: 'HR',           teamMembers: 1 },
  { id: 'A50', name: 'Arjun Nair',      photo: '', status: 'Approved', phone: '+91 9345678901', date: 'May 15, 2026', time: '12:20', company: 'Tech Mahindra',      personToMeet: 'Kavitha Iyer',   department: 'Security',     devices: 2 },
  { id: 'A53', name: 'Meena Pillai',    photo: '', status: 'Approved', phone: '+91 9812345670', date: 'May 16, 2026', time: '09:00', company: 'Accenture',          personToMeet: 'Rohit Desai',    department: 'Finance',      teamMembers: 2, devices: 1 },
  { id: 'A54', name: 'Suresh Babu',     photo: '', status: 'Approved', phone: '+91 9723456781', date: 'May 16, 2026', time: '10:15', company: 'IBM India',          personToMeet: 'Pradeep Kumar',  department: 'IT',           devices: 1 },
  { id: 'A55', name: 'Lakshmi Nair',    photo: '', status: 'Approved', phone: '+91 9634567892', date: 'May 17, 2026', time: '11:30', company: 'Deloitte',           personToMeet: 'Anand Sharma',   department: 'Audit',        teamMembers: 3 },
  { id: 'A56', name: 'Rajesh Menon',    photo: '', status: 'Approved', phone: '+91 9545678903', date: 'May 17, 2026', time: '13:00', company: 'Cognizant',          personToMeet: 'Shalini Verma',  department: 'Engineering',  devices: 2 },
  { id: 'A57', name: 'Anjali Gupta',    photo: '', status: 'Approved', phone: '+91 9456789014', date: 'May 17, 2026', time: '14:30', company: 'Microsoft India',    personToMeet: 'Vijay Nair',     department: 'Sales',        teamMembers: 1, devices: 1 },
  { id: 'A58', name: 'Manoj Iyer',      photo: '', status: 'Approved', phone: '+91 9367890125', date: 'May 18, 2026', time: '09:45', company: 'Google India',       personToMeet: 'Rekha Pillai',   department: 'Marketing',    devices: 1 },
  { id: 'A59', name: 'Kavya Krishnan',  photo: '', status: 'Approved', phone: '+91 9278901236', date: 'May 18, 2026', time: '11:00', company: 'Amazon India',       personToMeet: 'Sunil Mehta',    department: 'Procurement',  teamMembers: 2 },
]);

  // ── Filters ───────────────────────────
  filters = ['All', 'Pending', 'Approved', 'Active', 'Completed'];

  setFilter(index: number): void {
    this.activeFilterIndex = index;
  }

  getFilterCount(filter: string): number {
    if (filter === 'All') return this.visitors().length;
    return this.visitors().filter(v => v.status === filter).length;
  }

  filteredVisitors = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const filter = this.filters[this.activeFilterIndex];

    return this.visitors().filter(v => {
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        v.company.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        v.personToMeet.toLowerCase().includes(q) ||
        v.department.toLowerCase().includes(q);

      const matchesFilter = filter === 'All' || v.status === filter;
      return matchesSearch && matchesFilter;
    });
  });

  setSearch(val: string): void {
    this.searchQuery.set(val);
  }

  // ── Actions ───────────────────────────
  approveVisitor(visitor: Visitor): void {
    this.visitors.update(list =>
      list.map(v => v.id === visitor.id ? { ...v, status: 'Approved' as VisitorStatus } : v)
    );
  }

  rejectVisitor(visitor: Visitor): void {
    this.visitors.update(list =>
      list.map(v => v.id === visitor.id ? { ...v, status: 'Completed' as VisitorStatus } : v)
    );
  }

  exportData(): void {
    const rows = this.filteredVisitors().map(v =>
      `${v.id},${v.name},${v.phone},${v.company},${v.department},${v.personToMeet},${v.date} ${v.time},${v.status}`
    );
    const csv = `ID,Name,Contact,Company,Department,Person To Meet,Date & Time,Status\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'approvals.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getStatusClass(status: VisitorStatus): string {
    return status.toLowerCase();
  }
}