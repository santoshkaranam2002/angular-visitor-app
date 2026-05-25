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

  constructor(private visitorService: VisitorService,  private http: HttpClient,   
 ) {}

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
  visitorEmail: string = '';        // new visitor's own email (Step 1 - New Visitor tab)
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
  personEmail: string = '';         // auto-filled from selected person to meet (Step 2)
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
    this.selectedVisitor = visitor;
    this.visitorID      = visitor.visitorID;
    this.visitorName    = visitor.fullName;
    this.mobileNumber   = visitor.mobileNumber;
    this.visitorEmail   = visitor.email;      // visitor's own email
    this.company        = visitor.company;
    this.address        = visitor.address;
    this.idNumber       = visitor.idNumber;
    this.vehicleNumber  = visitor.vehicleNumber;
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

  // ───────────────── PREV STEP ─────────────────
  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  // ───────────────── BUILD TEAM MEMBERS JSON ─────────────────
  buildTeamMembersJson(): string {
    const filtered = this.teamMembers.filter(m => m.memberName.trim() || m.idProof.trim());
    if (filtered.length === 0) return '[]';
    return JSON.stringify(filtered.map(m => ({ name: m.memberName, mobile: m.idProof })));
  }

  // ───────────────── BUILD DEVICES JSON ─────────────────
  buildDevicesJson(): string {
    const filtered = this.devices.filter(d => d.deviceType.trim() || d.serialNumber.trim());
    if (filtered.length === 0) return '[]';
    return JSON.stringify(filtered.map(d => ({ deviceName: d.deviceType, serialNumber: d.serialNumber })));
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

  // ───────────────── SUBMIT ─────────────────
  submitVisitor(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const isNewVisitor = this.activeTab === 'new';

    const payload = {
      visitorID:            this.activeTab === 'existing' ? this.visitorID : 0,
      visitorCode:          '',
      fullName:             this.visitorName,
      mobileNumber:         this.mobileNumber,
      email:                this.visitorEmail,         // visitor's own email
      company:              this.company,
      address:              this.address,
      idProofTypeID:        this.getIdProofTypeID(),
      idNumber:             this.idNumber,
      vehicleNumber:        this.vehicleNumber,
      photoPath:            this.captureImage || '',
      isBlacklisted:        false,
      message:              '',
      unitID:               1,
      deptID:               this.selectedDeptID || 1,
      gateID:               this.getGateID(),
      personToMeetUserID:   this.selectedPersonToMeetID || 0,
      personToMeetName:     this.selectedPersonToMeetName,
      personToMeetEmail:    this.personEmail,          // person-to-meet's email
      purposeOfVisit:       this.purposeOfVisit,
      visitType:            this.visitType === 'single' ? 'Temporary' : 'Regular',
      startDate:            this.startDate ? new Date(this.startDate).toISOString() : new Date().toISOString(),
      endDate:              this.endDate   ? new Date(this.endDate).toISOString()   : new Date(this.startDate).toISOString(),
      createdByUserID:      1,
      teamMembersJson:      this.buildTeamMembersJson(),
      devicesJson:          this.buildDevicesJson()
    };

    console.log('Submit Payload:', payload);

    this.visitorService.addVisitor(payload).subscribe({
      next: (response: any) => {
        console.log('API Success Response:', response);
        this.isSubmitting             = false;
        this.visitorID                = response.response.visitorID;
        this.visitorName              = response.response.fullName           || this.visitorName;
        this.mobileNumber             = response.response.mobileNumber       || this.mobileNumber;
        // this.visitorEmail             = response.response.email              || this.visitorEmail;
        this.visitorEmail = this.visitorEmail || response.response.email || '';
        this.company                  = response.response.company            || this.company;
        this.address                  = response.response.address            || this.address;
        this.purposeOfVisit           = response.response.purposeOfVisit     || this.purposeOfVisit;
        this.selectedPersonToMeetName = response.response.personToMeetName   || this.selectedPersonToMeetName;
        this.personEmail              = response.response.personToMeetEmail  || this.personEmail;
        this.visitType                = response.response.visitType          || this.visitType;

          this.sendEmailNotification();

        const successMessage = isNewVisitor ? 'Visitor Registered Successfully!' : 'Visitor Updated Successfully!';
        this.showToastMsg(successMessage, 'success');
        setTimeout(() => { this.showProfilePopup = true; }, 2000);
      },
      error: (error: any) => {
        console.log('API Error Response:', error);
        this.isSubmitting = false;
        this.showToastMsg(error?.error?.message || 'Something went wrong. Please try again.', 'error');
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
    if (idProofTypeID === undefined) return 'Aadhar Card';
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
    this.selectedVisitor = visitor;
    this.visitorID       = visitor.visitorID;
    this.visitorName     = visitor.fullName;
    this.mobileNumber    = visitor.mobileNumber;
    this.visitorEmail    = visitor.email || '';   // visitor's own email
    this.company         = visitor.company;
    this.address         = visitor.address;
    this.idProofType     = this.getIdProofTypeName(visitor.idProofTypeID);
    this.idNumber        = visitor.idNumber;
    this.vehicleNumber   = visitor.vehicleNumber || '';
    this.showVisitorDetailsPopup = true;
  }

  closeVisitorDetailsPopup(): void {
    this.showVisitorDetailsPopup = false;
  }

  confirmVisitorSelection(): void {
    this.showVisitorDetailsPopup = false;
    this.currentStep = 2;
  }




// sendEmailNotification(): void {

//   if (!this.personEmail || this.personEmail.trim() === '') {

//     this.showToastMsg(
//       'Recipient email not found',
//       'error'
//     );

//     return;
//   }

//   const templateParams = {

//     to_email: this.personEmail,
//     to_name: this.selectedPersonToMeetName,
//     visitor_name: this.visitorName,
//     purpose: this.purposeOfVisit,
//     visit_date: this.startDate,
//     mobile: this.mobileNumber

//   };

//   emailjs.send(

//     'service_x08dcy9',
//     'template_z6i2zfx',
//     templateParams,
//     'Vk_J6Lcc60ZpKQdHx'

//   )
//   .then((response) => {

//     console.log('SUCCESS!', response);

//     this.showToastMsg(
//       'Notification sent successfully',
//       'success'
//     );

//   })
//   .catch((error) => {

//     console.log('EMAIL ERROR:', error);

//     this.showToastMsg(
//       'Email sending failed',
//       'error'
//     );

//   });
// }


// ───────────────── SEND EMAIL NOTIFICATION ─────────────────

sendEmailNotification(): void {
  if (!this.personEmail || this.personEmail.trim() === '') {
    this.showToastMsg('Recipient email not found', 'error');
    return;   
  }

  const fromEmail = 'tvr3879@gmail.com'; // your sender/admin email
  const toEmail = this.personEmail;       // auto-filled person-to-meet email
  const visitorName = this.visitorName;   // visitor name

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

}