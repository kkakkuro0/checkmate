const express = require("express");
const router = express.Router();
const { notion, EMPLOYEES_DATABASE_ID } = require("../notionClient");

// 모든 직원 목록 가져오기
router.get("/", async (req, res) => {
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

    const employees = response.results.map((page) => {
      return {
        id: page.id,
        name: page.properties["이름"]?.title[0]?.text?.content || "이름 없음",
        department: page.properties["부서"]?.select?.name || "",
        position: page.properties["직급"]?.select?.name || "",
        employeeId:
          page.properties["사원번호"]?.rich_text[0]?.text?.content || "",
      };
    });

    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "직원 목록을 가져오는 데 실패했습니다." });
  }
});

module.exports = router;
