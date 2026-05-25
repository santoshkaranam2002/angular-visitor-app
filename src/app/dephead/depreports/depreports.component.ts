import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

export interface StatCard {
  icon: string;
  label: string;
  value: string | number;
  trend: string;
  trendPositive: boolean;
}

export interface DailyBreakdown {
  day: string;
  date: string;
  count: number;
}

export interface VisitPurpose {
  rank: number;
  label: string;
  percent: number;
  count: number;
}

export interface StatusDistribution {
  icon: string;
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

export interface WeeklySummary {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

export interface AnalyticsData {
  statCards: StatCard[];
  weeklySummary: WeeklySummary;
  dailyBreakdown: DailyBreakdown[];
  topPurposes: VisitPurpose[];
  statusDistribution: StatusDistribution[];
}

@Component({
  selector: 'app-depreports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depreports.component.html',
  styleUrls: ['./depreports.component.scss']
})
export class DepreportsComponent implements OnInit, OnDestroy {

  data!: AnalyticsData;

  showFilter = false;
  dateFrom = '';
  dateTo = '';

  private destroy$ = new Subject<void>();

  baseData: AnalyticsData = {

    statCards: [
      {
        icon: 'people',
        label: 'Total Visitors',
        value: 3,
        trend: '+12% vs last week',
        trendPositive: true
      },
      {
        icon: 'check_circle',
        label: 'Approval Rate',
        value: '100%',
        trend: '+5% improvement',
        trendPositive: true
      },
      {
        icon: 'schedule',
        label: 'Avg Approval',
        value: '30m',
        trend: '-20% faster',
        trendPositive: true
      },
      {
        icon: 'timer',
        label: 'Avg Visit',
        value: '2h 0m',
        trend: 'Duration time',
        trendPositive: true
      },
    ],

    weeklySummary: {
      total: 1,
      approved: 0,
      rejected: 0,
      pending: 1
    },

    dailyBreakdown: [
      { day: 'Mon', date: 'May 11', count: 0 },
      { day: 'Tue', date: 'May 12', count: 0 },
      { day: 'Wed', date: 'May 13', count: 0 },
      { day: 'Thu', date: 'May 14', count: 0 },
      { day: 'Fri', date: 'May 15', count: 1 },
      { day: 'Sat', date: 'May 16', count: 0 },
      { day: 'Sun', date: 'May 17', count: 0 },
    ],

    topPurposes: [
      {
        rank: 1,
        label: 'Business Meeting – Product Demonstration',
        percent: 33,
        count: 1
      },
      {
        rank: 2,
        label: 'Interview – Senior Designer Position',
        percent: 33,
        count: 1
      },
      {
        rank: 3,
        label: 'Technical Support – Server Maintenance',
        percent: 33,
        count: 1
      },
    ],

    statusDistribution: [
      {
        icon: 'schedule',
        label: 'Pending',
        count: 1,
        color: '#f97316',
        bgColor: '#fff7ed'
      },
      {
        icon: 'check_circle',
        label: 'Approved',
        count: 2,
        color: '#16a34a',
        bgColor: '#f0fdf4'
      },
      {
        icon: 'people',
        label: 'Completed',
        count: 1,
        color: '#3b82f6',
        bgColor: '#eff6ff'
      },
      {
        icon: 'cancel',
        label: 'Rejected',
        count: 0,
        color: '#dc2626',
        bgColor: '#fef2f2'
      },
    ]
  };

  ngOnInit(): void {
    this.data = { ...this.baseData };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  applyFilter(): void {

    if (!this.dateFrom && !this.dateTo) {
      this.data = { ...this.baseData };
      return;
    }

    const fromDate = this.dateFrom ? new Date(this.dateFrom) : null;
    const toDate = this.dateTo ? new Date(this.dateTo) : null;

    const allDays: DailyBreakdown[] = [
      { day: 'Mon', date: 'May 11', count: 0 },
      { day: 'Tue', date: 'May 12', count: 0 },
      { day: 'Wed', date: 'May 13', count: 0 },
      { day: 'Thu', date: 'May 14', count: 0 },
      { day: 'Fri', date: 'May 15', count: 1 },
      { day: 'Sat', date: 'May 16', count: 0 },
      { day: 'Sun', date: 'May 17', count: 0 },
    ];

    const dateMap: Record<string, string> = {
      'May 11': '2026-05-11',
      'May 12': '2026-05-12',
      'May 13': '2026-05-13',
      'May 14': '2026-05-14',
      'May 15': '2026-05-15',
      'May 16': '2026-05-16',
      'May 17': '2026-05-17',
    };

    const filtered = allDays.filter(day => {

      const currentDate = new Date(dateMap[day.date]);

      if (fromDate && currentDate < fromDate) {
        return false;
      }

      if (toDate && currentDate > toDate) {
        return false;
      }

      return true;
    });

    const totalCount = filtered.reduce(
      (sum, day) => sum + day.count,
      0
    );

    this.data = {
      ...this.baseData,
      dailyBreakdown: filtered,
      weeklySummary: {
        ...this.baseData.weeklySummary,
        total: totalCount
      }
    };
  }

  resetFilter(): void {

    this.dateFrom = '';
    this.dateTo = '';

    this.data = { ...this.baseData };
  }

  get maxDailyCount(): number {

    return Math.max(
      ...this.data.dailyBreakdown.map(day => day.count),
      1
    );
  }

  getBarWidth(count: number): number {

    if (count === 0) {
      return 0;
    }

    return Math.max(
      (count / this.maxDailyCount) * 100,
      4
    );
  }

}