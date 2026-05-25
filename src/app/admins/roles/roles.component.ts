import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from 'src/app/services/visitor.service';

interface RolesApiResponse {
  unitID: number;
  roleID: number;
  roleName: string;
  user_AccessID: number;
  isSuperAdmin: number;
  userId: number;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent {

  constructor(private visitorService: VisitorService) {}

  // ───────────────── SEARCH ─────────────────
  searchQuery = '';

  // ───────────────── VIEW MODE ─────────────────
  viewMode: 'list' | 'grid' = 'list';

  // ───────────────── MODAL STATES ─────────────────
  showModal = false;
  isEditing = false;
  selectedRoleId: number | null = null;

  // ───────────────── DELETE MODAL ─────────────────
  showDeleteConfirm = false;
  deleteId: number | null = null;

  // ───────────────── FORM ERRORS ─────────────────
  formErrors: any = {};

  // ───────────────── NEXT ID ─────────────────
  nextId = 11;

  // ───────────────── SORTING ─────────────────
  sortField: 'roleName' = 'roleName';
  sortDirection: 'asc' | 'desc' = 'asc';

  // ───────────────── DATA ─────────────────
  staffList: RolesApiResponse[] = [];

  // ───────────────── FILTERED DATA ─────────────────
  filteredRoles: RolesApiResponse[] = [...this.staffList];

  // ───────────────── FORM DATA ─────────────────
  formData = { roleName: '' };

  // ───────────────── PAGINATION ─────────────────
  currentPage = 1;
  itemsPerPage = 5;

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

  // ───────────────── ON INIT ─────────────────
  ngOnInit(): void {
    this.loadRoles();
  }

  // ───────────────── GET ROLES FUNCTION ─────────────────
  loadRoles(): void {
    this.visitorService.getAllRoles().subscribe({
      next: (res: any) => {
        console.log('ROLES API RESPONSE:', res);
        this.staffList = res.map((item: any) => ({
          id:            item.roleID,
          roleID:        item.roleID,
          roleName:      item.roleName,
          unitID:        item.unitID,
          user_AccessID: item.user_AccessID,
          isSuperAdmin:  item.isSuperAdmin,
          userId:        item.userId
        }));
        console.log('TABLE DATA:', this.staffList);
        this.filteredRoles = [...this.staffList];
        this.applySearch();
      },
      error: (err: any) => {
        console.error('Roles API Error:', err);
      }
    });
  }

  // ───────────────── OPEN ADD ─────────────────
  openAdd(): void {
    this.isEditing = false;
    this.selectedRoleId = null;
    this.formData = { roleName: '' };
    this.formErrors = {};
    this.showModal = true;
  }

  // ───────────────── OPEN EDIT ─────────────────
  openEdit(role: RolesApiResponse): void {
    console.log('EDIT ROLE DATA:', role);
    this.isEditing = true;
    this.selectedRoleId = role.roleID;
    this.formData = { roleName: role.roleName };
    this.formErrors = {};
    this.showModal = true;
    console.log('SELECTED ROLE ID:', this.selectedRoleId);
  }

  // ───────────────── CLOSE MODAL ─────────────────
  closeModal(): void {
    this.showModal = false;
  }

  // ───────────────── VALIDATE ─────────────────
  validateForm(): boolean {
    this.formErrors = {};
    if (!this.formData.roleName.trim()) this.formErrors.roleName = 'Role name is required';
    return Object.keys(this.formErrors).length === 0;
  }

  // ───────────────── SUBMIT FORM ─────────────────
  submitForm(): void {
    if (!this.validateForm()) return;

    const payload = {
      unitID:        1,
      roleID:        this.isEditing ? this.selectedRoleId : 0,
      roleName:      this.formData.roleName.trim(),
      user_AccessID: 0,
      isSuperAdmin:  0,
      userId:        1
    };

    console.log('FINAL ROLE PAYLOAD:', payload);

    this.visitorService.addUpdateRole(payload).subscribe({
      next: (res: any) => {
        console.log('ROLE SAVE SUCCESS:', res);
        this.showToast(
          this.isEditing ? 'Role updated successfully!' : 'Role added successfully!',
          'success'
        );
        this.loadRoles();
        this.closeModal();
      },
      error: (err: any) => {
        console.error('ROLE SAVE ERROR:', err);
        if (err.error && typeof err.error === 'string' && err.error.includes('UNIQUE KEY')) {
          this.showToast('Role name already exists!', 'error');
        } else {
          this.showToast('Internal Server Error!', 'error');
        }
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

  // ───────────────── DELETE ROLE ─────────────────
  doDelete(): void {
    if (this.deleteId === null) return;

    const userId = 1;

    this.visitorService.deleteRole(this.deleteId, userId).subscribe({
      next: (res: any) => {
        console.log('DELETE RESPONSE:', res);
        this.staffList = this.staffList.filter(role => role.roleID !== this.deleteId);
        this.filteredRoles = [...this.staffList];
        this.applySearch();
        this.showToast('Role deleted successfully!', 'error');
        this.cancelDelete();
        this.loadRoles();
      },
      error: (err: any) => {
        console.error('DELETE ERROR:', err);
        this.showToast('Failed to delete role!', 'error');
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
      this.filteredRoles = [...this.staffList];
      return;
    }
    this.filteredRoles = this.staffList.filter(role =>
      role.roleName.toLowerCase().includes(query)
    );
  }

  // ───────────────── VIEW MODE ─────────────────
  setView(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  // ───────────────── EXPORT ─────────────────
  exportData(): void {
    const rows = this.filteredRoles.map(role => `${role.roleID},${role.roleName}`);
    const csv = `S.No,Role Name\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roles.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ───────────────── SORT ─────────────────
  sort(field: 'roleName'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filteredRoles.sort((a: any, b: any) => {
      const valueA = a[field]?.toLowerCase() || '';
      const valueB = b[field]?.toLowerCase() || '';
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // ───────────────── PAGINATED DATA ─────────────────
  get paginatedRoles(): RolesApiResponse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRoles.slice(start, start + this.itemsPerPage);
  }

  // ───────────────── PAGE INFO ─────────────────
  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.filteredRoles.length ? this.filteredRoles.length : end;
  }

  // ───────────────── NEXT PAGE ─────────────────
  nextPage(): void {
    if (this.endIndex < this.filteredRoles.length) this.currentPage++;
  }

  // ───────────────── PREVIOUS PAGE ─────────────────
  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

}