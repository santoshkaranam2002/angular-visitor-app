import { Component, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type VisitStatus =
  | 'Completed'
  | 'Rejected';

export interface VisitRecord {
  id: string;
  visitorName: string;
  visitorPhone: string;
  visitorAvatar?: string;
  company: string;
  purpose: string;
  visitDate: Date;
  checkIn: string;
  checkOut: string;
  durationMin: number;
  status: VisitStatus;
}

type FilterTab = 'All' | VisitStatus;

type ViewMode = 'list' | 'grid';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {

  searchQuery = signal('');

  activeTab = signal<FilterTab>('All');

  viewMode = signal<ViewMode>('list');

  showDateFilter = signal(true);

  filterStartDate = signal('');

  filterEndDate = signal('');

  tabs: FilterTab[] = [
    'All',
    'Completed',
    'Rejected'
  ];

  records = signal<VisitRecord[]>([
    {
      id: 'V001',
      visitorName: 'Rahul Kumar',
      visitorPhone: '+91 9876543210',
      company: 'Tech Solutions Pvt Ltd',
      purpose: 'Business Meeting - Product Discussion',
      visitDate: new Date('2026-02-06'),
      checkIn: '11:12',
      checkOut: '13:12',
      durationMin: 120,
      status: 'Completed'
    },
    {
      id: 'V002',
      visitorName: 'Priya Sharma',
      visitorPhone: '+91 9123456780',
      company: 'Infosys Ltd',
      purpose: 'Interview - Software Engineer Role',
      visitDate: new Date('2026-02-10'),
      checkIn: '10:00',
      checkOut: '11:30',
      durationMin: 90,
      status: 'Completed'
    },
    {
      id: 'V003',
      visitorName: 'Arjun Mehta',
      visitorPhone: '+91 9988001122',
      company: 'Global Ventures',
      purpose: 'Sales Pitch',
      visitDate: new Date('2026-02-12'),
      checkIn: '14:00',
      checkOut: '14:20',
      durationMin: 20,
      status: 'Rejected'
    }
  ]);

  filteredRecords = computed(() => {

    let list = this.records();

    const q = this.searchQuery().toLowerCase();

    const tab = this.activeTab();

    if (q) {

      list = list.filter(r =>

        r.visitorName.toLowerCase().includes(q) ||

        r.company.toLowerCase().includes(q) ||

        r.visitorPhone.includes(q) ||

        r.purpose.toLowerCase().includes(q)
      );
    }

    if (tab !== 'All') {

      list = list.filter(r => r.status === tab);
    }

    const start = this.filterStartDate();

    const end = this.filterEndDate();

    if (start) {

      const s = this.parseDDMMYYYY(start);

      if (s) {

        list = list.filter(r => r.visitDate >= s);
      }
    }

    if (end) {

      const e = this.parseDDMMYYYY(end);

      if (e) {

        e.setHours(23, 59, 59);

        list = list.filter(r => r.visitDate <= e);
      }
    }

    return list;
  });

  totalRecords = computed(() =>
    this.records().length
  );

  completedCount = computed(() =>
    this.records().filter(r => r.status === 'Completed').length
  );

  rejectedCount = computed(() =>
    this.records().filter(r => r.status === 'Rejected').length
  );

  completedPct = computed(() =>

    this.totalRecords()

      ? Math.round(
          this.completedCount() /
          this.totalRecords() * 100
        )

      : 0
  );

  rejectedPct = computed(() =>

    this.totalRecords()

      ? Math.round(
          this.rejectedCount() /
          this.totalRecords() * 100
        )

      : 0
  );

  avgDuration = computed(() => {

    const completed = this.records().filter(
      r => r.status === 'Completed'
    );

    if (!completed.length) {
      return 0;
    }

    return Math.round(

      completed.reduce(
        (s, r) => s + r.durationMin,
        0
      ) / completed.length
    );
  });

  private parseDDMMYYYY(val: string): Date | null {

    const parts = val.split('/');

    if (parts.length !== 3) {
      return null;
    }

    const [dd, mm, yyyy] = parts;

    const d = new Date(`${yyyy}-${mm}-${dd}`);

    return isNaN(d.getTime()) ? null : d;
  }

  getTabCount(tab: FilterTab): number {

    if (tab === 'All') {
      return this.records().length;
    }

    return this.records().filter(
      r => r.status === tab
    ).length;
  }

  formatDuration(min: number): string {

    const h = Math.floor(min / 60);

    const m = min % 60;

    return `${h}h ${m}m`;
  }

  setTab(tab: FilterTab) {

    this.activeTab.set(tab);
  }

  setViewMode(mode: ViewMode) {

    this.viewMode.set(mode);
  }

  toggleDateFilter() {

    this.showDateFilter.set(
      !this.showDateFilter()
    );
  }

  onStartDateChange(val: string) {

    this.filterStartDate.set(val);
  }

  onEndDateChange(val: string) {

    this.filterEndDate.set(val);
  }

  onSearchChange(val: string) {

    this.searchQuery.set(val);
  }

  clearDates() {

    this.filterStartDate.set('');

    this.filterEndDate.set('');
  }

  exportData() {

    const data = this.filteredRecords().map(r => ({
      Name: r.visitorName,
      Phone: r.visitorPhone,
      Company: r.company,
      Purpose: r.purpose,
      Date: r.visitDate.toLocaleDateString(),
      CheckIn: r.checkIn,
      CheckOut: r.checkOut,
      Duration: this.formatDuration(r.durationMin),
      Status: r.status
    }));

    if (!data.length) {
      return;
    }

    const csv = [

      Object.keys(data[0]).join(','),

      ...data.map(row =>

        Object.values(row)
          .map(v => `"${v}"`)
          .join(',')
      )

    ].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv'
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'visit-history.csv';

    a.click();

    URL.revokeObjectURL(url);
  }

  getInitials(name: string): string {

    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

}