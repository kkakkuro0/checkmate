// 간단한 테스트 API

export default function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");

  // OPTIONS 요청 처리
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // GET 요청 처리
  if (req.method === "GET") {
    res.status(200).json({
      message: "API 테스트 성공!",
      timestamp: new Date().toISOString(),
      env: {
        notionApiKeyExists: process.env.NOTION_API_KEY ? true : false,
        employeesDbExists: process.env.EMPLOYEES_DATABASE_ID ? true : false,
        attendanceDbExists: process.env.ATTENDANCE_DATABASE_ID ? true : false,
      },
    });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
