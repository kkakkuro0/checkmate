import express, { Request, Response } from "express";
import { notion, EMPLOYEES_DATABASE_ID } from "../notionClient";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

const router = express.Router();

// 직원 인터페이스 정의
interface Employee {
  name: string;
  phone?: string; // 연락처
  email?: string; // 이메일
  profileImage?: string; // 프로필 사진 URL
}

// 타입 가드 함수
function isPropertyTitle(
  property: any
): property is { title: Array<{ text: { content: string } }> } {
  return property?.type === "title" && Array.isArray(property.title);
}

function isPropertySelect(
  property: any
): property is { select: { name: string } } {
  return property?.type === "select" && property.select !== null;
}

function isPropertyRichText(
  property: any
): property is { rich_text: Array<{ text: { content: string } }> } {
  return property?.type === "rich_text" && Array.isArray(property.rich_text);
}

function isPropertyEmail(property: any): property is { email: string } {
  return property?.type === "email" && typeof property.email === "string";
}

function isPropertyFile(property: any): property is {
  files: Array<{
    type: string;
    file?: { url: string };
    external?: { url: string };
  }>;
} {
  return property?.type === "files" && Array.isArray(property.files);
}

// 모든 직원 목록 가져오기
router.get("/", async (req: Request, res: Response) => {
  try {
    const response = await notion.databases.query({
      database_id: EMPLOYEES_DATABASE_ID as string,
      sorts: [
        {
          property: "이름",
          direction: "ascending",
        },
      ],
    });

    const employees: Employee[] = response.results
      .filter((page): page is PageObjectResponse => "properties" in page)
      .map((page) => {
        const name = isPropertyTitle(page.properties["이름"])
          ? page.properties["이름"].title[0]?.text?.content || "이름 없음"
          : "이름 없음";

        const department = isPropertySelect(page.properties["부서"])
          ? page.properties["부서"].select.name
          : "";

        const position = isPropertySelect(page.properties["직급"])
          ? page.properties["직급"].select.name
          : "";

        const employeeId = isPropertyRichText(page.properties["사원번호"])
          ? page.properties["사원번호"].rich_text[0]?.text?.content || ""
          : "";

        // 연락처 정보 추출
        let phone = "";
        if (isPropertyRichText(page.properties["연락처"])) {
          phone = page.properties["연락처"].rich_text[0]?.text?.content || "";
        }

        // 이메일 정보 추출
        let email = "";
        if (isPropertyEmail(page.properties["이메일"])) {
          email = page.properties["이메일"].email || "";
        }

        // 프로필 사진 URL 추출
        let profileImage = "";
        if (
          isPropertyFile(page.properties["프로필사진"]) &&
          page.properties["프로필사진"].files.length > 0
        ) {
          const file = page.properties["프로필사진"].files[0];
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

    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "직원 목록을 가져오는 데 실패했습니다." });
  }
});

export default router;
