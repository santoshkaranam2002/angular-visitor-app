import { Component, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from '../register/register.component';

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
  selector: 'app-activevisits',
  standalone: true,
  imports: [CommonModule, FormsModule, RegisterComponent],
  templateUrl: './activevisits.component.html',
  styleUrl: './activevisits.component.scss'
})
export class ActivevisitsComponent {

  searchQuery = signal('');
  activeFilterIndex = 0;

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

  // ── Register Popup ────────────────────
  showRegisterPopup = false;

  openNewVisitor(): void { this.showRegisterPopup = true; }
  closeRegisterPopup(): void { this.showRegisterPopup = false; }

  // ── Visitors Data ─────────────────────
  visitors = signal<Visitor[]>([
    { id: 'A43', name: 'Rahul Kumar',  photo: '', status: 'Active', phone: '+91 9876543210', date: 'May 26, 2026', time: '11:12', company: 'Tech Solutions Pvt Ltd', personToMeet: 'Sanjay Mehta',  department: 'Engineering', teamMembers: 1 },
  { id: 'A44', name: 'Priya Sharma', photo: '', status: 'Active', phone: '+91 9123456789', date: 'May 26, 2026', time: '09:00', company: 'Design Studio Inc',      personToMeet: 'Rekha Iyer',    department: 'HR',          devices: 1 },
  { id: 'A45', name: 'Arjun Mehta',  photo: '', status: 'Active', phone: '+91 9988771122', date: 'May 26, 2026', time: '10:30', company: 'Innovatech Pvt Ltd',     personToMeet: 'Deepak Nair',   department: 'IT',          devices: 2 },
  { id: 'A46', name: 'Sneha Reddy',  photo: '', status: 'Active', phone: '+91 9876501234', date: 'May 26, 2026', time: '11:15', company: 'Bright Solutions',       personToMeet: 'Kavitha Rao',   department: 'Marketing',   teamMembers: 2 },
  { id: 'A47', name: 'Kiran Kumar',  photo: '', status: 'Active', phone: '+91 9011223344', date: 'May 26, 2026', time: '13:45', company: 'Alpha Tech',             personToMeet: 'Anand Pillai',  department: 'Finance',     devices: 1 },
  { id: 'A48', name: 'Divya Nair',   photo: '', status: 'Active', phone: '+91 9345678901', date: 'May 26, 2026', time: '09:20', company: 'Creative Labs',          personToMeet: 'Suresh Babu',   department: 'Design',      teamMembers: 1, devices: 1 },
  { id: 'A49', name: 'Rohit Sharma', photo: '', status: 'Active', phone: '+91 9556677889', date: 'May 26, 2026', time: '11:10', company: 'SecureNet',              personToMeet: 'Manoj Tiwari',  department: 'Security',    teamMembers: 2 },
  { id: 'A50', name: 'Anjali Verma', photo: '', status: 'Active', phone: '+91 9786543211', date: 'May 25, 2026', time: '14:40', company: 'EduSmart',               personToMeet: 'Nandini Rao',   department: 'Training',    devices: 1 },
  { id: 'A51', name: 'Vikram Singh', photo: '', status: 'Active', phone: '+91 9445566778', date: 'May 25, 2026', time: '10:55', company: 'LogiMove Pvt Ltd',       personToMeet: 'Harish Reddy',  department: 'Operations',  teamMembers: 1 },
  ]);

  // ── Filters ───────────────────────────
  filters = ['All', 'Pending', 'Active', 'Completed'];

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

  exportData(): void {
    const rows = this.filteredVisitors().map(v =>
      `${v.id},${v.name},${v.phone},${v.company},${v.department},${v.personToMeet},${v.date} ${v.time},${v.status}`
    );
    const csv = `ID,Name,Contact,Company,Department,Person To Meet,Date & Time,Status\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'active-visitors.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}