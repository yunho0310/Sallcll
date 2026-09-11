const DAYS = ["월", "화", "수", "목", "금"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const COURSES = [
  { id: "CS1304", name: "빅데이터분석", prof: "유기열", credit: 3, type: "전심", days: ["화"], periods: [2, 3], room: "620" },
  { id: "CS1061", name: "네트워크프로그래밍", prof: "노정규", credit: 3, type: "전심", days: ["목"], periods: [2, 3] },
  { id: "CS1144", name: "자료구조및실습", prof: "이지영", credit: 3, type: "전심", days: ["수"], periods: [2, 3] },
  { id: "CS1402", name: "소프트웨어분석및설계", prof: "노정규", credit: 3, type: "전심", days: ["월"], periods: [2, 3] },
  { id: "CS1301", name: "웹서버컴퓨팅", prof: "이지영", credit: 3, type: "전심", days: ["목"], periods: [2, 1] },
  { id: "CS1302", name: "시스템프로그래밍", prof: "김성식", credit: 3, type: "전심", days: ["수"], periods: [2, 1] },
  { id: "CS1521", name: "자바프로그래밍", prof: "유석원", credit: 3, type: "전심", days: ["화"], periods: [3, 4] },
  { id: "CS15125", name: "소프트웨어실습1", prof: "유석원", credit: 3, type: "전공", days: ["목"], periods: [3, 4] },
  { id: "CS1048", name: "데이터베이스", prof: "김성식", credit: 3, type: "전택", days: ["수"], periods: [2, 1] },
  { id: "CS1401", name: "소프트웨어공학", prof: "신우창", credit: 3, type: "전심", days: ["월"], periods: [2, 2] },
  { id: "CS1037", name: "프로그래밍언어론", prof: "김선희", credit: 3, type: "전심", days: ["수"], periods: [2, 3] },
  { id: "GE2033", name: "생활속의영어이야기", prof: "김용우", credit: 3, type: "교선", days: ["수"], periods: [2, 3] },
  { id: "CS1143", name: "컴퓨터아키텍처", prof: "정문수", credit: 3, type: "전심", days: ["화", "목"], periods: [2, 1] },
  { id: "CS1541", name: "캡스톤설계1", prof: "김선희", credit: 3, type: "전심", days: ["월"], periods: [5, 6] },
];

const wish = new Set();
const plan = new Map();
let query = "";

function slotKey(day, period) {
  return `${day}-${period}`;
}

function courseSlots(course) {
  const slots = [];
  for (const day of course.days) {
    const start = Math.min(...course.periods);
    const end = Math.max(...course.periods);
    for (let p = start; p <= end; p += 1) {
      slots.push(slotKey(day, p));
    }
  }
  return slots;
}

function occupiedKeys() {
  const keys = new Set();
  for (const course of plan.values()) {
    for (const key of courseSlots(course)) {
      keys.add(key);
    }
  }
  return keys;
}

function matchesWish(course) {
  if (wish.size === 0) return false;
  return courseSlots(course).some((key) => wish.has(key));
}

function conflicts(course) {
  const taken = occupiedKeys();
  return courseSlots(course).some((key) => taken.has(key));
}

function renderGrid() {
  const body = document.getElementById("grid-body");
  const busy = occupiedKeys();
  const planBySlot = new Map();
  for (const course of plan.values()) {
    for (const key of courseSlots(course)) {
      planBySlot.set(key, course);
    }
  }

  body.replaceChildren();
  for (const period of PERIODS) {
    const tr = document.createElement("tr");
    const time = document.createElement("th");
    time.className = "time";
    time.textContent = `${period}`;
    tr.append(time);

    for (const day of DAYS) {
      const key = slotKey(day, period);
      const td = document.createElement("td");
      td.className = "slot";
      const planned = planBySlot.get(key);

      if (planned) {
        td.classList.add("busy");
        td.textContent = planned.name;
        td.title = `${planned.name} · ${planned.prof}`;
      } else {
        if (wish.has(key)) {
          td.classList.add("on");
          td.textContent = "위시";
        }
        td.tabIndex = 0;
        td.dataset.key = key;
        td.setAttribute("aria-pressed", wish.has(key) ? "true" : "false");
        td.addEventListener("click", () => toggleWish(key));
        td.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleWish(key);
          }
        });
      }

      if (busy.has(key) === false) {
        td.setAttribute("aria-label", `${day} ${period}교시`);
      }
      tr.append(td);
    }
    body.append(tr);
  }
}

function toggleWish(key) {
  if (wish.has(key)) wish.delete(key);
  else wish.add(key);
  render();
}

function addCourse(id) {
  const course = COURSES.find((item) => item.id === id);
  if (!course || plan.has(id) || conflicts(course)) return;
  plan.set(id, { ...course });
  for (const key of courseSlots(course)) {
    wish.delete(key);
  }
  render();
}

function renderResults() {
  const list = document.getElementById("results");
  const empty = document.getElementById("empty");
  const credits = document.getElementById("credits");
  credits.textContent = `${[...plan.values()].reduce((sum, c) => sum + c.credit, 0)}학점`;

  const needle = query.trim().toLowerCase();
  const hits = COURSES.filter((course) => {
    if (plan.has(course.id)) return false;
    if (wish.size > 0 && !matchesWish(course)) return false;
    if (needle === "") return wish.size > 0;
    const hay = `${course.name} ${course.prof} ${course.id}`.toLowerCase();
    return hay.includes(needle);
  });
  list.replaceChildren();

  if (hits.length === 0) {
    empty.hidden = false;
    if (wish.size === 0 && needle === "") {
      empty.textContent = "빈 칸을 누르거나, 과목·교수 이름으로 검색하세요.";
    } else {
      empty.textContent = "조건에 맞는 과목이 없습니다. 칸이나 검색어를 바꿔 보세요.";
    }
    return;
  }

  empty.hidden = true;
  for (const course of hits) {
    const li = document.createElement("li");
    const blocked = conflicts(course);
    const name = document.createElement("div");
    name.className = "course-name";
    name.textContent = course.name;

    const btn = document.createElement("button");
    btn.className = blocked ? "btn btn-ghost" : "btn btn-primary";
    btn.type = "button";
    btn.textContent = blocked ? "겹침" : "담기";
    btn.disabled = blocked;
    btn.addEventListener("click", () => addCourse(course.id));

    const meta = document.createElement("div");
    meta.className = "course-meta";
    const when = `${course.days.join("")} ${Math.min(...course.periods)}–${Math.max(...course.periods)}교시`;
    meta.textContent = `${course.id} · ${course.type} · ${course.credit}학점 · ${course.prof} · ${when}`;

    li.append(name, btn, meta);
    list.append(li);
  }
}

function render() {
  renderGrid();
  renderResults();
}

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("q");

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  query = searchInput.value;
  render();
});

searchInput.addEventListener("input", () => {
  query = searchInput.value;
  render();
});

render();
