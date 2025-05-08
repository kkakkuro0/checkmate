// 직원 타입 정의
export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  employeeId: string;
  phone?: string; // 연락처
  email?: string; // 이메일
  profileImage?: string; // 프로필 사진 URL
}

// 출퇴근 기록 타입 정의
export interface AttendanceRecord {
  id: string;
  date: string;
  employeeId: string;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  status: string;
}

// API 에러 타입 정의
export interface ApiError {
  response?: {
    status: number;
    data: any;
  };
  message?: string;
}
