/* Cấu hình: API_URL là link /exec của Google Apps Script (máy chủ chấm điểm) */
const CONFIG={API_URL:"https://script.google.com/macros/s/AKfycbxYJwT-nxZFrC0BUrOUFPqGCc1xBh19y_9UhT56Ey1M_thKE3A7IrJbj-7TRbffj6Xi/exec"};
const goi=async d=>{const r=await fetch(CONFIG.API_URL,{method:"POST",body:JSON.stringify(d)});return r.json()};
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
  let i=0,tl=[],t0=0,timer=null,left=0,ma="",luot="";
  box.innerHTML=`<h2>${esc(de.tieude)}</h2><p>${N} câu · ${G} giây mỗi câu</p>
  <label class="f">Mã học viên<input id="ma" autocomplete="off" value="${esc(sessionStorage.getItem("maHV")||"")}"></label>
  <button class="btn" id="bd">Bắt đầu ✨</button><p class="err" id="er"></p>`;
  $("#bd").onclick=async()=>{
    ma=$("#ma").value.trim();
    if(!ma){$("#er").textContent="Bạn nhớ nhập mã học viên nhé.";return}
    sessionStorage.setItem("maHV",ma);
    const bd=$("#bd");bd.disabled=true;$("#er").textContent="Đang kiểm tra… ⏳";
    try{
      const r=await goi({action:"batdau",ma:ma,de:de.id});
      if(!r.ok){$("#er").textContent=r.loi||"Chưa bắt đầu được, bạn thử lại nhé.";bd.disabled=false;return}
      luot=r.luot;show();
    }catch(e){$("#er").textContent="Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.";bd.disabled=false}
  };

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
