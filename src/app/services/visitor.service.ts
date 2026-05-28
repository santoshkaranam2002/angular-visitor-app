import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  private baseUrl = 'https://localhost:7236/api/VisitorModule';
  private adminUrl = 'https://localhost:7236/api/Admin';

  constructor(private http: HttpClient) {}

  // ───────── Visitor ─────────
  addVisitor(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/AddUpdateVisitor`, data);
  }

  getLastVisitByVisitorID(visitorID: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/GetVisitDetail/${visitorID}`);
}

  searchVisitor(searchText: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/SearchVisitor/${searchText}`);
  }

  // ───────── Department ─────────

  getAllDepartments(): Observable<any> {
    return this.http.get(`${this.adminUrl}/GetDepartmentList`);
  }

  addUpdateDepartment(data: any): Observable<any> {
    return this.http.post(`${this.adminUrl}/AddUpdateDepartment`, data);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.adminUrl}/DeleteDepartment/${id}`);
  }

  getAllUsers(unitId: number): Observable<any> {
    return this.http.get(`${this.adminUrl}/GetlistofUser/${unitId}`);
  }

  addUpdateUser(data: any): Observable<any> {
    return this.http.post(`${this.adminUrl}/AddUpdateUser`, data);
  }

  deleteUser(userId: number, unitId: number): Observable<any> {
    return this.http.delete(`${this.adminUrl}/DeleteUser/${userId}/${unitId}`);
  }

  getAllRoles(): Observable<any> {
    return this.http.get(`${this.adminUrl}/GetRoleList`);
  }

  addUpdateRole(data: any): Observable<any> {
    return this.http.post(`${this.adminUrl}/AddUpdateRole`, data );
  }


  deleteRole(roleId: number, userId: number): Observable<any> {
    return this.http.delete( `${this.adminUrl}/DeleteRole/${roleId}/${userId}` );
  }

  getDepartmentDD(): Observable<any> {
    return this.http.get(`${this.adminUrl}/GET_DepartmentDD`);
  }


  getUsersByDepartment(deptId: number): Observable<any> {
    return this.http.get(`${this.adminUrl}/GetUsersByDepartment?deptId=${deptId}`);
  }


  getUserEmailByUserID(userId: number): Observable<any> {
    return this.http.get(`${this.adminUrl}/GetUserEmailByUserID?userId=${userId}`);
  }


  getVisitorDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetVisitorDashboard`);
  }

  sendMail(fromEmail: string, toEmail: string, visitorName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/SendMail/${fromEmail}/${toEmail}/${visitorName}/`, {
      responseType: 'text' as 'json'   // ← 'as json' tells TypeScript to accept it
    });
  }


  getUnits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/GetUnit`);
  }


  validateUser(unitId: number, userName: string, password: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.adminUrl}/Get_UserValidate?UNITID=${unitId}&UserName=${encodeURIComponent(userName)}&Password=${encodeURIComponent(password)}`
    );
  }

  
  getVisitorsByLoggedInUser(loggedInUserID: number, pageNumber: number = 1, pageSize: number = 10): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.adminUrl}/GetVisitorsByLoggedInUser?LoggedInUserID=${loggedInUserID}&PageNumber=${pageNumber}&PageSize=${pageSize}`
    );
  }

  validateSecurity(userName: string, password: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.adminUrl}/Get_SecurityValidate?UserName=${encodeURIComponent(userName)}&Password=${encodeURIComponent(password)}`
    );
  }

  approveVisit(visitID: number, decision: string, approvedByUserID: number, rejectionReason: string = ''): Observable<any> {
  return this.http.post(`${this.adminUrl}/ProcessApproval`, {
    visitID,
    decision,
    approvedByUserID,
    rejectionReason
  });
}

  addCheckIn(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/AddCheckIn`, data);
  }

  addCheckOut(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/AddCheckOut`, data);
  }



}