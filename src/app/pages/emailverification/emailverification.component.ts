import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-emailverification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emailverification.component.html',
  styleUrls: ['./emailverification.component.scss']
})
export class EmailverificationComponent implements OnInit {

  // ── Visitor Fields ──
  visitorName: string = '';
  mobileNumber: string = '';
  visitorEmail: string = '';
  company: string = '';
  address: string = '';
  idProofType: string = '';
  idNumber: string = '';
  vehicleNumber: string = '';

  // ── Visit Fields ──
  purposeOfVisit: string = '';
  department: string = '';
  personToMeet: string = '';
  visitType: string = '';
  visitDate: string = '';
  entryGate: string = '';

  // ── Team Members ──
  teamMembers: { memberName: string; idProof: string }[] = [];

  // ── Result ──
  showResult: boolean = false;
  resultType: 'approved' | 'rejected' = 'approved';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Read query params from email link
    // e.g. /emailverification?name=John&mobile=9999...
    this.route.queryParams.subscribe(params => {
      this.visitorName    = params['name']        || '';
      this.mobileNumber   = params['mobile']      || '';
      this.visitorEmail   = params['email']       || '';
      this.company        = params['company']     || '';
      this.address        = params['address']     || '';
      this.idProofType    = params['idProofType'] || '';
      this.idNumber       = params['idNumber']    || '';
      this.vehicleNumber  = params['vehicle']     || '';
      this.purposeOfVisit = params['purpose']     || '';
      this.department     = params['dept']        || '';
      this.personToMeet   = params['person']      || '';
      this.visitType      = params['visitType']   || 'Single Day';
      this.visitDate      = params['date']        || '';
      this.entryGate      = params['gate']        || '';

      // Parse team members if passed as JSON string
      try {
        const tm = params['team'];
        if (tm) this.teamMembers = JSON.parse(decodeURIComponent(tm));
      } catch { this.teamMembers = []; }
    });
  }

  onApprove(): void {
    this.resultType = 'approved';
    this.showResult = true;
    // TODO: call your approval API here
  }

  onReject(): void {
    this.resultType = 'rejected';
    this.showResult = true;
    // TODO: call your reject API here
  }
closeResult(): void {
  this.showResult = false;
}

}