import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from '../../services/visitor.service';
import { HttpClient } from '@angular/common/http';

interface Visitor {
  visitorID: number;
  visitorCode: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  company: string;
  address: string;
  idProofTypeID: number;
  idNumber: string;
  vehicleNumber: string;
  photoPath: string;
  isBlacklisted: boolean;
  message: string;
}

interface TeamMember {
  memberName: string;
  idProof: string;
}

interface Device {
  deviceType: string;
  serialNumber: string;
}

interface DepartmentDD {
  value: number;
  label: string;
}

interface DeptUser {
  userID: number;
  userName: string;
  designation: string;
  email: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  @Output() close = new EventEmitter<void>();

  constructor(private visitorService: VisitorService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  // ───────────────── STEP ─────────────────
  currentStep: number = 1;
  activeTab: string = 'existing';

  // ───────────────── SEARCH ─────────────────
  searchQuery: string = '';
  visitors: Visitor[] = [];
  selectedVisitor: Visitor | null = null;

  // ───────────────── TOAST (Success / Error) ─────────────────
  toast: { show: boolean; message: string; type: 'success' | 'error' } = {
    show: false, message: '', type: 'success'
  };

  showToastMsg(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => this.toast.show = false, 3000);
  }

  // ───────────────── VALIDATION TOAST ─────────────────
  showToast: boolean = false;
  toastMessage: string = '';
  toastTimeout: any;
  showCaptureOptions: boolean = false;

  showValidationToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => { this.showToast = false; }, 3000);
  }

  // ───────────────── POPUP ─────────────────
  showProfilePopup: boolean = false;
  isSubmitting: boolean = false;

  // ───────────────── VISITOR FIELDS ─────────────────
  visitorID: number = 0;
  visitorName: string = '';
  mobileNumber: string = '';
  visitorEmail: string = '';
  company: string = '';
  address: string = '';
  idProofType: string = 'Aadhar Card';
  idNumber: string = '';
  captureImage: string | null = null;
  vehicleNumber: string = '';

  // ───────────────── VISIT FIELDS ─────────────────
  purposeOfVisit: string = '';
  selectedDeptID: number | null = null;
  selectedDeptLabel: string = '';
  selectedPersonToMeetID: number | null = null;
  selectedPersonToMeetName: string = '';
  personEmail: string = '';
  personToMeet: string = '';
  visitType: string = 'single';
  startDate: string = '';
  endDate: string = '';
  entryGate: string = 'Gate A - Main Entrance';

  // ───────────────── TEAM / DEVICES ─────────────────
  teamMembers: TeamMember[] = [{ memberName: '', idProof: '' }];
  devices: Device[] = [{ deviceType: '', serialNumber: '' }];

  // ───────────────── DROPDOWNS ─────────────────
  idProofTypes: string[] = ['Aadhar Card', 'PAN Card', 'Passport', 'Driving License', 'Voter ID'];
  departments: DepartmentDD[] = [];
  deptUsers: DeptUser[] = [];
  entryGates: string[] = ['Gate A - Main Entrance', 'Gate B - Side Entrance', 'Gate C - Back Entrance'];

  // Loading states
  loadingDepts: boolean = false;
  loadingUsers: boolean = false;
  loadingVisitDetails: boolean = false;  // ✅ NEW loading state

  // ───────────────── LOAD DEPARTMENTS ─────────────────
  loadDepartments(): void {
    this.loadingDepts = true;
    this.visitorService.getDepartmentDD().subscribe({
      next: (res: DepartmentDD[]) => {
        this.departments = res;
        this.loadingDepts = false;
      },
      error: () => {
        this.loadingDepts = false;
        this.showToastMsg('Failed to load departments', 'error');
      }
    });
  }

  // ───────────────── ON DEPARTMENT CHANGE ─────────────────
  onDepartmentChange(): void {
    if (!this.selectedDeptID) {
      this.deptUsers = [];
      this.selectedPersonToMeetID = null;
      this.selectedPersonToMeetName = '';
      this.personEmail = '';
      return;
    }
    const dept = this.departments.find(d => d.value === +this.selectedDeptID!);
    this.selectedDeptLabel = dept ? dept.label : '';

    this.selectedPersonToMeetID = null;
    this.selectedPersonToMeetName = '';
    this.personEmail = '';

    this.loadingUsers = true;
    this.visitorService.getUsersByDepartment(+this.selectedDeptID).subscribe({
      next: (users: DeptUser[]) => {
        this.deptUsers = users;
        this.loadingUsers = false;
      },
      error: () => {
        this.loadingUsers = false;
        this.showToastMsg('Failed to load users', 'error');
      }
    });
  }

  // ───────────────── ON PERSON TO MEET CHANGE ─────────────────
  onPersonToMeetChange(): void {
    if (!this.selectedPersonToMeetID) {
      this.personEmail = '';
      return;
    }
    const user = this.deptUsers.find(u => u.userID === +this.selectedPersonToMeetID!);
    this.selectedPersonToMeetName = user ? user.userName : '';

    this.visitorService.getUserEmailByUserID(+this.selectedPersonToMeetID).subscribe({
      next: (res: any) => {
        this.personEmail = res.email || '';
      },
      error: () => {
        this.personEmail = '';
      }
    });
  }

  // ───────────────── TAB / VISIT TYPE ─────────────────
  setActiveTab(tab: string): void { this.activeTab = tab; }
  setVisitType(type: string): void { this.visitType = type; }

  // ───────────────── SEARCH VISITOR ─────────────────
  searchVisitor(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.visitors = [];
      return;
    }
    this.visitorService.searchVisitor(this.searchQuery).subscribe({
      next: (response: Visitor[]) => { this.visitors = response; },
      error: (error: any) => { console.error('Search Error:', error); }
    });
  }

  // ───────────────── SELECT VISITOR ─────────────────
  selectVisitor(visitor: Visitor): void {
    this.selectedVisitor  = visitor;
    this.visitorID        = visitor.visitorID;
    this.visitorName      = visitor.fullName;
    this.mobileNumber     = visitor.mobileNumber;
    this.visitorEmail     = visitor.email || '';
    this.company          = visitor.company || '';
    this.address          = visitor.address || '';
    this.idProofType      = this.getIdProofTypeName(visitor.idProofTypeID);
    this.idNumber         = visitor.idNumber || '';
    this.vehicleNumber    = visitor.vehicleNumber || '';
  }

  // ───────────────── NEXT STEP ─────────────────
  nextStep(): void {
    if (this.currentStep === 1 && this.activeTab === 'existing') {
      if (!this.selectedVisitor) { this.showValidationToast('Please select a visitor'); return; }
      this.currentStep++; return;
    }
    if (this.currentStep === 1 && this.activeTab === 'new') {
      if (!this.visitorName)  { this.showValidationToast('Please enter visitor name');  return; }
      if (!this.mobileNumber) { this.showValidationToast('Please enter mobile number'); return; }
            // ✅ ADD THESE TWO VALIDATIONS
      if (!/^\d+$/.test(this.mobileNumber)) { 
        this.showValidationToast('Mobile number must contain digits only'); return; 
      }
      if (this.mobileNumber.length !== 10) { 
        this.showValidationToast('Mobile number must be exactly 10 digits'); return; 
      }
          if (!this.visitorEmail) {
            this.showValidationToast('Please enter email address'); return;
          }
        if (!this.isValidEmail(this.visitorEmail)) {
          this.showValidationToast('Please enter a valid email address'); return;
        }
      if (!this.address)      { this.showValidationToast('Please enter address');       return; }
      if (!this.idNumber)     { this.showValidationToast('Please enter ID number');     return; }
      this.currentStep++; return;
    }
    if (this.currentStep === 2) {
      if (!this.purposeOfVisit) { this.showValidationToast('Please enter purpose of visit'); return; }
      if (!this.selectedDeptID) { this.showValidationToast('Please select a department');    return; }
      if (!this.startDate)      { this.showValidationToast('Please select a visit date');    return; }
      this.currentStep++; return;
    }

    

  }

    // ───────────────── MOBILE NUMBER INPUT HANDLER ─────────────────
  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Strip non-digits
    let value = input.value.replace(/\D/g, '');
    // Cap at 10 digits
    if (value.length > 10) value = value.slice(0, 10);
    this.mobileNumber = value;
    input.value = value;
  }

      // ───────────────── EMAIL INPUT HANDLER ─────────────────
    onEmailInput(event: Event): void {
      const input = event.target as HTMLInputElement;
      // Remove spaces
      const value = input.value.replace(/\s/g, '');
      this.visitorEmail = value;
      input.value = value;
    }

    isValidEmail(email: string): boolean {
      const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    }

  // ───────────────── PREV STEP ─────────────────
  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  // ───────────────── BUILD TEAM MEMBERS JSON ─────────────────
buildTeamMembersJson(): string {
  const filtered = this.teamMembers.filter(m => m.memberName.trim() || m.idProof.trim());
  if (filtered.length === 0) return '[]';
  return JSON.stringify(filtered.map(m => ({
    teamMemberID: 0,
    visitID:      0,
    memberName:   m.memberName,
    idProofType:  'Aadhaar',
    idNumber:     m.idProof
  })));
}

  // ───────────────── BUILD DEVICES JSON ─────────────────
buildDevicesJson(): string {
  const filtered = this.devices.filter(d => d.deviceType.trim() || d.serialNumber.trim());
  if (filtered.length === 0) return '[]';
  return JSON.stringify(filtered.map(d => ({
    deviceID:     0,
    visitID:      0,
    deviceType:   d.deviceType,
    serialNumber: d.serialNumber
  })));
}
  // ───────────────── GET GATE ID ─────────────────
  getGateID(): number {
    switch (this.entryGate) {
      case 'Gate A - Main Entrance': return 1;
      case 'Gate B - Side Entrance': return 2;
      case 'Gate C - Back Entrance': return 3;
      default: return 1;
    }
  }

  // ───────────────── GET GATE LABEL FROM ID ─────────────────
  getGateLabel(gateID: number): string {
    switch (gateID) {
      case 1: return 'Gate A - Main Entrance';
      case 2: return 'Gate B - Side Entrance';
      case 3: return 'Gate C - Back Entrance';
      default: return 'Gate A - Main Entrance';
    }
  }

  // ───────────────── SUBMIT ─────────────────
submitVisitor(): void {

// ───── STEP 3 VALIDATIONS ─────
  for (let i = 0; i < this.teamMembers.length; i++) {
    const m = this.teamMembers[i];
    if (m.memberName.trim() && !m.idProof.trim()) {
      this.showValidationToast(`Please enter ID proof for team member ${i + 1}`); return;
    }
    if (!m.memberName.trim() && m.idProof.trim()) {
      this.showValidationToast(`Please enter name for team member ${i + 1}`); return;
    }
  }

  for (let i = 0; i < this.devices.length; i++) {
    const d = this.devices[i];
    if (d.deviceType.trim() && !d.serialNumber.trim()) {
      this.showValidationToast(`Please enter serial number for device ${i + 1}`); return;
    }
    if (!d.deviceType.trim() && d.serialNumber.trim()) {
      this.showValidationToast(`Please enter device type for device ${i + 1}`); return;
    }
  }


  if (this.isSubmitting) return;
  this.isSubmitting = true;

  const isNewVisitor = this.activeTab === 'new';
  const today = new Date().toISOString();

  const filteredMembers = this.teamMembers.filter(m => m.memberName.trim() || m.idProof.trim());
  const filteredDevices = this.devices.filter(d => d.deviceType.trim() || d.serialNumber.trim());

  const payload = {
    visitor: {
      visitorID:          this.activeTab === 'existing' ? this.visitorID : 0,
      visitorCode:        '',
      fullName:           this.visitorName,
      mobileNumber:       this.mobileNumber,
      email:              this.visitorEmail       || '',
      company:            this.company            || '',
      address:            this.address            || '',
      idProofTypeID:      this.getIdProofTypeID(),
      idNumber:           this.idNumber           || '',
      vehicleNumber:      this.vehicleNumber      || '',
      // photoPath:          this.captureImage       || '',
      isBlacklisted:      false,
      message:            '',
      visitID:            0,
      unitID:             1,
      deptID:             this.selectedDeptID     || 1,
      gateID:             this.getGateID(),
      personToMeetUserID: this.selectedPersonToMeetID || 0,
      personToMeetName:   this.selectedPersonToMeetName || '',
      personToMeetEmail:  this.personEmail        || '',
      purposeOfVisit:     this.purposeOfVisit     || '',
      visitType:          this.visitType === 'single' ? 'Temporary' : 'Regular',
      startDate:          this.startDate ? new Date(this.startDate).toISOString() : today,
      endDate:            this.endDate   ? new Date(this.endDate).toISOString()   : this.startDate ? new Date(this.startDate).toISOString() : today,
      approvalStatus:     'Pending',
      visitStatus:        'Scheduled',
      checkInTime:        today,
      checkOutTime:       today,
      createdByUserID:    1,
      approvedByUserID:   0,
      approvedAt:         today,
      rejectionReason:    '',
      remarks:            '',
      requestInitiatedBy: 'Self',
      notificationSentAt: today,
      notificationToken:  '',
      tokenExpiresAt:     today,
      isEmergencyVisit:   false,
      emergencyReason:    '',
      timelineID:         0,
      actionBy:           1,
      actionByName:       '',
      action:             'Created',
      notes:              '',
      actionAt:           today
    },

    teamMembers: filteredMembers.length > 0
      ? filteredMembers.map(m => ({
          teamMemberID: 0,
          visitID:      0,
          memberName:   m.memberName,
          idProofType:  'Aadhaar',
          idNumber:     m.idProof
        }))
      : [{ teamMemberID: 0, visitID: 0, memberName: '', idProofType: 'Aadhaar', idNumber: '' }],

    devices: filteredDevices.length > 0
      ? filteredDevices.map(d => ({
          deviceID:     0,
          visitID:      0,
          deviceType:   d.deviceType,
          serialNumber: d.serialNumber
        }))
      : [{ deviceID: 0, visitID: 0, deviceType: '', serialNumber: '' }]
  };

  console.log('PAYLOAD SENT:', JSON.stringify(payload, null, 2));

  this.visitorService.addVisitor(payload).subscribe({
    next: (response: any) => {
      console.log('API Success Response:', response);
      const r = response.response || response;
      this.isSubmitting = false;

      this.visitorID                = r.visitorID              || this.visitorID;
      this.visitorName              = r.fullName               || this.visitorName;
      this.mobileNumber             = r.mobileNumber           || this.mobileNumber;
      this.visitorEmail             = r.email                  || this.visitorEmail;
      this.company                  = r.company                || this.company;
      this.address                  = r.address                || this.address;
      this.idNumber                 = r.idNumber               || this.idNumber;
      this.vehicleNumber            = r.vehicleNumber          || this.vehicleNumber;
      this.idProofType              = this.getIdProofTypeName(r.idProofTypeID) || this.idProofType;
      this.purposeOfVisit           = r.purposeOfVisit         || this.purposeOfVisit;
      this.selectedDeptID           = r.deptID                 || this.selectedDeptID;
      this.selectedPersonToMeetID   = r.personToMeetUserID     || this.selectedPersonToMeetID;
      this.selectedPersonToMeetName = r.personToMeetName       || this.selectedPersonToMeetName;
      this.personEmail              = r.personToMeetEmail      || this.personEmail;
      this.entryGate                = this.getGateLabel(r.gateID) || this.entryGate;

      if (r.visitType === 'Temporary')    this.visitType = 'single';
      else if (r.visitType === 'Regular') this.visitType = 'multiple';

      const dept = this.departments.find(d => d.value === +this.selectedDeptID!);
      this.selectedDeptLabel = dept ? dept.label : this.selectedDeptLabel;

      this.sendEmailNotification();

      const successMessage = isNewVisitor ? 'Visitor Registered Successfully!' : 'Visitor Updated Successfully!';
      this.showToastMsg(successMessage, 'success');
      setTimeout(() => { this.showProfilePopup = true; }, 3000);
    },
    error: (error: any) => {
      console.log('ERROR DETAIL:', error?.error);
      console.log('ERRORS OBJECT:', JSON.stringify(error?.error?.errors, null, 2));
      this.isSubmitting = false;
      this.showToastMsg(error?.error?.message || error?.error?.title || 'Something went wrong.', 'error');
    }
  });
}

  // ───────────────── CLOSE PROFILE POPUP ─────────────────
  closeProfilePopup(): void {
    this.showProfilePopup = false;
    this.onClose();
  }

  // ───────────────── ID PROOF TYPE ID ─────────────────
  getIdProofTypeID(): number {
    switch (this.idProofType) {
      case 'Aadhar Card':     return 1;
      case 'PAN Card':        return 2;
      case 'Passport':        return 3;
      case 'Driving License': return 4;
      case 'Voter ID':        return 5;
      default:                return 1;
    }
  }

  // ───────────────── ID PROOF TYPE NAME ─────────────────
  getIdProofTypeName(idProofTypeID: number | undefined): string {
    if (idProofTypeID === undefined || idProofTypeID === null) return 'Aadhar Card';
    switch (idProofTypeID) {
      case 1: return 'Aadhar Card';
      case 2: return 'PAN Card';
      case 3: return 'Passport';
      case 4: return 'Driving License';
      case 5: return 'Voter ID';
      default: return 'Aadhar Card';
    }
  }

  // ───────────────── TEAM MEMBERS ─────────────────
  addTeamMember(): void { this.teamMembers.push({ memberName: '', idProof: '' }); }
  removeTeamMember(index: number): void { this.teamMembers.splice(index, 1); }

  // ───────────────── DEVICES ─────────────────
  addDevice(): void { this.devices.push({ deviceType: '', serialNumber: '' }); }
  removeDevice(index: number): void { this.devices.splice(index, 1); }

  // ───────────────── CLOSE / CANCEL ─────────────────
  onCancel(): void { this.onClose(); }
  onClose(): void { this.close.emit(); }

  // ───────────────── CAPTURE ─────────────────
  triggerCapture(): void { console.log('Capture image triggered'); }

  // ───────────────── STEP CLASS ─────────────────
  getStepClass(step: number): string {
    if (step < this.currentStep)   return 'completed';
    if (step === this.currentStep) return 'active';
    return 'inactive';
  }

  // ───────────────── VISITOR DETAILS POPUP ─────────────────
  showVisitorDetailsPopup: boolean = false;

  showVisitorDetails(visitor: Visitor): void {
    this.selectedVisitor         = visitor;
    this.visitorID               = visitor.visitorID;
    this.visitorName             = visitor.fullName;
    this.mobileNumber            = visitor.mobileNumber;
    this.visitorEmail            = visitor.email || '';
    this.company                 = visitor.company || '';
    this.address                 = visitor.address || '';
    this.idProofType             = this.getIdProofTypeName(visitor.idProofTypeID);
    this.idNumber                = visitor.idNumber || '';
    this.vehicleNumber           = visitor.vehicleNumber || '';
    this.showVisitorDetailsPopup = true;
  }

  closeVisitorDetailsPopup(): void {
    this.showVisitorDetailsPopup = false;
  }

  // ───────────────── CONFIRM VISITOR SELECTION ─────────────────
  confirmVisitorSelection(): void {
    this.showVisitorDetailsPopup = false;
    this.loadLastVisitDetails(this.visitorID);   // ✅ NEW — load last visit before going to Step 2
  }

  // ───────────────── LOAD LAST VISIT DETAILS ─────────────────
  loadLastVisitDetails(visitorID: number): void {
    this.loadingVisitDetails = true;

    this.visitorService.getLastVisitByVisitorID(visitorID).subscribe({
      next: (response: any) => {
        this.loadingVisitDetails = false;
        const r = response?.visitInfo;

        if (r) {
          // ✅ Auto-fill Step 2 fields from last visit
          this.purposeOfVisit = r.purposeOfVisit || '';
          this.entryGate      = r.entryGate      || 'Gate A - Main Entrance';
          this.visitType      = r.visitType === 'Temporary' ? 'single' : 'multiple';
          this.startDate      = r.startDate ? r.startDate.split('T')[0] : '';
          this.endDate        = r.endDate   ? r.endDate.split('T')[0]   : '';

          // ✅ Match department by label string (API returns string not ID)
          const dept = this.departments.find(
            d => d.label.toLowerCase() === r.department?.toLowerCase()
          );

          if (dept) {
            this.selectedDeptID    = dept.value;
            this.selectedDeptLabel = dept.label;

            // ✅ Load users for this department then match person to meet
            this.loadingUsers = true;
            this.visitorService.getUsersByDepartment(dept.value).subscribe({
              next: (users: DeptUser[]) => {
                this.deptUsers    = users;
                this.loadingUsers = false;

                // ✅ Match person to meet by name string (API returns string not ID)
                const person = users.find(
                  u => u.userName.toLowerCase() === r.personToMeet?.toLowerCase()
                );

                if (person) {
                  this.selectedPersonToMeetID   = person.userID;
                  this.selectedPersonToMeetName = person.userName;

                  // ✅ Load person's email
                  this.visitorService.getUserEmailByUserID(person.userID).subscribe({
                    next: (res: any) => { this.personEmail = res.email || ''; },
                    error: ()        => { this.personEmail = ''; }
                  });
                }
              },
              error: () => {
                this.loadingUsers = false;
              }
            });
          }
        }

        this.currentStep = 2;  // ✅ Go to Step 2
      },
      error: () => {
        // ✅ No previous visit found — go to Step 2 with empty fields
        this.loadingVisitDetails = false;
        this.currentStep = 2;
      }
    });
  }

  // ───────────────── SEND EMAIL NOTIFICATION ─────────────────
  sendEmailNotification(): void {
    if (!this.personEmail || this.personEmail.trim() === '') {
      this.showToastMsg('Recipient email not found', 'error');
      return;
    }

    const fromEmail   = 'tvr3879@gmail.com';
    const toEmail     = this.personEmail;
    const visitorName = this.visitorName;

    this.visitorService.sendMail(fromEmail, toEmail, visitorName).subscribe({
      next: (response: any) => {
        console.log('Email sent successfully:', response);
        this.showToastMsg('Notification sent successfully', 'success');
      },
      error: (error: any) => {
        console.log('Email send failed:', error);
        this.showToastMsg('Email sending failed', 'error');
      }
    });
  }


toggleCaptureOptions(): void {
  this.showCaptureOptions = true;
}

closeCaptureOptions(): void {
  this.showCaptureOptions = false;
}

openCamera(): void {

  this.showCaptureOptions = false;

  const input = document.createElement('input');

  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';

  input.onchange = (event: any) => {

    const file = event.target.files[0];

    if (file) {

      const reader = new FileReader();

      reader.onload = () => {
        this.captureImage = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  };

  input.click();
}

onFileSelected(event: any): void {

  this.showCaptureOptions = false;

  const file = event.target.files[0];

  if (file) {

    const reader = new FileReader();

    reader.onload = () => {
      this.captureImage = reader.result as string;
    };

    reader.readAsDataURL(file);
  }
}



}