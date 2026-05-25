import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from 'src/app/services/visitor.service';

export interface Department {
  id: number;
  roleName: string;
  department: string;
  firstName: string;
  userName: string;
  unitName?: string;
  lastName?: string;
  mobileNumber?: string;
  email?: string;
  password?: string;
  approvalPin?: string;
}

interface UsersApiResponse {
  userID: number;
  unitID: number;
  deptID: number;
  roleID: number;
  firstName: string;
  lastName: string;
  userName: string;
  passwordHash: string;
  mobileNumber: string;
  email: string;
  phoneNo: string;
  designation: string;
  dateOfBirth: string;
  address: string;
  photoPath: string;
  departmentName: string;
  roleName: string;
  unitName: string;
  message: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  @Output() close = new EventEmitter<void>();

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
  searchQuery = '';

  // ───────────────── VIEW MODE ─────────────────
  viewMode: 'list' | 'grid' = 'list';

  // ───────────────── MODAL STATES ─────────────────
  showModal = false;
  isEditing = false;
  selectedDepartmentId: number | null = null;

  // ───────────────── DELETE MODAL ─────────────────
  showDeleteConfirm = false;
  deleteId: number | null = null;

  // ───────────────── FORM ERRORS ─────────────────
  formErrors: any = {};

  // ───────────────── NEXT ID ─────────────────
  nextId = 11;

  // ───────────────── SORTING ─────────────────
  sortField: 'roleName' | 'department' | 'firstName' | 'userName' = 'roleName';
  sortDirection: 'asc' | 'desc' = 'asc';

  // ───────────────── DATA ─────────────────
  staffList: Department[] = [];

  // ───────────────── FILTERED DATA ─────────────────
  filteredDepartments: Department[] = [];

  // ───────────────── FORM DATA ─────────────────
  formData = {
    unitName: '',
    department: '',
    roleName: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    userName: '',
    password: '',
    approvalPin: ''
  };

  // ───────────────── PAGINATION ─────────────────
  currentPage = 1;
  itemsPerPage = 5;

  // ───────────────── UNIT DROPDOWN ─────────────────
  showUnitDropdown = false;
  unitList: string[] = ['HNPCL', 'HPCL', 'Finance Unit', 'Operations Unit', 'Mechanical Unit', 'CSR Unit'];

  // ───────────────── INIT ─────────────────
  ngOnInit(): void {
    this.loadUsers();
  }

  // ───────────────── OPEN ADD ─────────────────
  openAdd(): void {
    this.isEditing = false;
    this.selectedDepartmentId = null;
    this.formData = {
      unitName: '', department: '', roleName: '', firstName: '',
      lastName: '', mobileNumber: '', email: '', userName: '', password: '', approvalPin: ''
    };
    this.formErrors = {};
    this.showModal = true;
  }

  // ───────────────── OPEN EDIT ─────────────────
  openEdit(dept: any): void {
    this.isEditing = true;
    this.selectedDepartmentId = dept.id;
    this.formData = {
      unitName:     dept.unitName     || '',
      department:   dept.department   || '',
      roleName:     dept.roleName     || '',
      firstName:    dept.firstName    || '',
      lastName:     dept.lastName     || '',
      mobileNumber: dept.mobileNumber || '',
      email:        dept.email        || '',
      userName:     dept.userName     || '',
      password:     dept.password     || '',
      approvalPin:  dept.approvalPin  || ''
    };
    this.formErrors = {};
    this.showModal = true;
  }

  // ───────────────── CLOSE MODAL ─────────────────
  closeModal(): void {
    this.showModal = false;
  }

  // ───────────────── VALIDATE ─────────────────
  validateForm(): boolean {
    this.formErrors = {};
    if (!this.formData.roleName.trim())   this.formErrors.roleName   = 'Role Name is required';
    if (!this.formData.department.trim()) this.formErrors.department = 'Department is required';
    if (!this.formData.firstName.trim())  this.formErrors.firstName  = 'First Name is required';
    if (!this.formData.userName.trim())   this.formErrors.userName   = 'User Name is required';
    return Object.keys(this.formErrors).length === 0;
  }

  // ───────────────── FILTER UNIT ─────────────────
  filteredUnits(): string[] {
    if (!this.formData.unitName) return this.unitList;
    return this.unitList.filter(unit =>
      unit.toLowerCase().includes(this.formData.unitName.toLowerCase())
    );
  }

  // ───────────────── SELECT UNIT ─────────────────
  selectUnit(unit: string): void {
    this.formData.unitName = unit;
    this.showUnitDropdown = false;
  }

  // ───────────────── CANCEL / CLOSE ─────────────────
  onCancel(): void {
    console.log('Cancelled');
    this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }

  // ───────────────── SUBMIT FORM ─────────────────
  submitForm(): void {
    if (!this.validateForm()) return;

    const payload = {
      userID:         this.isEditing ? this.selectedDepartmentId : 0,
      unitID:         1,
      deptID:         1,
      roleID:         1,
      firstName:      this.formData.firstName,
      lastName:       this.formData.lastName,
      userName:       this.formData.userName,
      passwordHash:   this.formData.password,
      mobileNumber:   this.formData.mobileNumber,
      email:          this.formData.email,
      phoneNo:        this.formData.mobileNumber,
      designation:    this.formData.roleName,
      dateOfBirth:    new Date().toISOString(),
      address:        this.formData.department,
      photoPath:      'string',
      departmentName: this.formData.department,
      roleName:       this.formData.roleName,
      unitName:       this.formData.unitName,
      message:        'string'
    };

    console.log('Payload:', payload);

    this.visitorService.addUpdateUser(payload).subscribe({
      next: (res: any) => {
        console.log('User Saved:', res);
        this.showToast(
          this.isEditing ? 'User updated successfully!' : 'User added successfully!',
          'success'
        );
        this.loadUsers();
        this.closeModal();
      },
      error: (err: any) => {
        console.error('Save User Error:', err);
        if (err.error && typeof err.error === 'string' && err.error.includes('UNIQUE KEY')) {
          this.showToast('Username already exists. Please use another username.', 'error');
        } else {
          this.showToast('Failed to save user!', 'error');
        }
      }
    });
  }

  // ───────────────── GET USERS ─────────────────
  loadUsers(): void {
    this.visitorService.getAllUsers(1).subscribe({
      next: (res: any) => {
        console.log('RESPONSE:', res);
        console.log('RESPONSE ARRAY:', res.response);
        this.staffList = res.response.map((item: UsersApiResponse): Department => ({
          id:           item.userID,
          roleName:     item.roleName,
          department:   item.departmentName,
          firstName:    item.firstName,
          userName:     item.userName,
          unitName:     item.unitName     || '',
          lastName:     item.lastName     || '',
          mobileNumber: item.mobileNumber || '',
          email:        item.email        || ''
        }));
        console.log('TABLE DATA:', this.staffList);
        this.filteredDepartments = [...this.staffList];
        this.applySearch();
      },
      error: (err: any) => {
        console.error('Users API Error:', err);
      }
    });
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

  // ───────────────── DELETE USER ─────────────────
  doDelete(): void {
    if (this.deleteId === null) return;

    const unitId = 1;

    this.visitorService.deleteUser(this.deleteId, unitId).subscribe({
      next: (res: any) => {
        console.log('Delete Success:', res);
        this.staffList = this.staffList.filter(dept => dept.id !== this.deleteId);
        this.applySearch();
        this.showToast('User deleted successfully!', 'error');
        this.cancelDelete();
        this.loadUsers();
      },
      error: (err: any) => {
        console.error('Delete Error:', err);
        this.showToast('Failed to delete user!', 'error');
        this.cancelDelete();
      }
    });
  }

  // ───────────────── SEARCH ─────────────────
  onSearch(): void {
    this.currentPage = 1;
    this.applySearch();
  }

  applySearch(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredDepartments = [...this.staffList];
      return;
    }
    this.filteredDepartments = this.staffList.filter(dept =>
      dept.roleName.toLowerCase().includes(query)   ||
      dept.department.toLowerCase().includes(query) ||
      dept.firstName.toLowerCase().includes(query)  ||
      dept.userName.toLowerCase().includes(query)
    );
  }

  // ───────────────── VIEW MODE ─────────────────
  setView(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  // ───────────────── EXPORT ─────────────────
  exportData(): void {
    const rows = this.filteredDepartments.map(dept =>
      `${dept.id},${dept.roleName},${dept.department},${dept.firstName},${dept.userName}`
    );
    const csv = `S.No,Role Name,Department,First Name,User Name\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ───────────────── SORT ─────────────────
  sort(field: 'roleName' | 'department' | 'firstName' | 'userName'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filteredDepartments.sort((a: any, b: any) => {
      const valueA = a[field]?.toLowerCase() || '';
      const valueB = b[field]?.toLowerCase() || '';
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // ───────────────── PAGINATED DATA ─────────────────
  get paginatedDepartments(): Department[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDepartments.slice(start, start + this.itemsPerPage);
  }

  // ───────────────── PAGE INFO ─────────────────
  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.filteredDepartments.length ? this.filteredDepartments.length : end;
  }

  // ───────────────── NEXT PAGE ─────────────────
  nextPage(): void {
    if (this.endIndex < this.filteredDepartments.length) this.currentPage++;
  }

  // ───────────────── PREVIOUS PAGE ─────────────────
  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

}