import { useState, useEffect } from "react";
import { attendanceApi } from "../api/services";
import type { Employee, AttendanceRecord } from "../types";

interface AttendanceStatusProps {
  employee: Employee | null;
  onRefresh: () => void;
}

export default function AttendanceStatus({
  employee,
  onRefresh,
}: AttendanceStatusProps) {
  const [attendanceRecord, setAttendanceRecord] =
    useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 출퇴근 상태 가져오기
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!employee) {
        setAttendanceRecord(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await attendanceApi.getTodayAttendance(employee.id);
        setAttendanceRecord(data);
      } catch (err) {
        setError("출퇴근 정보를 가져오는 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [employee]);

  // 출근 기록
  const handleCheckIn = async () => {
    if (!employee) return;

    try {
      setActionLoading(true);
      setError(null);
      await attendanceApi.checkIn(employee.id);
      // 상태 갱신
      onRefresh();
      const data = await attendanceApi.getTodayAttendance(employee.id);
      setAttendanceRecord(data);
    } catch (err) {
      setError("출근 기록 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // 퇴근 기록
  const handleCheckOut = async () => {
    if (!employee) return;

    try {
      setActionLoading(true);
      setError(null);
      await attendanceApi.checkOut(employee.id);
      // 상태 갱신
      onRefresh();
      const data = await attendanceApi.getTodayAttendance(employee.id);
      setAttendanceRecord(data);
    } catch (err) {
      setError("퇴근 기록 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // 버튼 상태 결정
  const canCheckIn = !attendanceRecord || !attendanceRecord.checkInTime;
  const canCheckOut =
    attendanceRecord &&
    attendanceRecord.checkInTime &&
    !attendanceRecord.checkOutTime &&
    attendanceRecord.status !== "퇴근";

  if (!employee) {
    return (
      <div className="text-center text-gray-500 py-6">직원을 선택하세요</div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:border-indigo-200 transition-all">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-indigo-800">
          {employee.name}님의 출퇴근 상태
        </h2>
        <div className="text-sm px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
          {employee.department} / {employee.position}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg my-4 border border-red-100">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm">
              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm font-medium text-blue-700">
                  출근 시간
                </div>
              </div>
              <div className="text-xl font-semibold text-gray-800">
                {attendanceRecord?.checkInTime || "미등록"}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-100 shadow-sm">
              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-600 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm font-medium text-purple-700">
                  퇴근 시간
                </div>
              </div>
              <div className="text-xl font-semibold text-gray-800">
                {attendanceRecord?.checkOutTime || "미등록"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 shadow-sm">
              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-600 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm font-medium text-green-700">
                  근무 상태
                </div>
              </div>
              <div className="text-xl font-semibold">
                <span
                  className={`px-3 py-1 rounded-full ${
                    attendanceRecord?.status === "근무중"
                      ? "bg-blue-100 text-blue-800"
                      : attendanceRecord?.status === "퇴근"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {attendanceRecord?.status || "미확인"}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100 shadow-sm">
              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-600 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm font-medium text-amber-700">
                  근무 시간
                </div>
              </div>
              <div className="text-xl font-semibold text-gray-800">
                {attendanceRecord?.workingHours || "미기록"}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              className={`flex-1 py-3 px-6 rounded-xl font-medium text-white shadow-md transition-all flex items-center justify-center ${
                canCheckIn
                  ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              onClick={handleCheckIn}
              disabled={!canCheckIn || actionLoading}
            >
              {actionLoading && canCheckIn ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  처리 중...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  출근하기
                </>
              )}
            </button>

            <button
              className={`flex-1 py-3 px-6 rounded-xl font-medium text-white shadow-md transition-all flex items-center justify-center ${
                canCheckOut
                  ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              onClick={handleCheckOut}
              disabled={!canCheckOut || actionLoading}
            >
              {actionLoading && canCheckOut ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  처리 중...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                      clipRule="evenodd"
                      transform="rotate(180 10 10)"
                    />
                  </svg>
                  퇴근하기
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
