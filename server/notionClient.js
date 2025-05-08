const { Client } = require("@notionhq/client");
require("dotenv").config();

// 노션 API 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// 데이터베이스 ID
const EMPLOYEES_DATABASE_ID = process.env.EMPLOYEES_DATABASE_ID;
const ATTENDANCE_DATABASE_ID = process.env.ATTENDANCE_DATABASE_ID;

module.exports = {
  notion,
  EMPLOYEES_DATABASE_ID,
  ATTENDANCE_DATABASE_ID,
};
