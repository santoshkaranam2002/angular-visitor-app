import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type Department =
  | 'All'
  | 'Engineering'
  | 'Sales'
  | 'Human Resources'
  | 'Finance'
  | 'Marketing';

export interface Staff {
  id: number;
  name: string;
  age: number;
  department: Department;
  visitorsHandled: number;
}

@Component({
  selector: 'app-depstaffmanagement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depstaffmanagement.component.html',
  styleUrls: ['./depstaffmanagement.component.scss']
})
export class DepstaffmanagementComponent {

  departments: Department[] = [
    'All',
    'Engineering',
    'Sales',
    'Human Resources',
    'Finance',
    'Marketing'
  ];

  activeDept: Department = 'All';

  searchQuery = '';

  nextId = 4;

  staffList: Staff[] = [
    {
      id: 1,
      name: 'Rahul Kumar',
      age: 28,
      department: 'Engineering',
      visitorsHandled: 45
    },
    {
      id: 2,
      name: 'Priya Sharma',
      age: 31,
      department: 'Sales',
      visitorsHandled: 30
    },
    {
      id: 3,
      name: 'Amit Verma',
      age: 35,
      department: 'Finance',
      visitorsHandled: 22
    }
  ];

  filteredStaff: Staff[] = [...this.staffList];

  showModal = false;

  isEditing = false;

  selectedStaffId: number | null = null;

  showDeleteConfirm = false;

  deleteId: number | null = null;

  formErrors: any = {};

  formData = {
    name: '',
    age: null as number | null,
    department: 'Engineering' as Department,
    visitorsHandled: 0
  };

  get totalStaff(): number {
    return this.staffList.length;
  }

  get totalDepartments(): number {
    return new Set(
      this.staffList.map(staff => staff.department)
    ).size;
  }

  get engineeringCount(): number {
    return this.countByDept('Engineering');
  }

  get salesCount(): number {
    return this.countByDept('Sales');
  }

  countByDept(dept: Department): number {

    if (dept === 'All') {
      return this.staffList.length;
    }

    return this.staffList.filter(
      staff => staff.department === dept
    ).length;
  }

  openAdd(): void {

    this.isEditing = false;

    this.formData = {
      name: '',
      age: null,
      department: 'Engineering',
      visitorsHandled: 0
    };

    this.formErrors = {};

    this.showModal = true;
  }

  openEdit(staff: Staff): void {

    this.isEditing = true;

    this.selectedStaffId = staff.id;

    this.formData = {
      name: staff.name,
      age: staff.age,
      department: staff.department,
      visitorsHandled: staff.visitorsHandled
    };

    this.formErrors = {};

    this.showModal = true;
  }

  closeModal(): void {

    this.showModal = false;
  }

  validateForm(): boolean {

    this.formErrors = {};

    if (!this.formData.name.trim()) {
      this.formErrors.name = 'Name is required';
    }

    if (!this.formData.age) {
      this.formErrors.age = 'Age is required';
    }

    if (!this.formData.department) {
      this.formErrors.department = 'Department is required';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  submitForm(): void {

    if (!this.validateForm()) {
      return;
    }

    if (this.isEditing && this.selectedStaffId !== null) {

      this.staffList = this.staffList.map(staff =>

        staff.id === this.selectedStaffId
          ? {
              id: staff.id,
              ...this.formData
            } as Staff
          : staff
      );

    } else {

      const newStaff: Staff = {
        id: this.nextId++,
        name: this.formData.name,
        age: this.formData.age || 0,
        department: this.formData.department,
        visitorsHandled: this.formData.visitorsHandled
      };

      this.staffList.push(newStaff);
    }

    this.applyFilters();

    this.closeModal();
  }

  confirmDelete(id: number): void {

    this.deleteId = id;

    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {

    this.showDeleteConfirm = false;

    this.deleteId = null;
  }

  doDelete(): void {

    if (this.deleteId !== null) {

      this.staffList = this.staffList.filter(
        staff => staff.id !== this.deleteId
      );

      this.applyFilters();
    }

    this.cancelDelete();
  }

  onSearch(): void {

    this.applyFilters();
  }

  setDept(dept: Department): void {

    this.activeDept = dept;

    this.applyFilters();
  }

  applyFilters(): void {

    let result = [...this.staffList];

    if (this.activeDept !== 'All') {

      result = result.filter(
        staff => staff.department === this.activeDept
      );
    }

    if (this.searchQuery.trim()) {

      const query = this.searchQuery.toLowerCase();

      result = result.filter(staff =>

        staff.name.toLowerCase().includes(query) ||

        staff.department.toLowerCase().includes(query)
      );
    }

    this.filteredStaff = result;
  }

  getDeptBg(dept: Department): string {

    switch (dept) {

      case 'Engineering':
        return '#dbeafe';

      case 'Sales':
        return '#dcfce7';

      case 'Finance':
        return '#f3e8ff';

      case 'Marketing':
        return '#fef3c7';

      case 'Human Resources':
        return '#fee2e2';

      default:
        return '#f3f4f6';
    }
  }

  getDeptColor(dept: Department): string {

    switch (dept) {

      case 'Engineering':
        return '#2563eb';

      case 'Sales':
        return '#16a34a';

      case 'Finance':
        return '#9333ea';

      case 'Marketing':
        return '#d97706';

      case 'Human Resources':
        return '#dc2626';

      default:
        return '#374151';
    }
  }

}