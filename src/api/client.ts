import axios from "axios";

// 기본 API URL 설정 (배포 환경에서는 상대 경로 사용)
const API_URL = "/api";

// API 클라이언트 생성
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
