/* Cấu hình: CHE_DO_THU=true nghĩa là đang chấm thử ngay trên trình duyệt (chưa nối Google Sheets) */
const CONFIG={CHE_DO_THU:true,API_URL:""};
const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const getJSON=async u=>{const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error(u);return r.json()};
const qs=new URLSearchParams(location.search);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const norm=s=>String(s).trim().replace(/\s+/g," ");
const page=document.body.dataset.page;
if(page==="capdo")capdo();else if(page==="baihoc")baihoc();else if(page==="lambai")quiz();

async function capdo(){
  const box=$("#list");
  try{
    const d=await getJSON("data/levels.json");
    box.innerHTML=d.capdo.map(c=>`<a class="tile" href="baihoc.html?cap=${c.id}"><span class="em">${c.icon}</span><b>${esc(c.ten)}</b><small>${esc(c.mota)}</small><i>${c.bai.length?c.bai.length+" bài":"Sắp ra mắt"}</i></a>`).join("");
  }catch(e){box.textContent="Không tải được danh sách cấp độ."}
}

async function baihoc(){
  const box=$("#list");
  try{
    const d=await getJSON("data/levels.json");
    const c=d.capdo.find(x=>x.id===qs.get("cap"));
    if(!c){box.textContent="Không tìm thấy cấp độ này.";return}
    $("#tieude").textContent=c.ten;
    box.innerHTML=c.bai.length?c.bai.map(b=>`<div class="lesson"><h3>${esc(b.ten)}</h3><div class="chips">${d.dang.map(g=>b.dang.includes(g.id)?`<a class="chip" href="lambai.html?f=${c.id}/${b.id}-${g.id}">${g.icon} ${esc(g.ten)}</a>`:`<span class="chip off">${g.icon} ${esc(g.ten)}</span>`).join("")}</div></div>`).join(""):"<p class='empty'>Cấp độ này sắp có bài. 🌱</p>";
  }catch(e){box.textContent="Không tải được danh sách bài."}
}

async function quiz(){
  const box=$("#quiz"),f=qs.get("f")||"";
  if(!/^[\w-]+\/[\w-]+$/.test(f)){box.textContent="Đường dẫn bài không hợp lệ.";return}
  let de;
  try{de=await getJSON("data/"+f+".json")}catch(e){box.textContent="Không tải được bài này.";return}
  const G=de.giay||20,N=de.cauhoi.length;
  let i=0,tl=[],t0=0,timer=null,left=0,ma="";
  box.innerHTML=`<h2>${esc(de.tieude)}</h2><p>${N} câu · ${G} giây mỗi câu</p>
  <label class="f">Mã học viên<input id="ma" autocomplete="off" value="${esc(sessionStorage.getItem("maHV")||"")}"></label>
  <button class="btn" id="bd">Bắt đầu ✨</button><p class="err" id="er"></p>`;
  $("#bd").onclick=()=>{ma=$("#ma").value.trim();if(!ma){$("#er").textContent="Bạn nhớ nhập mã học viên nhé.";return}sessionStorage.setItem("maHV",ma);show()};

  function done(ans){clearInterval(timer);tl.push({id:de.cauhoi[i].id,chon:ans,ms:Date.now()-t0});i++;i<N?show():finish()}

  function show(){
    const q=de.cauhoi[i];left=G;
    box.innerHTML=`<div class="bar"><i style="width:${i/N*100}%"></i></div>
    <div class="meta"><span>Câu ${i+1}/${N}</span><b id="tm">⏰ ${left}</b></div>
    <div class="word" lang="ko">${esc(q.hoi)}</div>${q.goiy?`<p class="hint">${esc(q.goiy)}</p>`:""}<div id="ans"></div>`;
    const a=$("#ans");
    if(q.loai==="chon"){
      a.innerHTML=shuffle(q.luachon).map(o=>`<button class="opt">${esc(o)}</button>`).join("");
      a.querySelectorAll(".opt").forEach(b=>b.onclick=()=>done(b.textContent));
    }else if(q.loai==="dien"){
      a.innerHTML=`<input id="in" class="in" autocomplete="off" lang="ko"><div class="center"><button class="btn" id="ok">Xác nhận</button></div>`;
      const inp=$("#in");inp.focus();const go=()=>done(inp.value);
      $("#ok").onclick=go;inp.onkeydown=e=>{if(e.key==="Enter")go()};
    }else if(q.loai==="sapxep"){
      const sel=[],word=k=>q.tu[k];
      const pool=shuffle(q.tu.map((w,k)=>({w,k})));
      const draw=()=>{
        a.innerHTML=`<div class="tray" lang="ko">${sel.map(k=>`<button class="tile2 on" data-s="${k}">${esc(word(k))}</button>`).join("")||"<small>Chạm vào các từ bên dưới theo đúng thứ tự</small>"}</div>
        <div class="tray" lang="ko">${pool.filter(p=>!sel.includes(p.k)).map(p=>`<button class="tile2" data-p="${p.k}">${esc(p.w)}</button>`).join("")}</div>
        <div class="center"><button class="btn" id="ok">Xác nhận</button></div>`;
        a.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{sel.push(+b.dataset.p);draw()});
        a.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{sel.splice(sel.indexOf(+b.dataset.s),1);draw()});
        $("#ok").onclick=()=>done(sel.map(word).join(" "));
      };
      draw();
    }
    t0=Date.now();
    timer=setInterval(()=>{left--;const tm=$("#tm");tm.textContent="⏰ "+left;tm.classList.toggle("warn",left<=5);if(left<=0)done("")},1000);
  }

  async function finish(){
    box.innerHTML="<p class='center'>Đang chấm bài… ⏳</p>";
    if(!CONFIG.CHE_DO_THU){box.textContent="Chưa kết nối máy chủ chấm điểm.";return}
    let dap;
    try{dap=(await getJSON("data/demo-dapan.json"))[de.id]}catch(e){box.textContent="Không chấm được bài thử.";return}
    const ct=tl.map((t,k)=>({...t,hoi:de.cauhoi[k].hoi,dung:dap[t.id],ok:norm(t.chon)===norm(dap[t.id])}));
    const diem=ct.filter(x=>x.ok).length;
    const tb=(ct.reduce((s,x)=>s+x.ms,0)/ct.length/1000).toFixed(1);
    box.innerHTML=`<div class="center"><div style="font-size:3rem">${diem===N?"🏆":diem>=N*0.7?"🌸":"🌱"}</div><p class="score">${diem}/${N}</p><p>Thời gian trung bình: ${tb} giây/câu</p></div>
    <p class="note">Chế độ thử nghiệm: kết quả chưa được lưu vào Google Sheets.</p>
    ${ct.map((x,k)=>`<div class="rev ${x.ok?"ok":"no"}">${k+1}. <b lang="ko">${esc(x.hoi)}</b><br>Bạn chọn: ${x.chon?esc(x.chon):"(hết giờ)"} ${x.ok?"✅":"❌ Đáp án: "+esc(x.dung)} · ${(x.ms/1000).toFixed(1)} giây</div>`).join("")}
    <div class="center"><button class="btn" onclick="location.reload()">Làm lại 🔄</button> <a class="btn" href="baihoc.html?cap=${f.split("/")[0]}">Về danh sách</a></div>`;
  }
}
