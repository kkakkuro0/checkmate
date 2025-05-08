import express, { Request, Response } from "express";
import { notion, ATTENDANCE_DATABASE_ID } from "../notionClient";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

const router = express.Router();

// 출퇴근 인터페이스 정의
interface AttendanceRecord {
  id: string;
  date: string;
  employeeId: string;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  status: string;
}

// 타입 가드 함수
function isRichTextProperty(property: any): property is {
  type: "rich_text";
  rich_text: Array<{ text: { content: string } }>;
} {
  return property?.type === "rich_text" && Array.isArray(property.rich_text);
}

function isNumberProperty(
  property: any
): property is { type: "number"; number: number | null } {
  return property?.type === "number";
}

function isSelectProperty(
  property: any
): property is { type: "select"; select: { name: string } | null } {
  return property?.type === "select";
}

function isDateProperty(
  property: any
): property is { type: "date"; date: { start: string } | null } {
  return property?.type === "date";
}

// 특정 직원의 오늘 출퇴근 기록 가져오기
router.get("/:employeeId/today", async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식

    const response = await notion.databases.query({
      database_id: ATTENDANCE_DATABASE_ID as string,
      filter: {
        and: [
          {
            property: "날짜",
            date: {
              equals: today,
            },
          },
          {
            property: "직원",
            relation: {
              contains: employeeId,
            },
          },
        ],
      },
    });

    if (response.results.length === 0) {
      return res
        .status(404)
        .json({ message: "오늘의 출퇴근 기록이 없습니다." });
    }

    const page = response.results[0];
    if (!("properties" in page)) {
      return res.status(500).json({ error: "올바른 페이지 형식이 아닙니다." });
    }

    const properties = page.properties;

    let checkInTime: string | undefined = undefined;
    if (
      isRichTextProperty(properties["출근시간"]) &&
      properties["출근시간"].rich_text.length > 0
    ) {
      checkInTime = properties["출근시간"].rich_text[0]?.text?.content;
    }

    let checkOutTime: string | undefined = undefined;
    if (
      isRichTextProperty(properties["퇴근시간"]) &&
      properties["퇴근시간"].rich_text.length > 0
    ) {
      checkOutTime = properties["퇴근시간"].rich_text[0]?.text?.content;
    }

    let workingHours: number | undefined = undefined;
    if (
      isRichTextProperty(properties["근무시간"]) &&
      properties["근무시간"].rich_text.length > 0
    ) {
      const workingHoursText =
        properties["근무시간"].rich_text[0]?.text?.content;
      workingHours = workingHoursText
        ? parseFloat(workingHoursText)
        : undefined;
    }

    let status = "미확인";
    if (isSelectProperty(properties["상태"]) && properties["상태"].select) {
      status = properties["상태"].select.name;
    }

    let dateValue = today;
    if (isDateProperty(properties["날짜"]) && properties["날짜"].date) {
      dateValue = properties["날짜"].date.start;
    }

    const record: AttendanceRecord = {
      id: page.id,
      date: dateValue,
      employeeId,
      checkInTime,
      checkOutTime,
      workingHours,
      status,
    };

    res.json(record);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "출퇴근 기록을 가져오는 데 실패했습니다." });
  }
});

// 출근 기록하기
router.post("/check-in", async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: "직원 ID가 필요합니다." });
    }

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const timeString = now.toLocaleTimeString("ko-KR", { hour12: false });

    // 오늘 이미 기록이 있는지 확인
    const existingRecord = await notion.databases.query({
      database_id: ATTENDANCE_DATABASE_ID as string,
      filter: {
        and: [
          {
            property: "날짜",
            date: {
              equals: today,
            },
          },
          {
            property: "직원",
            relation: {
              contains: employeeId,
            },
          },
        ],
      },
    });

    if (existingRecord.results.length > 0) {
      // 기존 기록이 있으면 업데이트
      const page = existingRecord.results[0];

      await notion.pages.update({
        page_id: page.id,
        properties: {
          출근시간: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: timeString,
                },
              },
            ],
          },
          상태: {
            select: {
              name: "근무중",
            },
          },
        },
      });

      res.json({ message: "출근이 기록되었습니다.", time: timeString });
    } else {
      // 직원 정보 조회
      const employeeResponse = await notion.pages.retrieve({
        page_id: employeeId,
      });

      let employeeName = "직원";
      if (
        "properties" in employeeResponse &&
        employeeResponse.properties["이름"] &&
        employeeResponse.properties["이름"].type === "title" &&
        employeeResponse.properties["이름"].title.length > 0 &&
        employeeResponse.properties["이름"].title[0].type === "text"
      ) {
        employeeName =
          employeeResponse.properties["이름"].title[0].text.content;
      }

      // 새 기록 생성
      await notion.pages.create({
        parent: {
          database_id: ATTENDANCE_DATABASE_ID as string,
        },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: `${employeeName} - ${timeString}`,
                },
              },
            ],
          },
          날짜: {
            date: {
              start: today,
            },
          },
          직원: {
            relation: [
              {
                id: employeeId,
              },
            ],
          },
          출근시간: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: timeString,
                },
              },
            ],
          },
          상태: {
            select: {
              name: "근무중",
            },
          },
        },
      });

      res.json({ message: "출근이 기록되었습니다.", time: timeString });
    }
  } catch (error) {
    console.error("Error checking in:", error);
    res.status(500).json({ error: "출근 기록에 실패했습니다." });
  }
});

// 퇴근 기록하기
router.post("/check-out", async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: "직원 ID가 필요합니다." });
    }

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const timeString = now.toLocaleTimeString("ko-KR", { hour12: false });

    // 오늘 기록 확인
    const existingRecord = await notion.databases.query({
      database_id: ATTENDANCE_DATABASE_ID as string,
      filter: {
        and: [
          {
            property: "날짜",
            date: {
              equals: today,
            },
          },
          {
            property: "직원",
            relation: {
              contains: employeeId,
            },
          },
        ],
      },
    });

    if (existingRecord.results.length === 0) {
      return res
        .status(404)
        .json({ error: "출근 기록이 없습니다. 먼저 출근해 주세요." });
    }

    const page = existingRecord.results[0];
    if (!("properties" in page)) {
      return res.status(500).json({ error: "올바른 페이지 형식이 아닙니다." });
    }

    // 출근 시간 가져오기
    const properties = page.properties;

    let checkInTime: string | null = null;
    if (
      isRichTextProperty(properties["출근시간"]) &&
      properties["출근시간"].rich_text.length > 0
    ) {
      checkInTime = properties["출근시간"].rich_text[0].text.content;
    }

    if (!checkInTime) {
      return res
        .status(400)
        .json({ error: "출근 시간이 기록되지 않았습니다." });
    }

    // 근무 시간 계산 (시간, 분 단위로 표시)
    const checkInDate = new Date(`${today}T${checkInTime}`);
    const diffMs = now.getTime() - checkInDate.getTime();

    // 시간과 분 계산
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // 표시 형식: "5시간 30분" 또는 "30분"
    let workingTimeText = "";
    if (hours > 0) {
      workingTimeText += `${hours}시간 `;
    }
    workingTimeText += `${minutes}분`;

    // 소수점 형태의 시간도 계산 (기존 코드 유지)
    const workingHours =
      Math.round(
        ((now.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)) * 10
      ) / 10;

    await notion.pages.update({
      page_id: page.id,
      properties: {
        퇴근시간: {
          rich_text: [
            {
              type: "text",
              text: {
                content: timeString,
              },
            },
          ],
        },
        근무시간: {
          rich_text: [
            {
              type: "text",
              text: {
                content: workingTimeText,
              },
            },
          ],
        },
        상태: {
          select: {
            name: "퇴근",
          },
        },
      },
    });

    res.json({
      message: "퇴근이 기록되었습니다.",
      time: timeString,
      workingHours: workingTimeText,
    });
  } catch (error) {
    console.error("Error checking out:", error);
    res.status(500).json({ error: "퇴근 기록에 실패했습니다." });
  }
});

// 특정 직원의 출퇴근 기록 목록 가져오기 (최근 30일)
router.get("/:employeeId", async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const formattedDate = thirtyDaysAgo.toISOString().split("T")[0];

    const response = await notion.databases.query({
      database_id: ATTENDANCE_DATABASE_ID as string,
      filter: {
        and: [
          {
            property: "날짜",
            date: {
              on_or_after: formattedDate,
            },
          },
          {
            property: "직원",
            relation: {
              contains: employeeId,
            },
          },
        ],
      },
      sorts: [
        {
          property: "날짜",
          direction: "descending",
        },
      ],
    });

    const records = response.results
      .filter((page): page is PageObjectResponse => "properties" in page)
      .map((page) => {
        const properties = page.properties;

        let dateValue = "";
        if (isDateProperty(properties["날짜"]) && properties["날짜"].date) {
          dateValue = properties["날짜"].date.start;
        }

        let checkInTime: string | undefined = undefined;
        if (
          isRichTextProperty(properties["출근시간"]) &&
          properties["출근시간"].rich_text.length > 0
        ) {
          checkInTime = properties["출근시간"].rich_text[0].text.content;
        }

        let checkOutTime: string | undefined = undefined;
        if (
          isRichTextProperty(properties["퇴근시간"]) &&
          properties["퇴근시간"].rich_text.length > 0
        ) {
          checkOutTime = properties["퇴근시간"].rich_text[0].text.content;
        }

        let workingHours: number | undefined = undefined;
        if (
          isRichTextProperty(properties["근무시간"]) &&
          properties["근무시간"].rich_text.length > 0
        ) {
          const workingHoursText =
            properties["근무시간"].rich_text[0]?.text?.content;
          workingHours = workingHoursText
            ? parseFloat(workingHoursText)
            : undefined;
        }

        let status = "미확인";
        if (isSelectProperty(properties["상태"]) && properties["상태"].select) {
          status = properties["상태"].select.name;
        }

        return {
          id: page.id,
          date: dateValue,
          employeeId,
          checkInTime,
          checkOutTime,
          workingHours,
          status,
        };
      });

    res.json(records);
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({ error: "출퇴근 기록을 가져오는 데 실패했습니다." });
  }
});

export default router;
