import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


export interface ActiveVisitor {
  id: number;
  name: string;
  company: string;
  avatarUrl?: string;
  purpose: string;
  inTime: string;
  inDate: string;
  outTime?: string;
  securityGate: string;
  visitStatus: 'Checked-In' | 'Checked-Out' | 'Pending';
}



@Component({
  selector: 'app-depactivevisitors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './depactivevisitors.component.html',
  styleUrl: './depactivevisitors.component.scss'
})
export class DepactivevisitorsComponent {
  visitors: ActiveVisitor[] = [
    {
      id: 1,
      name: 'Priya Sharma',
      company: 'Design Studio Inc',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
      purpose: 'Interview - Senior Designer Position',
      inTime: '09:00',
      inDate: 'Feb 06',
      outTime: undefined,
      securityGate: 'Gate B - Side Entrance',
      visitStatus: 'Checked-In'
    },
    {
      id: 2,
      name: 'Rahul Verma',
      company: 'Tech Corp Ltd',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      purpose: 'Client Meeting - Q2 Review',
      inTime: '10:30',
      inDate: 'Feb 06',
      outTime: undefined,
      securityGate: 'Gate A - Main Entrance',
      visitStatus: 'Checked-In'
    }
  ];

  // Modal state
  selectedVisitor: ActiveVisitor | null = null;
  showModal = false;
  showCheckoutConfirm = false;

  get insideCount(): number {
    return this.visitors.filter(v => v.visitStatus === 'Checked-In').length;
  }

  onDetails(visitor: ActiveVisitor): void {
    this.selectedVisitor = visitor;
    this.showModal = true;
    this.showCheckoutConfirm = false;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedVisitor = null;
    this.showCheckoutConfirm = false;
    document.body.style.overflow = '';
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  confirmCheckout(): void {
    this.showCheckoutConfirm = true;
  }

  cancelCheckout(): void {
    this.showCheckoutConfirm = false;
  }

  doCheckout(visitor: ActiveVisitor): void {
    const now = new Date();
    visitor.outTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    visitor.visitStatus = 'Checked-Out';
    this.showCheckoutConfirm = false;
  }

  onCheckout(visitor: ActiveVisitor): void {
    const now = new Date();
    visitor.outTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    visitor.visitStatus = 'Checked-Out';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace('-', '');
  }
}
