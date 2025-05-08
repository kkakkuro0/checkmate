import { notion, EMPLOYEES_DATABASE_ID } from "./notionClient.js";

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // OPTIONS 요청일 경우 빈 응답 반환
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // GET 요청 처리
  if (req.method === "GET") {
    try {
      const response = await notion.databases.query({
        database_id: EMPLOYEES_DATABASE_ID,
        sorts: [
          {
            property: "이름",
            direction: "ascending",
          },
        ],
      });

      const employees = response.results
        .filter((page) => "properties" in page)
        .map((page) => {
          const properties = page.properties;

          // 이름 추출
          const name =
            properties["이름"]?.type === "title" &&
            properties["이름"].title.length > 0
              ? properties["이름"].title[0]?.text?.content || "이름 없음"
              : "이름 없음";

          // 부서 추출
          const department =
            properties["부서"]?.type === "select" && properties["부서"].select
              ? properties["부서"].select.name
              : "";

          // 직급 추출
          const position =
            properties["직급"]?.type === "select" && properties["직급"].select
              ? properties["직급"].select.name
              : "";

          // 사원번호 추출
          const employeeId =
            properties["사원번호"]?.type === "rich_text" &&
            properties["사원번호"].rich_text.length > 0
              ? properties["사원번호"].rich_text[0]?.text?.content || ""
              : "";

          // 연락처 정보 추출
          let phone = "";
          if (
            properties["연락처"]?.type === "rich_text" &&
            properties["연락처"].rich_text.length > 0
          ) {
            phone = properties["연락처"].rich_text[0]?.text?.content || "";
          }

          // 이메일 정보 추출
          let email = "";
          if (properties["이메일"]?.type === "email") {
            email = properties["이메일"].email || "";
          }

          // 프로필 사진 URL 추출
          let profileImage = "";
          if (
            properties["프로필사진"]?.type === "files" &&
            properties["프로필사진"].files.length > 0
          ) {
            const file = properties["프로필사진"].files[0];
            if (file.type === "file" && file.file) {
              profileImage = file.file.url;
            } else if (file.type === "external" && file.external) {
              profileImage = file.external.url;
            }
          }

          return {
            id: page.id,
            name,
            department,
            position,
            employeeId,
            phone,
            email,
            profileImage,
          };
        });

      res.status(200).json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "직원 목록을 가져오는 데 실패했습니다." });
    }
  } else {
    // 다른 HTTP 메서드 처리
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
