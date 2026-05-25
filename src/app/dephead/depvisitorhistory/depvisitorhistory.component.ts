import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

export interface Visitor {
  id: number;
  name: string;
  avatar?: string;
  purpose: string;
  visitDate: Date;
  inTime: string;
  outTime: string;
  status: 'Completed' | 'Rejected' | 'Pending';
  comments?: number;
}

@Component({
  selector: 'app-depvisitorhistory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depvisitorhistory.component.html',
  styleUrls: ['./depvisitorhistory.component.scss']
})
export class DepvisitorhistoryComponent implements OnInit, OnDestroy {

  visitors: Visitor[] = [];

  allVisitors: Visitor[] = [
    {
      id: 1,
      name: 'Rahul Kumar',
      purpose: 'Business Meeting - Product Review',
      avatar: '',
      visitDate: new Date('2026-02-06'),
      inTime: '11:12',
      outTime: '13:12',
      status: 'Completed',
      comments: 1
    },
    {
      id: 2,
      name: 'Priya Sharma',
      purpose: 'Interview - Frontend Developer',
      avatar: '',
      visitDate: new Date('2026-02-05'),
      inTime: '09:30',
      outTime: '11:00',
      status: 'Completed',
      comments: 0
    },
    {
      id: 3,
      name: 'Amit Verma',
      purpose: 'Delivery - Office Supplies',
      avatar: '',
      visitDate: new Date('2026-02-04'),
      inTime: '14:00',
      outTime: '14:30',
      status: 'Completed',
      comments: 2
    },
    {
      id: 4,
      name: 'Sneha Patel',
      purpose: 'Vendor Meeting - IT Services',
      avatar: '',
      visitDate: new Date('2026-02-03'),
      inTime: '10:00',
      outTime: '11:30',
      status: 'Rejected',
      comments: 1
    },
    {
      id: 5,
      name: 'Karan Singh',
      purpose: 'Client Visit - Sales Demo',
      avatar: '',
      visitDate: new Date('2026-02-02'),
      inTime: '15:00',
      outTime: '16:00',
      status: 'Completed',
      comments: 0
    }
  ];

  viewMode: 'list' | 'grid' = 'list';
  showFilter = false;
  selectedVisitor: Visitor | null = null;
  showModal = false;

  filterName = '';
  filterStatus = '';
  filterDateFrom = '';
  filterDateTo = '';

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.visitors = [...this.allVisitors];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalRecords(): number {
    return this.visitors.length;
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  setView(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  applyFilter(): void {

    this.visitors = this.allVisitors.filter(visitor => {

      const matchName =
        !this.filterName ||
        visitor.name.toLowerCase().includes(this.filterName.toLowerCase());

      const matchStatus =
        !this.filterStatus ||
        visitor.status === this.filterStatus;

      const visitorDate = new Date(visitor.visitDate);

      const matchFrom =
        !this.filterDateFrom ||
        visitorDate >= new Date(this.filterDateFrom);

      const matchTo =
        !this.filterDateTo ||
        visitorDate <= new Date(this.filterDateTo);

      return matchName && matchStatus && matchFrom && matchTo;
    });
  }

  resetFilter(): void {
    this.filterName = '';
    this.filterStatus = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';

    this.visitors = [...this.allVisitors];
  }

  viewDetails(visitor: Visitor): void {
    this.selectedVisitor = visitor;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedVisitor = null;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getStatusClass(status: string): string {

    switch (status) {

      case 'Completed':
        return 'status-completed';

      case 'Rejected':
        return 'status-rejected';

      case 'Pending':
        return 'status-pending';

      default:
        return '';
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(date);
  }

}