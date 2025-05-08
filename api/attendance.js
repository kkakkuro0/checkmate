import { notion, ATTENDANCE_DATABASE_ID } from "./notionClient.js";

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // OPTIONS 요청일 경우 빈 응답 반환
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // URL에서 직원 ID와 액션 추출
  const { employeeId, action } = req.query;

  // GET 요청 처리 - 출퇴근 기록 가져오기
  if (req.method === "GET") {
    // 오늘의 출퇴근 기록
    if (action === "today") {
      try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식

        const response = await notion.databases.query({
          database_id: ATTENDANCE_DATABASE_ID,
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
          return res
            .status(500)
            .json({ error: "올바른 페이지 형식이 아닙니다." });
        }

        const properties = page.properties;

        let checkInTime = undefined;
        if (
          properties["출근시간"]?.type === "rich_text" &&
          properties["출근시간"].rich_text.length > 0
        ) {
          checkInTime = properties["출근시간"].rich_text[0]?.text?.content;
        }

        let checkOutTime = undefined;
        if (
          properties["퇴근시간"]?.type === "rich_text" &&
          properties["퇴근시간"].rich_text.length > 0
        ) {
          checkOutTime = properties["퇴근시간"].rich_text[0]?.text?.content;
        }

        let workingHours = undefined;
        if (
          properties["근무시간"]?.type === "rich_text" &&
          properties["근무시간"].rich_text.length > 0
        ) {
          const workingHoursText =
            properties["근무시간"].rich_text[0]?.text?.content;
          workingHours = workingHoursText
            ? parseFloat(workingHoursText)
            : undefined;
        }

        let status = "미확인";
        if (
          properties["상태"]?.type === "select" &&
          properties["상태"].select
        ) {
          status = properties["상태"].select.name;
        }

        let dateValue = today;
        if (properties["날짜"]?.type === "date" && properties["날짜"].date) {
          dateValue = properties["날짜"].date.start;
        }

        const record = {
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
        res
          .status(500)
          .json({ error: "출퇴근 기록을 가져오는 데 실패했습니다." });
      }
    }
    // 출퇴근 기록 히스토리
    else {
      try {
        // 최근 30일 기록 가져오기
        const response = await notion.databases.query({
          database_id: ATTENDANCE_DATABASE_ID,
          filter: {
            property: "직원",
            relation: {
              contains: employeeId,
            },
          },
          sorts: [
            {
              property: "날짜",
              direction: "descending",
            },
          ],
          page_size: 30,
        });

        const records = response.results
          .filter((page) => "properties" in page)
          .map((page) => {
            const properties = page.properties;

            let dateValue = "";
            if (
              properties["날짜"]?.type === "date" &&
              properties["날짜"].date
            ) {
              dateValue = properties["날짜"].date.start;
            }

            let checkInTime = undefined;
            if (
              properties["출근시간"]?.type === "rich_text" &&
              properties["출근시간"].rich_text.length > 0
            ) {
              checkInTime = properties["출근시간"].rich_text[0]?.text?.content;
            }

            let checkOutTime = undefined;
            if (
              properties["퇴근시간"]?.type === "rich_text" &&
              properties["퇴근시간"].rich_text.length > 0
            ) {
              checkOutTime = properties["퇴근시간"].rich_text[0]?.text?.content;
            }

            let workingHours = undefined;
            if (
              properties["근무시간"]?.type === "rich_text" &&
              properties["근무시간"].rich_text.length > 0
            ) {
              const workingHoursText =
                properties["근무시간"].rich_text[0]?.text?.content;
              workingHours = workingHoursText
                ? parseFloat(workingHoursText)
                : undefined;
            }

            let status = "미확인";
            if (
              properties["상태"]?.type === "select" &&
              properties["상태"].select
            ) {
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
        console.error("Error fetching attendance records:", error);
        res
          .status(500)
          .json({ error: "출퇴근 기록을 가져오는 데 실패했습니다." });
      }
    }
  }
  // POST 요청 처리 - 출근/퇴근 기록하기
  else if (req.method === "POST") {
    const { employeeId } = req.body;
    const action = req.query.action;

    if (!employeeId) {
      return res.status(400).json({ error: "직원 ID가 필요합니다." });
    }

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const timeString = now.toLocaleTimeString("ko-KR", { hour12: false });

    // 출근 처리
    if (action === "check-in") {
      try {
        // 오늘 이미 기록이 있는지 확인
        const existingRecord = await notion.databases.query({
          database_id: ATTENDANCE_DATABASE_ID,
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
          // 신규 기록 생성
          await notion.pages.create({
            parent: {
              database_id: ATTENDANCE_DATABASE_ID,
            },
            properties: {
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
    }
    // 퇴근 처리
    else if (action === "check-out") {
      try {
        // 오늘 기록이 있는지 확인
        const existingRecord = await notion.databases.query({
          database_id: ATTENDANCE_DATABASE_ID,
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
          return res.status(404).json({ error: "출근 기록이 없습니다." });
        }

        const page = existingRecord.results[0];
        if (!("properties" in page)) {
          return res
            .status(500)
            .json({ error: "올바른 페이지 형식이 아닙니다." });
        }

        const properties = page.properties;

        // 출근 시간 가져오기
        let checkInTime = "";
        if (
          properties["출근시간"]?.type === "rich_text" &&
          properties["출근시간"].rich_text.length > 0
        ) {
          checkInTime = properties["출근시간"].rich_text[0]?.text?.content;
        }

        if (!checkInTime) {
          return res.status(400).json({ error: "출근 기록이 없습니다." });
        }

        // 근무 시간 계산 (시간 단위)
        const checkInHours = parseInt(checkInTime.split(":")[0]);
        const checkInMinutes = parseInt(checkInTime.split(":")[1]);
        const checkOutHours = now.getHours();
        const checkOutMinutes = now.getMinutes();

        let workingHours =
          checkOutHours -
          checkInHours +
          (checkOutMinutes - checkInMinutes) / 60;
        workingHours = Math.round(workingHours * 10) / 10; // 소수점 한 자리까지

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
                    content: workingHours.toString(),
                  },
                },
              ],
            },
            상태: {
              select: {
                name: "퇴근완료",
              },
            },
          },
        });

        res.json({
          message: "퇴근이 기록되었습니다.",
          time: timeString,
          workingHours,
        });
      } catch (error) {
        console.error("Error checking out:", error);
        res.status(500).json({ error: "퇴근 기록에 실패했습니다." });
      }
    } else {
      res.status(400).json({ error: "유효하지 않은 액션입니다." });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
