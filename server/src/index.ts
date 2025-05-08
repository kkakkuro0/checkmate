import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import employeesRouter from "./routes/employees";
import attendanceRouter from "./routes/attendance";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우터
app.use("/api/employees", employeesRouter);
app.use("/api/attendance", attendanceRouter);

// 테스트용 라우트
app.get("/", (req, res) => {
  res.json({ message: "CheckMate API 서버가 실행 중입니다." });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
