/* WEBSITE BÀI TẬP TIẾNG HÀN - GIAO DIỆN CHIBI HÀN QUỐC
   GitHub Pages + Google Apps Script + Google Sheets
   Cần có thêm file chibi.css nằm cùng thư mục với app.js
*/

/* Tự nạp giao diện chibi.css (không cần sửa các file HTML) */
(function () {
  const s = document.currentScript;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = s && s.src ? s.src.replace(/app\.js(\?.*)?$/, "chibi.css") : "chibi.css";
  document.head.appendChild(l);
})();

const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbxYJwT-nxZFrC0BUrOUFPqGCc1xBh19y_9UhT56Ey1M_thKE3A7IrJbj-7TRbffj6Xi/exec"
};

/* ===== HÌNH CHIBI (vẽ bằng SVG) ===== */
const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="cb-girl" viewBox="0 0 64 64"><path d="M20 44H44L55 62H9Z" fill="#6FCFBF"/><rect x="21" y="36" width="22" height="12" rx="4" fill="#FF9EBB"/><path d="M27 36L32 45L37 36Z" fill="#fff"/><path d="M30 44L32 52L34 44Z" fill="#E8456B"/><circle cx="32" cy="23" r="15" fill="#FFE2CC"/><path d="M17 24Q16 7 32 7Q48 7 47 24Q42 13 32 13Q22 13 17 24Z" fill="#2B2030"/><circle cx="32" cy="6" r="5" fill="#2B2030"/><circle cx="32" cy="11" r="2" fill="#E8456B"/><circle cx="26" cy="25" r="2" fill="#2B2030"/><circle cx="38" cy="25" r="2" fill="#2B2030"/><circle cx="22" cy="30" r="3" fill="#FF9EBB"/><circle cx="42" cy="30" r="3" fill="#FF9EBB"/><path d="M29 30Q32 33 35 30" stroke="#2B2030" stroke-width="1.5" fill="none"/></symbol>
<symbol id="cb-boy" viewBox="0 0 64 64"><rect x="19" y="44" width="26" height="17" rx="6" fill="#fff" stroke="#BFC6E0" stroke-width="1.5"/><rect x="21" y="35" width="22" height="13" rx="4" fill="#6EA8FF"/><path d="M27 35L32 44L37 35Z" fill="#fff"/><circle cx="32" cy="23" r="15" fill="#FFE2CC"/><ellipse cx="32" cy="13" rx="20" ry="5" fill="#2B2030"/><rect x="25" y="2" width="14" height="12" rx="6" fill="#2B2030"/><circle cx="26" cy="25" r="2" fill="#2B2030"/><circle cx="38" cy="25" r="2" fill="#2B2030"/><circle cx="22" cy="30" r="3" fill="#FF9EBB"/><circle cx="42" cy="30" r="3" fill="#FF9EBB"/><path d="M29 30Q32 33 35 30" stroke="#2B2030" stroke-width="1.5" fill="none"/></symbol>
<symbol id="cb-tower" viewBox="0 0 64 64"><ellipse cx="32" cy="62" rx="30" ry="11" fill="#8FDDAE"/><path d="M29 58L30.5 28H33.5L35 58Z" fill="#E6E9F2" stroke="#3A2A4D" stroke-width="1.5"/><path d="M32 18V3" stroke="#3A2A4D" stroke-width="2"/><ellipse cx="32" cy="24" rx="10" ry="6" fill="#FF8FA8" stroke="#3A2A4D" stroke-width="1.5"/><circle cx="28" cy="24" r="1.6" fill="#3A2A4D"/><circle cx="36" cy="24" r="1.6" fill="#3A2A4D"/></symbol>
<symbol id="cb-tiger" viewBox="0 0 64 64"><circle cx="14" cy="16" r="8" fill="#FFB259"/><circle cx="50" cy="16" r="8" fill="#FFB259"/><circle cx="32" cy="35" r="23" fill="#FFB259"/><path d="M32 13V22M24 14L26 22M40 14L38 22M10 34H18M10 41L17 38M54 34H46M54 41L47 38" stroke="#3A2A4D" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="44" rx="11" ry="8" fill="#FFF4E0"/><circle cx="23" cy="33" r="2.4" fill="#3A2A4D"/><circle cx="41" cy="33" r="2.4" fill="#3A2A4D"/><path d="M29 41H35L32 44Z" fill="#E8456B"/><path d="M32 44V47M27 48Q32 51 37 48" stroke="#3A2A4D" stroke-width="1.5" fill="none"/></symbol>
</defs></svg>`;

const BANNER = `<svg class="cd-banner" viewBox="0 0 346 150" role="img" aria-label="Tháp Namsan cùng hai bạn nhỏ mặc hanbok">
<rect width="346" height="150" fill="#D9F0FF"/><ellipse cx="60" cy="34" rx="30" ry="11" fill="#fff"/><ellipse cx="290" cy="46" rx="26" ry="9" fill="#fff"/><ellipse cx="173" cy="150" rx="210" ry="38" fill="#9BE3B5"/>
<use href="#cb-tower" x="128" y="6" width="90" height="120"/>
<use href="#cb-girl" x="22" y="62" width="88" height="88"/><use href="#cb-boy" x="236" y="62" width="88" height="88"/>
<rect x="228" y="12" width="82" height="30" rx="15" fill="#fff"/><path d="M250 42L246 52L260 42Z" fill="#fff"/>
<text x="269" y="33" text-anchor="middle" font-family="Noto Sans KR,sans-serif" font-weight="700" font-size="15" fill="#A3124B">안녕!</text>
<circle cx="112" cy="30" r="3" fill="#FF9EBB"/><circle cx="225" cy="70" r="3" fill="#FF9EBB"/><circle cx="20" cy="70" r="3" fill="#FF9EBB"/><circle cx="330" cy="100" r="3" fill="#FF9EBB"/></svg>`;

/* Mỗi cấp độ một nhân vật. Muốn đổi: sửa chữ girl / boy / tower / tiger */
const CAP_ICON = { so1: "girl", so2: "boy", trung3: "tower", trung4: "tiger" };
const chibi = name => `<svg viewBox="0 0 64 64" aria-hidden="true"><use href="#cb-${name}"/></svg>`;
const iconCap = id => chibi(CAP_ICON[id] || "girl");

const $ = s => document.querySelector(s);
const qs = new URLSearchParams(location.search);
const page = document.body.dataset.page;

const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

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
  Object.entries(params).forEach(([k, v]) => { url.searchParams.set(k, v); });
  const r = await getJSON(url.toString());
  if (!r.ok) throw new Error(r.loi || "Lỗi máy chủ");
  return r;
}

async function goi(data) {
  const r = await fetch(CONFIG.API_URL, { method: "POST", body: JSON.stringify(data) });
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
  let local = { capdo: [], dang: DANG_MAC_DINH };

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
        level = { id: cap, ten: cap, icon: "📚", mota: "Bài tập tiếng Hàn", bai: [] };
        result.capdo.push(level);
      }

      if (!Array.isArray(level.bai)) level.bai = [];

      let lesson = level.bai.find(x => x.id === b.id);

      if (!lesson) {
        lesson = { id: b.id, ten: b.ten, dang: [] };
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

  if (!$(".cd-banner")) box.insertAdjacentHTML("beforebegin", BANNER);
  box.textContent = "Đang tải danh sách cấp độ…";

  try {
    const d = await layDanhSach();

    box.innerHTML = `<div class="cd-list">` + d.capdo.map((c, k) => {
      const soBai = (c.bai || []).length;

      return `
        <a class="cd-card cd-${(k % 4) + 1}" href="baihoc.html?cap=${encodeURIComponent(c.id)}">
          <span class="cd-ic">${iconCap(c.id)}</span>
          <span>
            <b class="cd-t">${esc(c.ten)}</b>
            <small class="cd-d">${esc(c.mota || "")}</small>
            <i class="cd-n ${soBai ? "" : "soon"}">${soBai ? soBai + " bài" : "Sắp ra mắt"}</i>
          </span>
        </a>
      `;
    }).join("") + `</div>`;

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
          return `<a class="chip" href="lambai.html?de=${encodeURIComponent(remoteId)}">${esc(g.icon)} ${esc(g.ten)}</a>`;
        }

        if (old) {
          const f = `${c.id}/${b.id}-${g.id}`;
          return `<a class="chip" href="lambai.html?f=${encodeURIComponent(f)}">${esc(g.icon)} ${esc(g.ten)}</a>`;
        }

        return `<span class="chip off">${esc(g.icon)} ${esc(g.ten)}</span>`;
      }).join("");

      return `
        <div class="lesson bl-card">
          <span class="bl-ic">${iconCap(c.id)}</span>
          <div>
            <h3>${esc(b.ten)}</h3>
            <div class="chips">${chips}</div>
          </div>
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
      if (!/^[\w-]+$/.test(deId)) throw new Error("Mã đề không hợp lệ");
      de = await apiGet({ action: "dethi", de: deId });
    } else {
      if (!/^[\w-]+\/[\w-]+$/.test(f)) throw new Error("Đường dẫn bài không hợp lệ");
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
      <input id="ma" autocomplete="off" value="${esc(sessionStorage.getItem("maHV") || "")}">
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
      const r = await goi({ action: "batdau", ma: ma, de: de.id });

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
      <div class="bar"><i style="width:${i / N * 100}%"></i></div>

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
      a.innerHTML = shuffle(q.luachon || []).map(o => `<button class="opt">${esc(o)}</button>`).join("");

      a.querySelectorAll(".opt").forEach(b => {
        b.onclick = () => done(b.textContent);
      });

    } else if (q.loai === "dien") {
      a.innerHTML = `
        <input id="in" class="in" autocomplete="off" lang="ko">
        <div class="center"><button class="btn" id="ok">Xác nhận</button></div>
      `;

      const inp = $("#in");
      inp.focus();

      const go = () => done(inp.value);

      $("#ok").onclick = go;
      inp.onkeydown = e => { if (e.key === "Enter") go(); };

    } else if (q.loai === "sapxep") {
      const words = q.tu || [];
      const sel = [];
      const pool = shuffle(words.map((w, k) => ({ w, k })));

      const draw = () => {
        a.innerHTML = `
          <div class="tray" lang="ko">
            ${sel.map(k => `<button class="tile2 on" data-s="${k}">${esc(words[k])}</button>`).join("") || "<small>Chọn các từ theo đúng thứ tự</small>"}
          </div>

          <div class="tray" lang="ko">
            ${pool.filter(p => !sel.includes(p.k)).map(p => `<button class="tile2" data-p="${p.k}">${esc(p.w)}</button>`).join("")}
          </div>

          <div class="center"><button class="btn" id="ok">Xác nhận</button></div>
        `;

        a.querySelectorAll("[data-p]").forEach(b => {
          b.onclick = () => { sel.push(Number(b.dataset.p)); draw(); };
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
      r = await goi({ action: "nop", luot: luot, tl: tl });
    } catch (e) {
      dangNop = false;

      box.innerHTML = `
        <p class="center">Chưa gửi được bài. Hãy kiểm tra mạng và thử lại.</p>
        <div class="center"><button class="btn" id="gl">Gửi lại 🔁</button></div>
      `;

      $("#gl").onclick = finish;
      return;
    }

    if (!r.ok) {
      box.innerHTML = `
        <p class="center err">${esc(r.loi || "Có lỗi khi chấm bài.")}</p>
        <div class="center"><a class="btn" href="${esc(veDanhSach())}">Về danh sách</a></div>
      `;
      return;
    }

    const hoi = {};
    de.cauhoi.forEach(q => { hoi[q.id] = q.hoi; });

    const bai = Object.fromEntries(tl.map(t => [t.id, t.chon]));
    const chitiet = Array.isArray(r.chitiet) ? r.chitiet : [];

    const tb = chitiet.length
      ? (chitiet.reduce((s, x) => s + Number(x.ms || 0), 0) / chitiet.length / 1000).toFixed(1)
      : "0.0";

    const nv = r.diem === r.tong ? "tiger" : r.diem >= r.tong * 0.7 ? "girl" : "boy";

    box.innerHTML = `
      <div class="center">
        <div class="kq-mascot" style="width:96px;height:96px">${chibi(nv)}</div>

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

          ${!x.dung && x.dapan !== undefined ? " Đáp án: " + esc(x.dapan) : ""}

          · ${(Number(x.ms || 0) / 1000).toFixed(1)} giây
        </div>
      `).join("")}

      <div class="center">
        <button class="btn" id="again">Làm lại 🔄</button>
        <a class="btn" href="${esc(veDanhSach())}">Về danh sách</a>
      </div>
    `;

    $("#again").onclick = () => location.reload();
  }
}

/* KHỞI ĐỘNG */
document.body.insertAdjacentHTML("afterbegin", SPRITE);

if (page === "capdo") {
  capdo();
} else if (page === "baihoc") {
  baihoc();
} else if (page === "lambai") {
  quiz();
}
