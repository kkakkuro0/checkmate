import apiClient from "./client";
import type { ApiError } from "../types";

// 직원 관련 API
export const employeeApi = {
  // 직원 목록 가져오기
  getEmployees: async () => {
    try {
      const response = await apiClient.get("/employees");
      return response.data;
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },
};

// 출퇴근 관련 API
export const attendanceApi = {
  // 오늘의 출퇴근 정보 가져오기
  getTodayAttendance: async (employeeId: string) => {
    try {
      const response = await apiClient.get(
        `/attendance?employeeId=${employeeId}&action=today`
      );
      return response.data;
    } catch (error) {
      if ((error as ApiError).response?.status === 404) {
        return null; // 출근 기록이 없는 경우
      }
      console.error("Error fetching today attendance:", error);
      throw error;
    }
  },

  // 출근 기록하기
  checkIn: async (employeeId: string) => {
    try {
      const response = await apiClient.post(`/attendance?action=check-in`, {
        employeeId,
      });
      return response.data;
    } catch (error) {
      console.error("Error checking in:", error);
      throw error;
    }
  },

  // 퇴근 기록하기
  checkOut: async (employeeId: string) => {
    try {
      const response = await apiClient.post(`/attendance?action=check-out`, {
        employeeId,
      });
      return response.data;
    } catch (error) {
      console.error("Error checking out:", error);
      throw error;
    }
  },

  // 출퇴근 기록 목록 가져오기
  getAttendanceHistory: async (employeeId: string) => {
    try {
      const response = await apiClient.get(
        `/attendance?employeeId=${employeeId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      throw error;
    }
  },
};
