import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from 'src/app/services/visitor.service';

export type VisitorStatus = 'Pending' | 'Approved' | 'Active' | 'Completed';

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
export class AllvisitorsComponent implements OnInit {

  searchQuery = signal('');
  activeFilter = signal<'All' | VisitorStatus>('All');
  showNewVisitorModal = signal(false);
  selectedVisitor = signal<Visitor | null>(null);

  visitors = signal<Visitor[]>([]);

  filters: Array<{ label: string; value: 'All' | VisitorStatus }> = [
    { label: 'All',       value: 'All'       },
    { label: 'Pending',   value: 'Pending'   },
    { label: 'Approved',  value: 'Approved'  },
    { label: 'Active',    value: 'Active'    },
    { label: 'Completed', value: 'Completed' }
  ];

  private avatarSeeds: Map<string, number> = new Map();
  private seedCounter = 1;

  constructor(private visitorService: VisitorService) {}

  ngOnInit(): void {
    this.getAllVisitors();
  }

  getAllVisitors(): void {
    this.visitorService.getVisitorDashboard().subscribe({
      next: (res: any) => {
        const rawList = res?.response?.visitors || [];

        const mapped: Visitor[] = rawList.map((item: any) => {
          const visitDate = new Date(item.dateAndTime);

          const dateStr = visitDate.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
          });
          const timeStr = visitDate.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
          });

          return {
            id:          item.visitorID_Display || item.visitorID,
            name:        item.visitorName,
            photo:       item.photo || '',
            status:      this.mapStatus(item.statusLabel),
            phone:       item.contact,
            date:        `${dateStr} ${timeStr}`,
            company:     item.company,
            purpose:     item.personToMeet || '',
            department:  item.department,
            teamMembers: item.teamMembers ?? undefined,
            devices:     item.devices ?? undefined
          };
        });

        this.visitors.set(mapped);
      },
      error: (err) => {
        console.error('Get All Visitors Error:', err);
      }
    });
  }

  mapStatus(statusLabel: string): VisitorStatus {
    const map: Record<string, VisitorStatus> = {
      'pending':   'Pending',
      'approved':  'Approved',
      'active':    'Active',
      'completed': 'Completed',
      'done':      'Completed'
    };
    return map[statusLabel?.toLowerCase()] || 'Pending';
  }

  filteredVisitors = computed(() => {
    const q      = this.searchQuery().toLowerCase().trim();
    const filter = this.activeFilter();

    return this.visitors().filter(v => {
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        v.company.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        v.purpose.toLowerCase().includes(q) ||
        v.department.toLowerCase().includes(q);

      const matchesFilter = filter === 'All' || v.status === filter;
      return matchesSearch && matchesFilter;
    });
  });

  getCount(status: 'All' | VisitorStatus): number {
    if (status === 'All') return this.visitors().length;
    return this.visitors().filter(v => v.status === status).length;
  }

  setFilter(filter: 'All' | VisitorStatus) { this.activeFilter.set(filter); }
  setSearch(value: string)                 { this.searchQuery.set(value);   }

  viewVisitor(visitor: Visitor)  { this.selectedVisitor.set(visitor); }
  closeVisitorDetail()           { this.selectedVisitor.set(null);    }

  openNewVisitor() { this.showNewVisitorModal.set(true);  }
  closeModal()     { this.showNewVisitorModal.set(false); }

  checkout(visitor: Visitor) {
    this.visitors.update(list =>
      list.map(v =>
        v.id === visitor.id ? { ...v, status: 'Completed' as VisitorStatus } : v
      )
    );
  }

  exportData() {
    const data = this.filteredVisitors()
      .map(v => `${v.id},${v.name},${v.status},${v.phone},${v.company},${v.department},${v.purpose}`)
      .join('\n');

    const blob = new Blob(
      [`ID,Name,Status,Phone,Company,Department,Person To Meet\n${data}`],
      { type: 'text/csv' }
    );

    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = 'visitors.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  getAvatarUrl(id: string): string {
    if (!this.avatarSeeds.has(id)) {
      this.avatarSeeds.set(id, this.seedCounter++);
    }
    const seed   = this.avatarSeeds.get(id)!;
    const gender = seed % 2 === 0 ? 'women' : 'men';
    const num    = (seed % 70) + 1;
    return `https://randomuser.me/api/portraits/${gender}/${num}.jpg`;
  }

  getStatusClass(status: VisitorStatus): string { return status.toLowerCase(); }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}