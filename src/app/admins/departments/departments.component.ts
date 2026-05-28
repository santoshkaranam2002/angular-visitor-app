import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from 'src/app/services/visitor.service';

export interface Department {
  id: number;
  departmentCode: string;
  departmentName: string;
  narration: string;
}

interface DepartmentApiResponse {
  deptID: number;
  deptCode: string;
  deptName: string;
    departmentName: string | null;
  narration: string;
}

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss'
})
export class DepartmentsComponent implements OnInit {

  constructor(private visitorService: VisitorService) {}

  // ───────────────── TOAST ─────────────────
  toast: { show: boolean; message: string; type: 'success' | 'error' } = {
    show: false,
    message: '',
    type: 'success'
  };

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => this.toast.show = false, 3000);
  }

  // ───────────────── SEARCH ─────────────────
  searchQuery: string = '';

  // ───────────────── VIEW ─────────────────
  viewMode: 'list' | 'grid' = 'list';

  // ───────────────── MODAL ─────────────────
  showModal: boolean = false;
  isEditing: boolean = false;
  selectedDepartmentId: number | null = null;

  // ───────────────── DELETE ─────────────────
  showDeleteConfirm: boolean = false;
  deleteId: number | null = null;

  // ───────────────── ERRORS ─────────────────
  formErrors: Record<string, string> = {};

  // ───────────────── DATA ─────────────────
  staffList: Department[] = [];
  filteredDepartments: Department[] = [];

  // ───────────────── FORM ─────────────────
  formData: {
    deptID: number | null;
    deptCode: string;
    deptName: string;
    narration: string;
    userId: number;
    unitID: number;
  } = {
    deptID: null,
    deptCode: '',
    deptName: '',
    narration: '',
    userId: 1,
    unitID: 2
  };

  // ───────────────── PAGINATION ─────────────────
  currentPage: number = 1;
  itemsPerPage: number = 5;

  // ───────────────── SORT ─────────────────
  sortField: 'departmentCode' | 'departmentName' | 'narration' = 'departmentCode';
  sortDirection: 'asc' | 'desc' = 'asc';

  // ───────────────── INIT ─────────────────
  ngOnInit(): void {
    this.loadDepartments();
  }

  // ───────────────── GET ALL ─────────────────
  loadDepartments(): void {
    this.visitorService.getAllDepartments().subscribe({
      next: (res: DepartmentApiResponse[]) => {
        this.staffList = res.map((item: DepartmentApiResponse): Department => ({
          id:               item.deptID,
          departmentCode:   item.deptCode,
       departmentName: item.deptName,
          narration:        item.narration
        }));
        console.log('Departments loaded:', this.staffList);
        this.applySearch();
      },
      error: (err: unknown) => {
        console.error('API Error:', err);
      }
    });
  }

  // ───────────────── ADD ─────────────────
  openAdd(): void {
    this.isEditing = false;
    this.selectedDepartmentId = null;
    this.formData = { deptID: null, deptCode: '', deptName: '', narration: '', userId: 1, unitID: 2 };
    this.formErrors = {};
    this.showModal = true;
  }

  // ───────────────── EDIT ─────────────────
  openEdit(dept: Department): void {
    this.isEditing = true;
    this.selectedDepartmentId = dept.id;
    this.formData = {
      deptID:    dept.id,
      deptCode:  dept.departmentCode,
      deptName:  dept.departmentName,
      narration: dept.narration,
      userId:    1,
      unitID:    2
    };
    this.formErrors = {};
    this.showModal = true;
  }

  // ───────────────── CLOSE MODAL ─────────────────
  closeModal(): void {
    this.showModal = false;
  }

  // ───────────────── SAVE (ADD + UPDATE) ─────────────────
  saveDepartment(): void {
    if (!this.validateForm()) return;

    const payload = {
      deptID:    this.formData.deptID ?? 0,
      deptCode:  this.formData.deptCode,
        deptName:       this.formData.deptName.trim(),       // ← add this back
  departmentName: this.formData.deptName.trim(),  // ← add this
      narration: this.formData.narration,
    userId:    this.formData.userId,   // ← use from formData, not hardcoded
    unitID:    this.formData.unitID    // ← use from formData, not hardcoded
    };

    console.log('Sending payload:', payload);

    this.visitorService.addUpdateDepartment(payload).subscribe({
      next: (res) => {
        console.log('Saved:', res);
        this.showToast(
          this.isEditing ? 'Department updated successfully!' : 'Department added successfully!',
          'success'
        );
        this.loadDepartments();
        this.closeModal();
      },
      error: (err) => {
        console.error('Save Error:', err.error);
        if (err.error && typeof err.error === 'string' && err.error.includes('UNIQUE KEY')) {
          this.showToast('Department code already exists!', 'error');
        } else {
          this.showToast('Failed to save department!', 'error');
        }
      }
    });
  }

  // ───────────────── VALIDATION ─────────────────
  validateForm(): boolean {
    this.formErrors = {};
    if (!this.formData.deptCode.trim()) this.formErrors['deptCode'] = 'Department code is required';
    if (!this.formData.deptName.trim()) this.formErrors['deptName'] = 'Department name is required';
    return Object.keys(this.formErrors).length === 0;
  }

  // ───────────────── DELETE ─────────────────
  confirmDelete(id: number): void {
    this.deleteId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteId = null;
  }

  doDelete(): void {
    if (this.deleteId === null) return;

    this.visitorService.deleteDepartment(this.deleteId).subscribe({
      next: () => {
        this.staffList = this.staffList.filter(d => d.id !== this.deleteId);
        this.applySearch();
        this.showToast('Department deleted successfully!', 'error');
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Delete Error:', err);
        this.showToast('Failed to delete department!', 'error');
      }
    });
  }

  // ───────────────── SEARCH ─────────────────
  onSearch(): void {
    this.currentPage = 1;
    this.applySearch();
  }

  applySearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredDepartments = [...this.staffList];
      return;
    }
    this.filteredDepartments = this.staffList.filter((d: Department) =>
      d.departmentCode.toLowerCase().includes(query) ||
      d.departmentName.toLowerCase().includes(query) ||
      d.narration.toLowerCase().includes(query)
    );
  }

  // ───────────────── VIEW ─────────────────
  setView(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  // ───────────────── EXPORT ─────────────────
  exportData(): void {
    const rows = this.filteredDepartments.map(d =>
      `${d.id},${d.departmentCode},${d.departmentName},${d.narration}`
    );
    const csv = `S.No,Department Code,Department Name,Narration\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'departments.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ───────────────── SORT ─────────────────
  sort(field: 'departmentCode' | 'departmentName' | 'narration'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filteredDepartments.sort((a, b) => {
      const aVal = (a[field] || '').toLowerCase();
      const bVal = (b[field] || '').toLowerCase();
      return this.sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }

  // ───────────────── PAGINATION ─────────────────
  get paginatedDepartments(): Department[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDepartments.slice(start, start + this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.filteredDepartments.length ? this.filteredDepartments.length : end;
  }

  nextPage(): void {
    if (this.endIndex < this.filteredDepartments.length) this.currentPage++;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

}