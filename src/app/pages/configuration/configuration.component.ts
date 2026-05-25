import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfigCard {
  id: string;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
  icon: string; // svg path key
  route?: string;
}

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss'
})
export class ConfigurationComponent {
 activeCard = signal<string | null>(null);

  cards: ConfigCard[] = [
    {
      id: 'departments',
      title: 'Departments',
      description: 'Manage departments and department heads',
      iconBg: '#fff4e6',
      iconColor: '#e8440a',
      icon: 'departments'
    },
    {
      id: 'users',
      title: 'Users',
      description: 'Manage user accounts and permissions',
      iconBg: '#e8f0fe',
      iconColor: '#1a73e8',
      icon: 'users'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure notification preferences',
      iconBg: '#e6f9f0',
      iconColor: '#0f9d58',
      icon: 'notifications'
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Security and access control settings',
      iconBg: '#f3e8ff',
      iconColor: '#9333ea',
      icon: 'security'
    },
    {
      id: 'data-management',
      title: 'Data Management',
      description: 'Backup and data retention settings',
      iconBg: '#fee2e2',
      iconColor: '#ef4444',
      icon: 'data'
    },
    {
      id: 'general-settings',
      title: 'General Settings',
      description: 'General system configuration options',
      iconBg: '#fef9c3',
      iconColor: '#ca8a04',
      icon: 'settings'
    }
  ];

  onCardClick(card: ConfigCard) {
    this.activeCard.set(card.id);
    // Emit navigation event or handle routing here
    console.log('Navigate to:', card.id);
  }

}
