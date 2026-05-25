import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface VisitorDetail {
  visitID: string;
  visitorID_Display: string;
  visitorName: string;
  contact: string;
  company: string;
  department: string;
  personToMeet: string;
  purposeOfVisit: string;
  dateAndTime: string;
  statusLabel: 'Pending' | 'Approved' | 'Active' | 'Completed' | 'Rejected';
  approvalStatus: string;
  visitStatus: string;
  entryGate: string;
  visitType: string;
  date: string;
  time: string;
  initials: string;
}

@Component({
  selector: 'app-visitor-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visitor-details.component.html',
  styleUrls: ['./visitor-details.component.scss']
})
export class VisitorDetailsComponent implements OnInit {

  allVisitors: VisitorDetail[] = [];
  filteredVisitors: VisitorDetail[] = [];
  searchText: string = '';
  activeFilter: string = 'All';
  filters: string[] = ['All', 'Pending', 'Approved', 'Active', 'Completed'];
  loading: boolean = false;

  loggedInUserName: string = 'Shiva Prasad';
  userInitials: string = 'SP';

  selectedVisitor: VisitorDetail | null = null;
  showDetailModal: boolean = false;

  // Success popup
  showSuccessPopup: boolean = false;
  successAction: 'approved' | 'rejected' = 'approved';
  successVisitorName: string = '';

  ngOnInit(): void {
    this.loading = true;
    setTimeout(() => {
      this.allVisitors = this.getMockVisitors();
      this.applyFilter();
      this.loading = false;
    }, 800);
  }

  getMockVisitors(): VisitorDetail[] {
    return [
      {
        visitID: 'V001',
        visitorID_Display: 'A001',
        visitorName: 'Bhanu Prakash',
        contact: '9966378902',
        company: 'TCS',
        department: 'Ash Handling Plant',
        personToMeet: 'Shiva Prasad',
        purposeOfVisit: 'Business Meeting',
        dateAndTime: '2026-05-25T10:12:00',
        statusLabel: 'Pending',
        approvalStatus: 'Pending',
        visitStatus: 'Scheduled',
        entryGate: 'Gate A - Main Entrance',
        visitType: 'Single Day',
        date: '25 May 2026',
        time: '10:12 am',
        initials: 'BP'
      },
      {
        visitID: 'V002',
        visitorID_Display: 'A002',
        visitorName: 'Rama Laxmi',
        contact: '9966378910',
        company: 'WNS',
        department: 'Electrical',
        personToMeet: 'Shiva Prasad',
        purposeOfVisit: 'Project Discussion',
        dateAndTime: '2026-05-24T14:30:00',
        statusLabel: 'Approved',
        approvalStatus: 'Approved',
        visitStatus: 'Checked In',
        entryGate: 'Gate B - Side Entrance',
        visitType: 'Single Day',
        date: '24 May 2026',
        time: '02:30 pm',
        initials: 'RL'
      },
      {
        visitID: 'V003',
        visitorID_Display: 'A003',
        visitorName: 'Karun Kumar',
        contact: '8885523910',
        company: 'Infosys',
        department: 'C&I',
        personToMeet: 'Shiva Prasad',
        purposeOfVisit: 'Vendor Audit',
        dateAndTime: '2026-05-23T09:00:00',
        statusLabel: 'Active',
        approvalStatus: 'Approved',
        visitStatus: 'Active',
        entryGate: 'Gate A - Main Entrance',
        visitType: 'Multiple Days',
        date: '23 May 2026',
        time: '09:00 am',
        initials: 'KK'
      },
      {
        visitID: 'V004',
        visitorID_Display: 'A004',
        visitorName: 'Priya Sharma',
        contact: '7700112233',
        company: 'Wipro',
        department: 'HR',
        personToMeet: 'Shiva Prasad',
        purposeOfVisit: 'Interview Panel',
        dateAndTime: '2026-05-22T11:00:00',
        statusLabel: 'Completed',
        approvalStatus: 'Approved',
        visitStatus: 'Checked Out',
        entryGate: 'Gate C - Back Entrance',
        visitType: 'Single Day',
        date: '22 May 2026',
        time: '11:00 am',
        initials: 'PS'
      },
      {
        visitID: 'V005',
        visitorID_Display: 'A005',
        visitorName: 'Ravi Teja',
        contact: '9876543210',
        company: 'HCL',
        department: 'Ash Handling Plant',
        personToMeet: 'Shiva Prasad',
        purposeOfVisit: 'Equipment Inspection',
        dateAndTime: '2026-05-25T15:45:00',
        statusLabel: 'Pending',
        approvalStatus: 'Pending',
        visitStatus: 'Scheduled',
        entryGate: 'Gate A - Main Entrance',
        visitType: 'Single Day',
        date: '25 May 2026',
        time: '03:45 pm',
        initials: 'RT'
      },
      {
        visitID: 'V006',
        visitorID_Display: 'A006',
        visitorName: 'Anitha Reddy',
        contact: '9123456780',
        company: 'Capgemini',
        department: 'Finance',
        personToMeet: 'Shiva Prasad',
        purposeOfVisit: 'Contract Signing',
        dateAndTime: '2026-05-21T13:00:00',
        statusLabel: 'Pending',
        approvalStatus: 'Pending',
        visitStatus: 'Scheduled',
        entryGate: 'Gate B - Side Entrance',
        visitType: 'Single Day',
        date: '21 May 2026',
        time: '01:00 pm',
        initials: 'AR'
      }
    ];
  }

  applyFilter(): void {
    let data = [...this.allVisitors];
    if (this.activeFilter !== 'All') {
      data = data.filter(v => v.statusLabel === this.activeFilter);
    }
    if (this.searchText.trim()) {
      const s = this.searchText.toLowerCase();
      data = data.filter(v =>
        v.visitorName.toLowerCase().includes(s)    ||
        v.company.toLowerCase().includes(s)        ||
        v.contact.toLowerCase().includes(s)        ||
        v.purposeOfVisit.toLowerCase().includes(s)
      );
    }
    this.filteredVisitors = data;
  }

  setFilter(f: string): void {
    this.activeFilter = f;
    this.applyFilter();
  }

  getCount(status: string): number {
    if (status === 'All') return this.allVisitors.length;
    return this.allVisitors.filter(v => v.statusLabel === status).length;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  openDetail(visitor: VisitorDetail): void {
    this.selectedVisitor = { ...visitor };
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedVisitor = null;
  }

  approveVisitor(): void {
    if (!this.selectedVisitor) return;
    const idx = this.allVisitors.findIndex(v => v.visitID === this.selectedVisitor!.visitID);
    if (idx !== -1) {
      this.allVisitors[idx].statusLabel    = 'Approved';
      this.allVisitors[idx].approvalStatus = 'Approved';
    }
    this.successAction      = 'approved';
    this.successVisitorName = this.selectedVisitor.visitorName;
    this.showDetailModal    = false;
    this.selectedVisitor    = null;
    this.applyFilter();
    this.showSuccessPopup   = true;
    setTimeout(() => { this.showSuccessPopup = false; }, 3500);
  }

  rejectVisitor(): void {
    if (!this.selectedVisitor) return;
    const idx = this.allVisitors.findIndex(v => v.visitID === this.selectedVisitor!.visitID);
    if (idx !== -1) {
      this.allVisitors[idx].statusLabel    = 'Completed';
      this.allVisitors[idx].approvalStatus = 'Rejected';
    }
    this.successAction      = 'rejected';
    this.successVisitorName = this.selectedVisitor.visitorName;
    this.showDetailModal    = false;
    this.selectedVisitor    = null;
    this.applyFilter();
    this.showSuccessPopup   = true;
    setTimeout(() => { this.showSuccessPopup = false; }, 3500);
  }

  closeSuccessPopup(): void {
    this.showSuccessPopup = false;
  }
}