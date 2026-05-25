import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from '../register/register.component';

export interface Visitor {
  id: string;
  name: string;
  initials?: string;
  avatarColor?: string;
  contact?: string;
  company: string;
  department: string;
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
  selector: 'app-activevisits',
  standalone: true,
  imports: [CommonModule, FormsModule, RegisterComponent],
  templateUrl: './activevisits.component.html',
  styleUrl: './activevisits.component.scss'
})
export class ActivevisitsComponent {

  activeFilter = 'All';
  searchText = '';

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

  printVisitor(): void {
    window.print();
  }

  // ───────────────── STAT CARDS ─────────────────
  statCards: StatCard[] = [
    { label: 'Total',   value: 4, icon: 'total',   iconColor: '#64748b' },
    { label: 'Pending', value: 2, icon: 'pending',  iconColor: '#f97316' },
    { label: 'Active',  value: 1, icon: 'active',   iconColor: '#16a34a' },
    { label: 'Done',    value: 1, icon: 'done',     iconColor: '#3b82f6' },
    { label: 'Staff',   value: 0, icon: 'staff',    iconColor: '#8b5cf6', isSpecial: true },
  ];

  // ───────────────── VISITORS DATA ─────────────────
visitors: Visitor[] = [
  {
    id: 'A43',
    name: 'Rahul Kumar',
    initials: 'RK',
    avatarColor: '#f97316',
    contact: '+91 9876543210',
    company: 'Tech Solutions Pvt Ltd',
    department: 'Engineering',
    date: 'Feb 06, 2026',
    time: '11:12',
    status: 'Active',
    hasAvatar: true
  },
  {
    id: 'A44',
    name: 'Priya Sharma',
    initials: 'PS',
    avatarColor: '#ec4899',
    contact: '+91 9123456789',
    company: 'Design Studio Inc',
    department: 'Human Resources',
    date: 'Feb 06, 2026',
    time: '09:00',
    status: 'Active',
    hasAvatar: true
  },

  // Random Active Data
  {
    id: 'A45',
    name: 'Arjun Mehta',
    initials: 'AM',
    avatarColor: '#3b82f6',
    contact: '+91 9988771122',
    company: 'Innovatech Pvt Ltd',
    department: 'IT',
    date: 'Mar 01, 2026',
    time: '10:30',
    status: 'Active',
    hasAvatar: true
  },
  {
    id: 'A46',
    name: 'Sneha Reddy',
    initials: 'SR',
    avatarColor: '#14b8a6',
    contact: '+91 9876501234',
    company: 'Bright Solutions',
    department: 'Marketing',
    date: 'Mar 02, 2026',
    time: '01:15',
    status: 'Active',
    hasAvatar: true
  },
  {
    id: 'A47',
    name: 'Kiran Kumar',
    initials: 'KK',
    avatarColor: '#8b5cf6',
    contact: '+91 9011223344',
    company: 'Alpha Tech',
    department: 'Finance',
    date: 'Mar 03, 2026',
    time: '03:45',
    status: 'Active',
    hasAvatar: true
  },
  {
    id: 'A48',
    name: 'Divya Nair',
    initials: 'DN',
    avatarColor: '#f43f5e',
    contact: '+91 9345678901',
    company: 'Creative Labs',
    department: 'Design',
    date: 'Mar 04, 2026',
    time: '09:20',
    status: 'Active',
    hasAvatar: true
  },
  {
    id: 'A49',
    name: 'Rohit Sharma',
    initials: 'RS',
    avatarColor: '#22c55e',
    contact: '+91 9556677889',
    company: 'SecureNet',
    department: 'Security',
    date: 'Mar 05, 2026',
    time: '11:10',
    status: 'Active',
    hasAvatar: true
  },
  {
    id: 'A50',
    name: 'Anjali Verma',
    initials: 'AV',
    avatarColor: '#eab308',
    contact: '+91 9786543211',
    company: 'EduSmart',
    department: 'Training',
    date: 'Mar 06, 2026',
    time: '02:40',
    status: 'Active',
    hasAvatar: true
  },
  {
    id: 'A51',
    name: 'Vikram Singh',
    initials: 'VS',
    avatarColor: '#06b6d4',
    contact: '+91 9445566778',
    company: 'LogiMove Pvt Ltd',
    department: 'Operations',
    date: 'Mar 07, 2026',
    time: '04:55',
    status: 'Active',
    hasAvatar: true
  }
];
  // ───────────────── FILTERS ─────────────────
  filters = ['All', 'Pending', 'Approved', 'Active', 'Completed'];
  activeFilterIndex = 0;

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

  setFilter(index: number): void {
    this.activeFilterIndex = index;
  }

  showRegisterPopup: boolean = false;

  openNewVisitor(): void {
    this.showRegisterPopup = true;
  }

  closeRegisterPopup(): void {
    this.showRegisterPopup = false;
  }
}