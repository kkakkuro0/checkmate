import { useState, useEffect } from "react";
import { employeeApi } from "../api/services";
import type { Employee } from "../types";

interface EmployeeSelectProps {
  onSelectEmployee: (employee: Employee | null) => void;
  selectedEmployeeId?: string;
}

export default function EmployeeSelect({
  onSelectEmployee,
  selectedEmployeeId,
}: EmployeeSelectProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 직원 목록 가져오기
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await employeeApi.getEmployees();
        setEmployees(data);
      } catch (err) {
        setError("직원 목록을 가져오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // 직원 선택 핸들러
  const handleSelectEmployee = (employee: Employee) => {
    onSelectEmployee(employee);
  };

  return (
    <div>
      <div className="border-b border-gray-100 pb-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
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

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 flex items-center gap-2 mb-4 p-4 bg-red-50 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
      ) : employees.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-gray-300 mb-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-lg font-medium">등록된 직원이 없습니다.</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
                  selectedEmployeeId === employee.id
                    ? "ring-2 ring-offset-2 ring-indigo-500 transform scale-105 shadow-md"
                    : "border border-gray-200 hover:border-indigo-200 hover:shadow-md"
                }`}
                onClick={() => handleSelectEmployee(employee)}
              >
                <div className="aspect-square bg-gradient-to-br from-indigo-50 to-blue-50 relative">
                  {employee.profileImage ? (
                    <img
                      src={employee.profileImage}
                      alt={`${employee.name}의 프로필`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div
                        className={`w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center ${
                          selectedEmployeeId === employee.id
                            ? "bg-indigo-200"
                            : ""
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-10 w-10 ${
                            selectedEmployeeId === employee.id
                              ? "text-indigo-600"
                              : "text-indigo-400"
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                  {selectedEmployeeId === employee.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium text-gray-900 text-center truncate">
                    {employee.name}
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1 flex items-center justify-center gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full truncate">
                      {employee.department}
                    </span>
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full truncate">
                      {employee.position}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedEmployeeId && employees.length > 0 && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="flex items-start gap-4">
            {employees
              .filter((emp) => emp.id === selectedEmployeeId)
              .map((emp) => (
                <div key={emp.id} className="flex items-start gap-4 w-full">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-500 flex-shrink-0">
                    {emp.profileImage ? (
                      <img
                        src={emp.profileImage}
                        alt={`${emp.name}의 프로필`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-800">
                      {emp.name}
                    </div>
                    <div className="text-gray-500 flex flex-wrap gap-2 mt-1 items-center">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {emp.department}
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {emp.position}
                      </span>
                      {emp.employeeId && (
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          사원번호: {emp.employeeId}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {emp.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          {emp.phone}
                        </div>
                      )}
                      {emp.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          {emp.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
