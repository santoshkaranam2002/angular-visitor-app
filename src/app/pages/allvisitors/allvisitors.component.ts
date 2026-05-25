import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type VisitorStatus =
  | 'Pending'
  | 'Approved'
  | 'Active'
  | 'Completed';

export interface Visitor {
  id: string;
  name: string;
  photo: string;
  status: VisitorStatus;
  phone: string;
  date: string;
  company: string;
  purpose: string;
  department: string;
  teamMembers?: number;
  devices?: number;
}

@Component({
  selector: 'app-allvisitors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './allvisitors.component.html',
  styleUrl: './allvisitors.component.scss'
})
export class AllvisitorsComponent {

  searchQuery = signal('');
  activeFilter = signal<'All' | VisitorStatus>('All');
  showNewVisitorModal = signal(false);

  visitors = signal<Visitor[]>([
    {
      id: 'A43',
      name: 'Rahul Kumar',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      status: 'Completed',
      phone: '+91 9876543210',
      date: 'Feb 06, 2026 11:12',
      company: 'Tech Solutions Pvt Ltd',
      purpose: 'Business Meeting - Product Demonstration',
      department: 'Engineering',
      devices: 1
    },
    {
      id: 'A44',
      name: 'Priya Sharma',
      photo: 'https://randomuser.me/api/portraits/women/44.jpg',
      status: 'Active',
      phone: '+91 9123456789',
      date: 'Feb 06, 2026 09:00',
      company: 'Design Studio Inc',
      purpose: 'Interview - Senior Designer Position',
      department: 'Human Resources'
    },
    {
      id: 'A45',
      name: 'Amit Patel',
      photo: '',
      status: 'Pending',
      phone: '+91 9988776655',
      date: 'May 14, 2026 14:59',
      company: 'Cloud Services Ltd',
      purpose: 'Technical Support - Server Maintenance',
      department: 'Engineering',
      teamMembers: 1,
      devices: 1
    }
  ]);

  filters: Array<{ label: string; value: 'All' | VisitorStatus }> = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Active', value: 'Active' },
    { label: 'Completed', value: 'Completed' }
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

      const matchesFilter =
        filter === 'All' || v.status === filter;

      return matchesSearch && matchesFilter;
    });
  });

  getCount(status: 'All' | VisitorStatus): number {
    if (status === 'All') {
      return this.visitors().length;
    }

    return this.visitors().filter(v => v.status === status).length;
  }

  setFilter(filter: 'All' | VisitorStatus) {
    this.activeFilter.set(filter);
  }

  setSearch(value: string) {
    this.searchQuery.set(value);
  }

  checkout(visitor: Visitor) {
    this.visitors.update(list =>
      list.map(v =>
        v.id === visitor.id
          ? { ...v, status: 'Completed' as VisitorStatus }
          : v
      )
    );
  }



  openNewVisitor() {
    this.showNewVisitorModal.set(true);
  }

  closeModal() {
    this.showNewVisitorModal.set(false);
  }

  exportData() {
    const data = this.filteredVisitors()
      .map(v =>
        `${v.id},${v.name},${v.status},${v.phone},${v.company},${v.department}`
      )
      .join('\n');

    const blob = new Blob(
      [`ID,Name,Status,Phone,Company,Department\n${data}`],
      { type: 'text/csv' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'visitors.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  getStatusClass(status: VisitorStatus): string {
    return status.toLowerCase();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

// Add this signal at the top with the others
selectedVisitor = signal<Visitor | null>(null);

// Replace viewVisitor method
viewVisitor(visitor: Visitor) {
  this.selectedVisitor.set(visitor);
}

closeVisitorDetail() {
  this.selectedVisitor.set(null);
}

  
}