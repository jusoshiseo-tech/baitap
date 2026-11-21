/* WEBSITE BÀI TẬP TIẾNG HÀN
   GitHub Pages + Google Apps Script + Google Sheets
   Giữ bài tập cũ và bổ sung bài tập mới.
*/

const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbxYJwT-nxZFrC0BUrOUFPqGCc1xBh19y_9UhT56Ey1M_thKE3A7IrJbj-7TRbffj6Xi/exec"
};

const $ = s => document.querySelector(s);
const qs = new URLSearchParams(location.search);
const page = document.body.dataset.page;

const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[c]));

const norm = s => String(s ?? "").trim().replace(/\s+/g, " ");

const shuffle = a => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

async function getJSON(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("Không tải được dữ liệu");
  return r.json();
}

async function apiGet(params) {
  const url = new URL(CONFIG.API_URL);
  Object.entries(params).forEach(([k, v]) => {
    url.searchParams.set(k, v);
  });
  const r = await getJSON(url.toString());
  if (!r.ok) throw new Error(r.loi || "Lỗi máy chủ");
  return r;
}

async function goi(data) {
  const r = await fetch(CONFIG.API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error("Không kết nối được máy chủ");
  return r.json();
}

/* Đồng nhất mã cấp độ giữa Google Sheets và GitHub */
function capWeb(cap) {
  return cap === "sc1" ? "so1" :
         cap === "sc2" ? "so2" :
         cap === "tc3" ? "trung3" :
         cap === "tc4" ? "trung4" : cap;
}

const DANG_MAC_DINH = [
  { id: "tuvung", ten: "Từ vựng", icon: "📝" },
  { id: "nguphap", ten: "Ngữ pháp", icon: "🧩" },
  { id: "dientu", ten: "Điền từ", icon: "✏️" },
  { id: "sapxep", ten: "Sắp xếp câu", icon: "🔀" },
  { id: "tracnghiem", ten: "Trắc nghiệm", icon: "✅" },
  { id: "ontap", ten: "Ôn tập tổng hợp", icon: "🌟" }
];

/* Đọc dữ liệu cũ và mới, không xóa bài cũ */
async function layDanhSach() {
  let local = {
    capdo: [],
    dang: DANG_MAC_DINH
  };

  try {
    local = await getJSON("data/levels.json");
  } catch (e) {
    console.warn("Chưa đọc được levels.json", e);
  }

  const result = {
    capdo: local.capdo || [],
    dang: local.dang || DANG_MAC_DINH,
    online: false
  };

  try {
    const remote = await apiGet({ action: "danhsach" });
    result.online = true;

    for (const b of remote.bai || []) {
      const cap = capWeb(b.cap);
      let level = result.capdo.find(x => x.id === cap);

      if (!level) {
        level = {
          id: cap,
          ten: cap,
          icon: "📚",
          mota: "Bài tập tiếng Hàn",
          bai: []
        };
        result.capdo.push(level);
      }

      if (!Array.isArray(level.bai)) level.bai = [];

      let lesson = level.bai.find(x => x.id === b.id);

      if (!lesson) {
        lesson = {
          id: b.id,
          ten: b.ten,
          dang: []
        };
        level.bai.push(lesson);
      }

      lesson.remote = lesson.remote || {};

      for (const g of b.dang || []) {
        const deId = `${b.cap}-${b.id}-${g}`;
        lesson.remote[g] = deId;
      }
    }
  } catch (e) {
    console.warn("Không tải được danh sách Google Sheets", e);
    result.loiAPI = e.message;
  }

  return result;
}

/* TRANG CẤP ĐỘ */
async function capdo() {
  const box = $("#list");
  if (!box) return;

  box.textContent = "Đang tải danh sách cấp độ…";

  try {
    const d = await layDanhSach();

    box.innerHTML = d.capdo.map(c => {
      const soBai = (c.bai || []).length;

      return `
        <a class="tile" href="baihoc.html?cap=${encodeURIComponent(c.id)}">
          <span class="em">${esc(c.icon || "📚")}</span>
          <b>${esc(c.ten)}</b>
          <small>${esc(c.mota || "")}</small>
          <i>${soBai ? soBai + " bài" : "Sắp ra mắt"}</i>
        </a>
      `;
    }).join("");

    if (!d.capdo.length) {
      box.textContent = "Chưa có cấp độ nào.";
    }
  } catch (e) {
    box.textContent = "Không tải được danh sách cấp độ.";
  }
}

/* TRANG DANH SÁCH BÀI HỌC */
async function baihoc() {
  const box = $("#list");
  if (!box) return;

  box.textContent = "Đang tải bài học…";

  try {
    const d = await layDanhSach();
    const cap = qs.get("cap");
    const c = d.capdo.find(x => x.id === cap);

    if (!c) {
      box.textContent = "Không tìm thấy cấp độ này.";
      return;
    }

    const title = $("#tieude");
    if (title) title.textContent = c.ten;

    if (!c.bai.length) {
      box.innerHTML = "<p class='empty'>Cấp độ này sắp có bài. 🌱</p>";
      return;
    }

    box.innerHTML = c.bai.map(b => {
      const chips = d.dang.map(g => {
        const remoteId = b.remote && b.remote[g.id];
        const old = (b.dang || []).includes(g.id);

        if (remoteId) {
          return `
            <a class="chip" href="lambai.html?de=${encodeURIComponent(remoteId)}">
              ${esc(g.icon)} ${esc(g.ten)}
            </a>
          `;
        }

        if (old) {
          const f = `${c.id}/${b.id}-${g.id}`;
          return `
            <a class="chip" href="lambai.html?f=${encodeURIComponent(f)}">
              ${esc(g.icon)} ${esc(g.ten)}
            </a>
          `;
        }

        return `
          <span class="chip off">
            ${esc(g.icon)} ${esc(g.ten)}
          </span>
        `;
      }).join("");

      return `
        <div class="lesson">
          <h3>${esc(b.ten)}</h3>
          <div class="chips">${chips}</div>
        </div>
      `;
    }).join("");

    if (d.loiAPI) {
      box.insertAdjacentHTML(
        "beforeend",
        "<p class='note'>Đang hiển thị dữ liệu có sẵn. Chưa kết nối được danh sách bài mới.</p>"
      );
    }

  } catch (e) {
    box.textContent = "Không tải được danh sách bài học.";
  }
}

/* TRANG LÀM BÀI */
async function quiz() {
  const box = $("#quiz");
  if (!box) return;

  const deId = qs.get("de");
  const f = qs.get("f") || "";
  let de;

  box.textContent = "Đang tải câu hỏi…";

  try {
    if (deId) {
      if (!/^[\w-]+$/.test(deId)) {
        throw new Error("Mã đề không hợp lệ");
      }

      de = await apiGet({
        action: "dethi",
        de: deId
      });

    } else {
      if (!/^[\w-]+\/[\w-]+$/.test(f)) {
        throw new Error("Đường dẫn bài không hợp lệ");
      }

      de = await getJSON("data/" + f + ".json");
    }
  } catch (e) {
    box.textContent = e.message || "Không tải được bài này.";
    return;
  }

  if (!de || !Array.isArray(de.cauhoi) || !de.cauhoi.length) {
    box.textContent = "Bài này chưa có câu hỏi.";
    return;
  }

  const G = Number(de.giay) || 20;
  const N = de.cauhoi.length;

  let i = 0;
  let tl = [];
  let t0 = 0;
  let timer = null;
  let left = 0;
  let ma = "";
  let luot = "";
  let dangChuyen = false;
  let dangNop = false;

  const veDanhSach = () => {
    const cap = deId ? capWeb(deId.split("-")[0]) : f.split("/")[0];
    return "baihoc.html?cap=" + encodeURIComponent(cap);
  };

  box.innerHTML = `
    <h2>${esc(de.tieude || "Bài tập tiếng Hàn")}</h2>
    <p>${N} câu · ${G} giây mỗi câu</p>

    <label class="f">
      Mã học viên
      <input id="ma" autocomplete="off"
        value="${esc(sessionStorage.getItem("maHV") || "")}">
    </label>

    <button class="btn" id="bd">Bắt đầu ✨</button>
    <p class="err" id="er"></p>
  `;

  $("#bd").onclick = async () => {
    ma = $("#ma").value.trim();

    if (!ma) {
      $("#er").textContent = "Bạn nhớ nhập mã học viên nhé.";
      return;
    }

    sessionStorage.setItem("maHV", ma);

    const bd = $("#bd");
    bd.disabled = true;
    $("#er").textContent = "Đang kiểm tra… ⏳";

    try {
      const r = await goi({
        action: "batdau",
        ma: ma,
        de: de.id
      });

      if (!r.ok) {
        $("#er").textContent = r.loi || "Chưa bắt đầu được.";
        bd.disabled = false;
        return;
      }

      luot = r.luot;
      show();

    } catch (e) {
      $("#er").textContent = "Không kết nối được máy chủ. Hãy thử lại.";
      bd.disabled = false;
    }
  };

  function done(ans) {
    if (dangChuyen) return;
    dangChuyen = true;

    clearInterval(timer);

    tl.push({
      id: de.cauhoi[i].id,
      chon: String(ans ?? ""),
      ms: Math.max(0, Date.now() - t0)
    });

    i++;

    if (i < N) {
      show();
    } else {
      finish();
    }
  }

  function show() {
    dangChuyen = false;

    const q = de.cauhoi[i];
    left = G;

    box.innerHTML = `
      <div class="bar">
        <i style="width:${i / N * 100}%"></i>
      </div>

      <div class="meta">
        <span>Câu ${i + 1}/${N}</span>
        <b id="tm">⏰ ${left}</b>
      </div>

      <div class="word" lang="ko">${esc(q.hoi)}</div>

      ${q.goiy ? `<p class="hint">${esc(q.goiy)}</p>` : ""}

      <div id="ans"></div>
    `;

    const a = $("#ans");

    if (q.loai === "chon") {
      a.innerHTML = shuffle(q.luachon || []).map(o => `
        <button class="opt">${esc(o)}</button>
      `).join("");

      a.querySelectorAll(".opt").forEach(b => {
        b.onclick = () => done(b.textContent);
      });

    } else if (q.loai === "dien") {
      a.innerHTML = `
        <input id="in" class="in" autocomplete="off" lang="ko">
        <div class="center">
          <button class="btn" id="ok">Xác nhận</button>
        </div>
      `;

      const inp = $("#in");
      inp.focus();

      const go = () => done(inp.value);

      $("#ok").onclick = go;
      inp.onkeydown = e => {
        if (e.key === "Enter") go();
      };

    } else if (q.loai === "sapxep") {
      const words = q.tu || [];
      const sel = [];
      const pool = shuffle(words.map((w, k) => ({ w, k })));

      const draw = () => {
        a.innerHTML = `
          <div class="tray" lang="ko">
            ${sel.map(k => `
              <button class="tile2 on" data-s="${k}">
                ${esc(words[k])}
              </button>
            `).join("") || "<small>Chọn các từ theo đúng thứ tự</small>"}
          </div>

          <div class="tray" lang="ko">
            ${pool.filter(p => !sel.includes(p.k)).map(p => `
              <button class="tile2" data-p="${p.k}">
                ${esc(p.w)}
              </button>
            `).join("")}
          </div>

          <div class="center">
            <button class="btn" id="ok">Xác nhận</button>
          </div>
        `;

        a.querySelectorAll("[data-p]").forEach(b => {
          b.onclick = () => {
            sel.push(Number(b.dataset.p));
            draw();
          };
        });

        a.querySelectorAll("[data-s]").forEach(b => {
          b.onclick = () => {
            const k = Number(b.dataset.s);
            sel.splice(sel.indexOf(k), 1);
            draw();
          };
        });

        $("#ok").onclick = () => done(sel.map(k => words[k]).join(" "));
      };

      draw();

    } else {
      a.innerHTML = "<p>Loại câu hỏi chưa được hỗ trợ.</p>";
    }

    t0 = Date.now();

    timer = setInterval(() => {
      left = Math.max(0, G - Math.floor((Date.now() - t0) / 1000));

      const tm = $("#tm");
      if (tm) {
        tm.textContent = "⏰ " + left;
        tm.classList.toggle("warn", left <= 5);
      }

      if (left <= 0) done("");
    }, 250);
  }

  async function finish() {
    if (dangNop) return;
    dangNop = true;

    box.innerHTML = "<p class='center'>Đang chấm bài… ⏳</p>";

    let r;

    try {
      r = await goi({
        action: "nop",
        luot: luot,
        tl: tl
      });
    } catch (e) {
      dangNop = false;

      box.innerHTML = `
        <p class="center">
          Chưa gửi được bài. Hãy kiểm tra mạng và thử lại.
        </p>
        <div class="center">
          <button class="btn" id="gl">Gửi lại 🔁</button>
        </div>
      `;

      $("#gl").onclick = finish;
      return;
    }

    if (!r.ok) {
      box.innerHTML = `
        <p class="center err">${esc(r.loi || "Có lỗi khi chấm bài.")}</p>
        <div class="center">
          <a class="btn" href="${esc(veDanhSach())}">Về danh sách</a>
        </div>
      `;
      return;
    }

    const hoi = {};
    de.cauhoi.forEach(q => {
      hoi[q.id] = q.hoi;
    });

    const bai = Object.fromEntries(tl.map(t => [t.id, t.chon]));

    const chitiet = Array.isArray(r.chitiet) ? r.chitiet : [];

    const tb = chitiet.length
      ? (chitiet.reduce((s, x) => s + Number(x.ms || 0), 0) /
         chitiet.length / 1000).toFixed(1)
      : "0.0";

    box.innerHTML = `
      <div class="center">
        <div style="font-size:3rem">
          ${r.diem === r.tong ? "🏆" :
            r.diem >= r.tong * 0.7 ? "🌸" : "🌱"}
        </div>

        <p class="score">${r.diem}/${r.tong}</p>
        <p>Thời gian trung bình: ${tb} giây/câu</p>
        <p class="note">Kết quả đã được gửi cho giáo viên ✅</p>
      </div>

      ${chitiet.map((x, k) => `
        <div class="rev ${x.dung ? "ok" : "no"}">
          ${k + 1}.
          <b lang="ko">${esc(hoi[x.id] || x.id)}</b>
          <br>

          Bạn chọn:
          ${bai[x.id] ? esc(bai[x.id]) : "(hết giờ hoặc bỏ trống)"}

          ${x.dung ? "✅" : "❌"}

          ${!x.dung && x.dapan !== undefined
            ? " Đáp án: " + esc(x.dapan)
            : ""}

          · ${(Number(x.ms || 0) / 1000).toFixed(1)} giây
        </div>
      `).join("")}

      <div class="center">
        <button class="btn" id="again">Làm lại 🔄</button>
        <a class="btn" href="${esc(veDanhSach())}">
          Về danh sách
        </a>
      </div>
    `;

    $("#again").onclick = () => location.reload();
  }
}

/* KHỞI ĐỘNG */
if (page === "capdo") {
  capdo();
} else if (page === "baihoc") {
  baihoc();
} else if (page === "lambai") {
  quiz();
}
