import { useState, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import type { Employee } from "./types";
import EmployeeSelect from "./components/EmployeeSelect";
import AttendanceStatus from "./components/AttendanceStatus";
import AttendanceHistory from "./components/AttendanceHistory";
import axios from "axios";

function App() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0); // 화면 갱신을 위한 키
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);

  // 직원 선택 핸들러
  const handleSelectEmployee = useCallback((employee: Employee | null) => {
    setSelectedEmployee(employee);
  }, []);

  // 화면 갱신 핸들러
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    toast.success("출퇴근 정보가 갱신되었습니다!");
  }, []);

  // API 테스트 핸들러
  const testApi = async () => {
    try {
      const response = await axios.get("/api/test");
      setApiTestResult(JSON.stringify(response.data, null, 2));
      toast.success("API 테스트 성공!");
    } catch (error) {
      console.error("API 테스트 실패:", error);
      setApiTestResult(JSON.stringify(error, null, 2));
      toast.error("API 테스트 실패!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="bg-white backdrop-blur-sm bg-opacity-90 shadow-lg rounded-2xl mb-10 p-8 transform transition-all hover:shadow-xl border border-gray-100">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  CheckMate
                </h1>
              </div>
              <p className="text-gray-500 text-lg">
                스마트한 출퇴근 관리 시스템
              </p>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl shadow-md flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-indigo-100"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {new Date().toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* API 테스트 섹션 */}
        <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-lg p-6 border border-gray-100 transition-all hover:border-indigo-200 hover:shadow-xl mb-10">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              API 테스트
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-gray-600">
              API 연결을 테스트하려면 아래 버튼을 클릭하세요.
            </p>
            <button
              onClick={testApi}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-colors w-full md:w-auto"
            >
              API 테스트 실행
            </button>
            {apiTestResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {apiTestResult}
                </pre>
              </div>
            )}
          </div>
        </div>

        <main className="space-y-10">
          <div className="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-lg p-6 border border-gray-100 transition-all hover:border-indigo-200 hover:shadow-xl">
            <div className="border-b border-gray-100 pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                직원 선택
              </h2>
            </div>
            <EmployeeSelect
              onSelectEmployee={handleSelectEmployee}
              selectedEmployeeId={selectedEmployee?.id}
            />
          </div>

          {/* 출퇴근 상태 */}
          <AttendanceStatus
            key={refreshKey} // 강제 리렌더링을 위한 키
            employee={selectedEmployee}
            onRefresh={handleRefresh}
          />

          {/* 출퇴근 기록 */}
          <AttendanceHistory
            key={`history-${refreshKey}`} // 강제 리렌더링을 위한 키
            employee={selectedEmployee}
          />
        </main>

        <footer className="mt-14 p-8 bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-lg text-center border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-semibold">
                  CheckMate &copy; {new Date().getFullYear()}
                </p>
              </div>
              <p className="text-gray-500 text-sm">
                노션 API 기반 근태 관리 시스템
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 rounded-lg text-xs font-medium">
                Vite
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-lg text-xs font-medium">
                React
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-lg text-xs font-medium">
                Notion API
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* 토스트 알림 */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
