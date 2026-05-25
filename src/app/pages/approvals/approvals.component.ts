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
  purpose: string;
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
  activeFilter = signal<'All' | VisitorStatus>('All');
  viewMode = signal<'list' | 'grid'>('list');
  showDateFilter = signal(false);
  dateFrom = signal('');
  dateTo = signal('');

  // ───────────────── DROPDOWN ─────────────────
  openDropdownId: string | null = null;

  toggleDropdown(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openDropdownId = null;
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

  // printVisitor(): void {
  //   window.print();
  // }

visitors = signal<Visitor[]>([
  {
    id: 'A45',
    name: 'Amit Patel',
    photo: '',
    status: 'Approved',
    phone: '+91 9988776655',
    date: 'May 14, 2026',
    time: '14:59',
    company: 'Cloud Services Ltd',
    purpose: 'Technical Support - Server Maintenance',
    department: 'Engineering',
    teamMembers: 1,
    devices: 1
  },
  {
    id: 'A46',
    name: 'Rahul Sharma',
    photo: '',
    status: 'Approved',
    phone: '+91 9876543210',
    date: 'May 14, 2026',
    time: '10:30',
    company: 'Infosys',
    purpose: 'Client Meeting',
    department: 'IT',
    devices: 2
  },
  {
    id: 'A47',
    name: 'Priya Reddy',
    photo: '',
    status: 'Approved',
    phone: '+91 9123456789',
    date: 'May 14, 2026',
    time: '11:15',
    company: 'TCS',
    purpose: 'Interview',
    department: 'HR',
    teamMembers: 1
  },
  {
    id: 'A48',
    name: 'Kiran Kumar',
    photo: '',
    status: 'Approved',
    phone: '+91 9988665544',
    date: 'May 13, 2026',
    time: '16:00',
    company: 'Wipro',
    purpose: 'Project Discussion',
    department: 'Management'
  },

  // Random Approved Data
  {
    id: 'A49',
    name: 'Sneha Verma',
    photo: '',
    status: 'Approved',
    phone: '+91 9011223344',
    date: 'May 15, 2026',
    time: '09:45',
    company: 'Capgemini',
    purpose: 'Vendor Meeting',
    department: 'Procurement',
    teamMembers: 2,
    devices: 1
  },
  {
    id: 'A50',
    name: 'Arjun Nair',
    photo: '',
    status: 'Approved',
    phone: '+91 9345678901',
    date: 'May 15, 2026',
    time: '12:20',
    company: 'Tech Mahindra',
    purpose: 'System Audit',
    department: 'Security',
    devices: 2
  },
  {
    id: 'A51',
    name: 'Divya Singh',
    photo: '',
    status: 'Approved',
    phone: '+91 9556677889',
    date: 'May 15, 2026',
    time: '03:10',
    company: 'HCL Technologies',
    purpose: 'Training Session',
    department: 'Learning & Development',
    teamMembers: 3
  },
  {
    id: 'A52',
    name: 'Vikram Rao',
    photo: '',
    status: 'Approved',
    phone: '+91 9786543211',
    date: 'May 16, 2026',
    time: '11:00',
    company: 'Oracle India',
    purpose: 'Business Presentation',
    department: 'Sales',
    devices: 1
  },

]);

  filters: Array<{ label: string; value: 'All' | VisitorStatus }> = [
    { label: 'All',       value: 'All'       },
    { label: 'Pending',   value: 'Pending'   },
    { label: 'Approved',  value: 'Approved'  },
    { label: 'Active',    value: 'Active'    },
    { label: 'Done',      value: 'Completed' }
  ];

  filteredVisitors = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const filter = this.activeFilter();
    return this.visitors().filter(v => {
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        v.company.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q);
      const matchesFilter = filter === 'All' || v.status === filter;
      return matchesSearch && matchesFilter;
    });
  });

  stats = computed(() => ({
    total:   this.visitors().length,
    pending: this.visitors().filter(v => v.status === 'Pending').length,
    active:  this.visitors().filter(v => v.status === 'Active').length,
    done:    this.visitors().filter(v => v.status === 'Completed').length,
    staff: 0
  }));

  getFilterCount(value: 'All' | VisitorStatus): number {
    if (value === 'All') return this.visitors().length;
    return this.visitors().filter(v => v.status === value).length;
  }

  getFilterLabel(f: { label: string; value: 'All' | VisitorStatus }): string {
    return `${f.label} (${this.getFilterCount(f.value)})`;
  }

  setFilter(v: 'All' | VisitorStatus) { this.activeFilter.set(v); }
  setSearch(val: string)               { this.searchQuery.set(val); }
  setView(mode: 'list' | 'grid')       { this.viewMode.set(mode); }
  toggleDateFilter()                   { this.showDateFilter.update(v => !v); }

  exportData() {
    const rows = this.filteredVisitors().map(v =>
      `${v.id},${v.name},${v.phone},${v.company},${v.department},${v.date} ${v.time},${v.status}`
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

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getStatusClass(status: VisitorStatus): string {
    return status.toLowerCase();
  }

  openNewVisitor() {
    alert('Open New Visitor form');
  }
}




