// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════
const TPW = 37;    // ticks per week (display unit)
const TPY = 1800;  // ticks per year (30 min at 1×)
const N_KEYS = ['infra','health','edu','econ','env'];

// ═══════════════════════════════════════════════════
// DEFINITIONS
// ═══════════════════════════════════════════════════
const POLICIES = [
  { id:'road',    icon:'🛣', label:'ถนนและโครงสร้างพื้นฐาน', desc:'ถนนเสื่อมช้า 15%, ก่อสร้างเร็วขึ้น', satBonus:5, needKey:'infra'   },
  { id:'health',  icon:'💊', label:'สาธารณสุขชุมชน',          desc:'ประสิทธิภาพสาธารณสุขสูงขึ้น',          satBonus:5, needKey:'health'  },
  { id:'edu',     icon:'📚', label:'การศึกษา',                 desc:'ค่าฝึกอบรมถูกลง 10%, โรงเรียนมีผลดี',  satBonus:5, needKey:'edu'    },
  { id:'econ',    icon:'💰', label:'ส่งเสริมเศรษฐกิจ',        desc:'ภาษี +2/สัปดาห์ตลอดวาระ',              satBonus:5, needKey:'econ'   },
  { id:'env',     icon:'🌱', label:'สิ่งแวดล้อม',             desc:'สวนสาธารณะเสื่อมช้า 20%',               satBonus:5, needKey:'env'    },
  { id:'welfare', icon:'🤝', label:'พัฒนาคุณภาพชีวิต',       desc:'bonus เมื่อทุกด้านชุมชน > 50% พร้อมกัน',satBonus:5, needKey:'welfare'},
];

const RATINGS = [
  { id:'excellent', label:'ดีเยี่ยม', morale:20, eff:0.15  },
  { id:'good',      label:'ดี',       morale:10, eff:0.07  },
  { id:'fair',      label:'พอใช้',    morale:0,  eff:0     },
  { id:'poor',      label:'แย่',      morale:-15,eff:-0.10 },
];
const BONUSES = [
  { pct:3,   label:'3%',      morale:20 },
  { pct:2.5, label:'2.5%',    morale:15 },
  { pct:2,   label:'2%',      morale:10 },
  { pct:1.5, label:'1.5%',    morale:7  },
  { pct:1,   label:'1%',      morale:5  },
  { pct:0.5, label:'0.5%',    morale:2  },
  { pct:0,   label:'ไม่จ่าย', morale:-10},
];
const NC_QS = [
  { q:'สภา อบต. ตั้งคำถามถึงการบริหารงบประมาณที่ผ่านมา', choices:[
    { text:'เปิดเผยรายละเอียดงบทุกรายการ พร้อมแผนปรับปรุง', score:1 },
    { text:'ขอเวลา 30 วันเพื่อรวบรวมข้อมูล', score:0 },
    { text:'งบประมาณถูกใช้อย่างเหมาะสมแล้ว ไม่มีปัญหา', score:-1 },
  ]},
  { q:'ประชาชนร้องเรียนเรื่องสาธารณูปโภคชำรุดจำนวนมาก', choices:[
    { text:'จัดทีมลงพื้นที่ซ่อมแซมทันที พร้อมรับฟังปัญหาทุกจุด', score:1 },
    { text:'อยู่ระหว่างการจัดสรรงบประมาณ', score:0 },
    { text:'ปัญหาเหล่านี้อยู่นอกเหนืองบประมาณที่ได้รับ', score:-1 },
  ]},
  { q:'สมาชิกสภาถามถึงแผนพัฒนาชุมชนในระยะยาว', choices:[
    { text:'นำเสนอแผน 4 ปีที่ชัดเจนต่อสภาในสัปดาห์หน้า', score:1 },
    { text:'กำลังศึกษาความเป็นไปได้อยู่', score:0 },
    { text:'ขึ้นอยู่กับงบประมาณที่จะได้รับในปีหน้า', score:-1 },
  ]},
];

const PERS = {
  ขยัน:       { color:'badge-green',  trainBonus:.3,  effectBonus:.12 },
  อิจฉา:      { color:'badge-red',    jealous:true },
  ใจดี:       { color:'badge-green',  teamMorale:2 },
  แข่งขัน:   { color:'badge-yellow', competitive:true },
  สร้างสรรค์:{ color:'badge-purple', projBonus:.15, taxBonus:.5 },
  ขี้เกียจ:  { color:'badge-gray',   trainBonus:-.3, effectBonus:-.10 },
  ร่าเริง:   { color:'badge-green',  teamMorale:3 },
  โกรธง่าย: { color:'badge-red',    conflictRate:.08 },
};
const PLIST = Object.keys(PERS);
// นิสัยที่ไม่ควรอยู่ด้วยกัน
const INCOMPAT = {
  ขยัน:      ['ขี้เกียจ'],
  ขี้เกียจ:  ['ขยัน','แข่งขัน','สร้างสรรค์'],
  แข่งขัน:  ['ขี้เกียจ'],
  สร้างสรรค์:['ขี้เกียจ'],
  อิจฉา:    ['ใจดี','ร่าเริง'],
  ใจดี:     ['อิจฉา'],
  ร่าเริง:  ['อิจฉา'],
};

const SDEF = {
  clerk:    { label:'พนักงาน',    icon:'ti-user',          salary:6,  taxBoost:2, satBoost:1, hireCost:400, color:'var(--accent)' },
  engineer: { label:'นายช่าง',   icon:'ti-tool',          salary:10, taxBoost:1, satBoost:2, hireCost:700, color:'var(--yellow)' },
  doctor:   { label:'สาธารณสุข', icon:'ti-stethoscope',   salary:9,  taxBoost:1, satBoost:3, hireCost:650, color:'var(--green)'  },
  planner:  { label:'นักวางแผน', icon:'ti-chart-dots',    salary:12, taxBoost:3, satBoost:2, hireCost:900, color:'var(--purple)' },
};

const ITMPLS = {
  road:    [{name:'ถนนลาดยาง',        decay:.10,mc:3,sp:4},{name:'ถนนคอนกรีต',      decay:.06,mc:4,sp:4},{name:'ทางเดินเท้า',  decay:.08,mc:2,sp:2}],
  building:[{name:'อาคารอเนกประสงค์', decay:.05,mc:3,sp:3},{name:'สำนักงาน อบต.',   decay:.04,mc:2,sp:2}],
  park:    [{name:'สวนสาธารณะ',       decay:.04,mc:2,sp:2},{name:'สนามกีฬา',         decay:.06,mc:3,sp:3}],
  school:  [{name:'โรงเรียน',         decay:.05,mc:4,sp:5},{name:'ศูนย์เด็กเล็ก',    decay:.04,mc:3,sp:4}],
};
const ILBL = {road:'ถนน',building:'อาคาร',park:'สวน',school:'โรงเรียน'};

const FN=['สมชาย','สมศรี','วิชัย','มาลี','ประเสริฐ','สุภา','อนุชา','ลดาวัลย์','ธนกร','พรทิพย์','จักรพงศ์','นภาพร','กิตติพล','รุ่งทิวา','เอกชัย','วรรณา','ชัยชาญ','สุดารัตน์'];
const LN=['ดีงาม','สุขใจ','มีชัย','วิไลวรรณ','ศรีสุข','ทองดี','พิมสาย','บุญมา','สมบูรณ์','รักดี','ใจซื่อ','เจริญสุข','บุญรักษ์','ศรีวิไล'];

const CONSTRUCT=[
  {id:'c1',label:'สร้างถนนสายใหม่',     desc:'เพิ่มถนนในชุมชน',                      cost:300,ticks:15,itype:'road',    icon:'ti-road',          needEng:true},
  {id:'c2',label:'สร้างอาคารสาธารณะ',   desc:'อาคารอเนกประสงค์ใหม่',                 cost:500,ticks:20,itype:'building', icon:'ti-building',      needEng:true},
  {id:'c3',label:'จัดสร้างสวนสาธารณะ',  desc:'พื้นที่สีเขียวชุมชน',                   cost:200,ticks:12,itype:'park',     icon:'ti-trees',         needEng:false},
  {id:'c4',label:'ขยายโรงเรียน',         desc:'เพิ่มห้องเรียนและสิ่งอำนวยความสะดวก',  cost:600,ticks:25,itype:'school',  icon:'ti-school',        needEng:true},
  {id:'c5',label:'ปรับปรุงถนนเดิม',      desc:'เปลี่ยนถนนลูกรังเป็นลาดยาง',           cost:250,ticks:12,itype:'road',    icon:'ti-road-off',      needEng:true},
  {id:'c6',label:'สร้างสนามกีฬา',        desc:'สนามกีฬาสำหรับชุมชน',                  cost:350,ticks:18,itype:'park',     icon:'ti-ball-football', needEng:false},
];
const COMMUNITY=[
  {id:'m1',label:'สืบสานประเพณี',    desc:'+8 sat, +morale ทีม',              cost:150,ticks:10,rep:true, icon:'ti-home-heart',         eff:'sat8,morale5',   needBoost:{infra:5}},
  {id:'m2',label:'ดูแลผู้สูงอายุ',   desc:'+5 sat, +อุดหนุน',                cost:100,ticks:8, rep:true, icon:'ti-heart-handshake',    eff:'sat5,sub0.5',    needBoost:{health:8}},
  {id:'m3',label:'ส่งเสริมอาชีพ',    desc:'+1 ภาษีถาวร (ครั้งเดียว)',        cost:200,ticks:12,rep:false,icon:'ti-briefcase',          eff:'tax1',           needBoost:{econ:10}},
  {id:'m4',label:'เด็กและเยาวชน',    desc:'+6 sat, skill +5 (ครั้งเดียว)',   cost:180,ticks:10,rep:false,icon:'ti-star',               eff:'sat6,skill5',    needBoost:{edu:10}},
  {id:'m5',label:'รณรงค์สุขภาพ',     desc:'+4 sat, boost สาธารณสุข',         cost:120,ticks:8, rep:true, icon:'ti-heart-rate-monitor', eff:'sat4,docBoost',  needBoost:{health:12}},
  {id:'m6',label:'รักษ์สิ่งแวดล้อม', desc:'+5 sat, สวนเสื่อมช้าลง',          cost:160,ticks:12,rep:true, icon:'ti-leaf',               eff:'sat5,pkDecay',   needBoost:{env:12}},
];

// context-aware events built dynamically in pickContextEvent()

// ═══════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════
const GAME = {
  phase:'setup', abtName:'', policies:new Set(),
  electionSat:50, electWon:true, isReelect:false, termNum:1, resigned:false,
};
let ncState = { qIdx:0, score:0 };
let yrNum = 0;
let pendingEval = {};

function initPop(){
  const child=15+rng(20), elderly=10+rng(18);
  return { total:1500+rng(3000), child, elderly, worker:Math.max(5,100-child-elderly) };
}

function freshS() {
  return {
    budget:500, subsidy:15, satisfaction:50,
    tick:0, projDone:0,
    taxBonus:0, docBoostTicks:0, pkDecayTicks:0, lowSatTicks:0,
    staff:[], infra:[], activeProjects:[], oneTime:new Set(),
    needs:{ infra:50, health:50, edu:50, econ:50, env:50 },
    pop:{ total:2500, child:25, worker:55, elderly:20 },
    yr:{ tax:0, exp:0, sat:[], projDone:0, roadBuilt:0, schoolBuilt:0, parkBuilt:0, healthProj:0, envProj:0, commProj:0 },
    termYears:[],
  };
}
let S = freshS();

let spd=1, paused=false, gint=null;
let hireMode=null, hireCands=[];
const logs=[];
let activeTab='overview';

// ═══════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════
const rng = n => Math.floor(Math.random()*n);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const pick = a => a[rng(a.length)];
const cc = c => c>=70?'var(--green)':c>=40?'var(--yellow)':'var(--red)';
const pw = n => Math.round(n*TPW);   // per-week display
const pOn = id => GAME.policies.has(id);
const calcWelfare = () => N_KEYS.reduce((s,k)=>s+S.needs[k],0)/N_KEYS.length;
const dispYear = () => Math.min(4, Math.floor(S.tick/TPY)+1);
const dispMonth = () => Math.floor((S.tick%TPY)/(TPY/12))+1;
const avgMorale = () => S.staff.length?Math.round(S.staff.reduce((a,b)=>a+b.morale,0)/S.staff.length):0;

function addLog(msg,type=''){
  logs.unshift({msg,type,ts:`ปี${dispYear()} เดือน${dispMonth()}`});
  if(logs.length>60)logs.pop();
  if(activeTab==='overview')renderLog();
}

// ═══════════════════════════════════════════════════
// SETUP / PHASE
// ═══════════════════════════════════════════════════
function showScreen(id){
  ['setup','election','pregame','game'].forEach(s=>
    document.getElementById('sc-'+s).style.display=(s===id?'':'none'));
}

function renderSetup(){
  document.getElementById('pol-grid').innerHTML=POLICIES.map(p=>`
    <div class="pol-card" id="pc-${p.id}" onclick="togglePol('${p.id}')">
      <div class="pol-icon">${p.icon}</div>
      <div class="pol-title">${p.label}</div>
      <div class="pol-desc">${p.desc}</div>
      <div class="pol-bonus">+${p.satBonus}% คะแนนนิยม</div>
    </div>`).join('');
  updateElPreview();
}

function togglePol(id){
  if(GAME.policies.has(id))GAME.policies.delete(id);
  else GAME.policies.add(id);
  document.getElementById('pc-'+id).classList.toggle('on',GAME.policies.has(id));
  updateElPreview();
}

function updateElPreview(){
  const bonus=Math.min(GAME.policies.size*5,25);
  document.getElementById('el-preview').textContent=`คะแนนนิยมคาดการณ์: ${45+bonus}% (±8%)`;
}

function doSetup(){
  const name=document.getElementById('abt-name').value.trim();
  if(!name){alert('กรุณาใส่ชื่อ อบต.');return;}
  GAME.abtName=name;
  const bonus=Math.min(GAME.policies.size*5,25);
  const rand=rng(17)-8;
  GAME.electionSat=clamp(45+bonus+rand,25,78);
  GAME.electWon=true;
  GAME.isReelect=false;
  renderElectionScreen();
  showScreen('election');
}

function renderElectionScreen(){
  const sat=GAME.electionSat, won=GAME.electWon;
  const pctEl=document.getElementById('el-pct');
  pctEl.textContent=sat+'%';
  pctEl.className='big-num '+(sat>=50?'text-green':sat>=35?'text-yellow':'text-red');
  document.getElementById('el-msg').textContent=won?'🎉 ได้รับเลือกเป็นนายก อบต.!':'😔 แพ้การเลือกตั้ง';
  document.getElementById('el-policies').textContent=
    GAME.policies.size?'นโยบาย: '+[...GAME.policies].map(id=>POLICIES.find(p=>p.id===id).label).join(' • '):'ไม่ได้เลือกนโยบาย';
  document.getElementById('el-btn-area').innerHTML=won
    ?`<button class="btn btn-accent btn-lg" onclick="doElection()">รับตำแหน่งนายก ✅</button>`
    :`<button class="btn btn-red btn-lg"    onclick="chooseNewAbt()">🆕 ลองใหม่ใน อบต.ใหม่</button>`;
}

function doElection(){
  if(GAME.isReelect){
    // keep staff & infra; reset tick/stats; grow population slightly
    S.budget=Math.max(100,S.budget-300);
    S.tick=0; S.satisfaction=GAME.electionSat; S.taxBonus=pOn('econ')?2:0;
    S.docBoostTicks=0;S.pkDecayTicks=0;S.lowSatTicks=0;
    S.activeProjects=[];S.oneTime=new Set();
    S.needs={infra:50,health:50,edu:50,econ:50,env:50};
    S.yr={tax:0,exp:0,sat:[],projDone:0,roadBuilt:0,schoolBuilt:0,parkBuilt:0,healthProj:0,envProj:0,commProj:0};
    S.termYears=[];
    // population grows ~5-10% between terms
    S.pop.total=Math.round(S.pop.total*(1.05+Math.random()*.05));
    GAME.resigned=false;
  } else {
    S=freshS();
    S.pop=initPop();
    S.satisfaction=GAME.electionSat;
    S.taxBonus=pOn('econ')?2:0;
    // elderly population → slightly higher subsidy
    if(S.pop.elderly>25) S.subsidy+=Math.floor((S.pop.elderly-25)*0.3);
    addStaff('clerk'); addStaff('engineer');
    S.infra.push(mkInfra('road')); S.infra.push(mkInfra('building'));
  }
  renderPregame(); showScreen('pregame');
}

function renderPregame(){
  const polList=[...GAME.policies].map(id=>POLICIES.find(p=>p.id===id));
  document.getElementById('pg-content').innerHTML=`
    <div class="pg-sec">
      <div class="fw7 mb6">🏛 ${GAME.abtName} — วาระที่ ${GAME.termNum}</div>
      <div class="pg-row"><span>คะแนนเสียงที่ได้รับ</span><span class="text-green fw7">${GAME.electionSat}%</span></div>
      <div class="pg-row"><span>ความพึงพอใจเริ่มต้น</span><span>${GAME.electionSat}%</span></div>
      <div class="pg-row"><span>งบประมาณเริ่มต้น</span><span>฿${S.budget}</span></div>
      <div class="pg-row"><span>นโยบาย</span><span>${polList.length?polList.map(p=>p.icon+p.label).join(' | '):'ไม่มี'}</span></div>
    </div>
    <div class="pg-sec">
      <div class="fw7 mb6">👨‍👩‍👧‍👦 ข้อมูลประชากร</div>
      <div class="pg-row"><span>จำนวนประชากรทั้งหมด</span><span class="fw7">${S.pop.total.toLocaleString()} คน</span></div>
      <div class="pg-row"><span>🧒 เด็กและเยาวชน</span><span style="color:var(--accent)">${S.pop.child}% (${Math.round(S.pop.total*S.pop.child/100).toLocaleString()} คน)</span></div>
      <div class="pg-row"><span>🧑 วัยทำงาน</span><span style="color:var(--green)">${S.pop.worker}% (${Math.round(S.pop.total*S.pop.worker/100).toLocaleString()} คน)</span></div>
      <div class="pg-row"><span>👴 ผู้สูงอายุ</span><span style="color:var(--yellow)">${S.pop.elderly}% (${Math.round(S.pop.total*S.pop.elderly/100).toLocaleString()} คน)</span></div>
      ${S.pop.child>30?'<div class="pg-row text-accent"><span colspan="2">⭐ ชุมชนนี้มีเด็กมาก — การศึกษามีผลต่อ sat มากขึ้น</span><span></span></div>':''}
      ${S.pop.elderly>25?'<div class="pg-row text-yellow"><span colspan="2">⭐ ผู้สูงอายุสัดส่วนสูง — สาธารณสุขมีผลต่อ sat มากขึ้น</span><span></span></div>':''}
      ${S.pop.worker>55?'<div class="pg-row text-green"><span colspan="2">⭐ วัยทำงานเยอะ — เศรษฐกิจตอบสนองดี</span><span></span></div>':''}
    </div>
    <div class="pg-sec">
      <div class="fw7 mb6">👥 บุคลากร (${S.staff.length} คน)</div>
      ${S.staff.map(s=>`<div class="pg-row"><span>${s.name}</span><span class="text-gray">${SDEF[s.type].label} · ทักษะ ${s.sk.main}</span></div>`).join('')}
    </div>
    <div class="pg-sec">
      <div class="fw7 mb6">🏗 สิ่งปลูกสร้าง (${S.infra.length} แห่ง)</div>
      ${S.infra.map(i=>`<div class="pg-row"><span>${i.name}</span><span style="color:${cc(Math.round(i.cond))}">${Math.round(i.cond)}%</span></div>`).join('')}
    </div>`;
}

function startGame(){
  document.getElementById('hd-name').textContent=GAME.abtName;
  GAME.phase='playing';
  logs.length=0;
  addLog(`🏛 เริ่มต้นบริหาร ${GAME.abtName} วาระที่ ${GAME.termNum}`,'good');
  showScreen('game');
  renderAll(); restartInt();
}

// ═══════════════════════════════════════════════════
// STAFF
// ═══════════════════════════════════════════════════
let _id=0;
const nid=()=>++_id;

function mkStaff(type){
  const d=SDEF[type];
  const p1=pick(PLIST);
  const excluded=(INCOMPAT[p1]||[]).concat([p1]);
  const p2list=PLIST.filter(p=>!excluded.includes(p));
  const p2=pick(p2list.length?p2list:PLIST.filter(p=>p!==p1));
  const tb=(PERS[p1].trainBonus||0)+(PERS[p2].trainBonus||0);
  const eb=(PERS[p1].effectBonus||0)+(PERS[p2].effectBonus||0);
  const eduDisc=pOn('edu')?0.9:1;
  return{
    id:'s'+nid(),type,name:pick(FN)+' '+pick(LN),
    p:[p1,p2],
    sk:{main:clamp(30+rng(40)+Math.round(eb*20),10,99),soc:20+rng(50)},
    morale:60+rng(30),eff:1.0,
    tr:clamp(1+tb,.5,2),tc:Math.round(d.hireCost*.6*eduDisc),
    sal:d.salary,tax:d.taxBoost,sat:d.satBoost,hc:d.hireCost,
    rels:{},lv:1,trn:0,
  };
}

function addStaff(type,obj){
  const s=obj||mkStaff(type);
  S.staff.forEach(e=>{s.rels[e.id]=rng(60)-20;e.rels[s.id]=rng(60)-20;});
  S.staff.push(s);
}

function trainStaff(id){
  const s=S.staff.find(x=>x.id===id);if(!s)return;
  if(S.budget<s.tc){addLog(`⚠ งบไม่พอฝึกอบรม ${s.name}`,'warn');return;}
  S.budget-=s.tc;
  const g=Math.round((5+rng(10))*s.tr);
  s.sk.main=Math.min(99,s.sk.main+g);s.trn++;s.morale=Math.min(100,s.morale+5);
  if(s.trn>=3*s.lv){
    s.lv++;s.sal=Math.ceil(s.sal*1.1);s.tax=Math.ceil(s.tax*1.2);
    addLog(`⬆ ${s.name} เลื่อนเป็น Lv.${s.lv}!`,'good');
  }
  S.staff.forEach(o=>{
    if(o.id===id)return;
    if(o.p.includes('อิจฉา')){o.morale=Math.max(0,o.morale-10);addLog(`😠 ${o.name} อิจฉาที่ ${s.name} ได้รับการฝึก`,'warn');}
    if(o.p.includes('แข่งขัน')&&o.sk.main<s.sk.main)o.morale=Math.max(0,o.morale-5);
    if(o.p.includes('ใจดี'))o.morale=Math.min(100,o.morale+3);
  });
  addLog(`📚 ${s.name} ฝึกอบรม +${g} ทักษะ`,'good');
  renderStaffTab();
}

function fireStaff(id){
  const i=S.staff.findIndex(s=>s.id===id);if(i<0)return;
  const n=S.staff[i].name;S.staff.splice(i,1);
  S.staff.forEach(o=>delete o.rels[id]);
  addLog(`👋 ปลด ${n} ออก`,'warn');renderStaffTab();
}

function startHire(type){hireMode=type;hireCands=[mkStaff(type),mkStaff(type),mkStaff(type)];renderHire();}
function confirmHire(i){
  const c=hireCands[i];
  if(S.budget<c.hc){addLog('⚠ งบไม่พอจ้าง','warn');cancelHire();return;}
  S.budget-=c.hc;addStaff(null,c);addLog(`✅ จ้าง ${c.name} (${SDEF[c.type].label})`,'good');
  cancelHire();renderStaffTab();
}
function cancelHire(){hireMode=null;hireCands=[];document.getElementById('hireCandidates').innerHTML='';}

// ═══════════════════════════════════════════════════
// INFRA
// ═══════════════════════════════════════════════════
function mkInfra(type){
  const t=pick(ITMPLS[type]);
  return{id:'i'+nid(),type,name:t.name,cond:80+rng(15),decay:t.decay,mc:t.mc,sp:t.sp,yr:dispYear()};
}

function repairNow(iid){
  const it=S.infra.find(x=>x.id===iid);if(!it)return;
  const cost=Math.round((100-it.cond)*it.mc*.5);
  if(S.budget<cost){addLog(`⚠ งบไม่พอซ่อม ${it.name}`,'warn');return;}
  S.budget-=cost;it.cond=Math.min(100,it.cond+30+rng(20));
  addLog(`🔧 ซ่อม ${it.name} เสร็จ (${Math.round(it.cond)}%)`,'good');renderInfraTab();
}

// ═══════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════
function startRepair(iid){
  const it=S.infra.find(x=>x.id===iid);if(!it)return;
  if(S.activeProjects.some(p=>p.iid===iid)){addLog('⚠ กำลังซ่อมอยู่','warn');return;}
  const cost=Math.round((100-it.cond)*it.mc*.4+50);
  if(S.budget<cost){addLog('⚠ งบไม่พอ','warn');return;}
  S.budget-=cost;
  S.activeProjects.push({id:'r_'+iid,label:'ซ่อม '+it.name,ticks:8,el:0,cat:'repair',iid});
  addLog(`🚀 เริ่มซ่อม ${it.name}`,'good');renderProjectsTab();
}

function startConstruct(id){
  const d=CONSTRUCT.find(x=>x.id===id);if(!d)return;
  if(S.activeProjects.some(p=>p.id===id)){addLog('⚠ กำลังดำเนินอยู่','warn');return;}
  if(d.needEng&&!S.staff.some(s=>s.type==='engineer')){addLog('⚠ ต้องมีนายช่าง','warn');return;}
  if(S.budget<d.cost){addLog('⚠ งบไม่พอ','warn');return;}
  S.budget-=d.cost;
  S.activeProjects.push({id,label:d.label,ticks:d.ticks,el:0,cat:'build',itype:d.itype});
  addLog(`🚀 เริ่มโครงการ: ${d.label}`,'good');renderProjectsTab();
}

function startCommunity(id){
  const d=COMMUNITY.find(x=>x.id===id);if(!d)return;
  if(S.oneTime.has(id)){addLog('⚠ โครงการนี้ทำแล้ว','warn');return;}
  if(S.activeProjects.some(p=>p.id===id)){addLog('⚠ กำลังดำเนินอยู่','warn');return;}
  if(S.budget<d.cost){addLog('⚠ งบไม่พอ','warn');return;}
  S.budget-=d.cost;
  S.activeProjects.push({id,label:d.label,ticks:d.ticks,el:0,cat:'comm',eff:d.eff,rep:d.rep,needBoost:d.needBoost});
  addLog(`🚀 เริ่มโครงการ: ${d.label}`,'good');renderProjectsTab();
}

function applyEff(eff,id,rep){
  eff.split(',').forEach(p=>{
    const m=p.match(/^([a-zA-Zก-๙]+)([\d.]+)?$/);if(!m)return;
    const[,k,vs]=m,v=parseFloat(vs||'0');
    if(k==='sat')S.satisfaction=clamp(S.satisfaction+v,0,100);
    else if(k==='morale')S.staff.forEach(s=>s.morale=Math.min(100,s.morale+v));
    else if(k==='sub')S.subsidy+=v;
    else if(k==='tax')S.taxBonus+=v;
    else if(k==='skill')S.staff.forEach(s=>s.sk.main=Math.min(99,s.sk.main+v));
    else if(k==='docBoost')S.docBoostTicks+=60;
    else if(k==='pkDecay')S.pkDecayTicks+=80;
  });
  if(!rep)S.oneTime.add(id);
}

function completeProj(p){
  S.projDone++;S.yr.projDone++;
  if(p.cat==='repair'){
    const it=S.infra.find(x=>x.id===p.iid);
    if(it){it.cond=Math.min(100,it.cond+50+rng(20));addLog(`✅ ซ่อม ${it.name} สำเร็จ (${Math.round(it.cond)}%)`,'good');}
  }else if(p.cat==='build'){
    const ni=mkInfra(p.itype);ni.cond=90+rng(10);S.infra.push(ni);
    if(p.itype==='road')S.yr.roadBuilt++;
    else if(p.itype==='school')S.yr.schoolBuilt++;
    else if(p.itype==='park')S.yr.parkBuilt++;
    addLog(`🏗 ก่อสร้าง ${ni.name} สำเร็จ!`,'good');
  }else if(p.cat==='comm'){
    const d=COMMUNITY.find(x=>x.id===p.id);
    if(d){
      applyEff(p.eff,p.id,p.rep);
      if(p.needBoost)Object.entries(p.needBoost).forEach(([k,v])=>{if(k in S.needs)S.needs[k]=clamp(S.needs[k]+v,0,100);});
      if(p.id==='m5')S.yr.healthProj++;
      else if(p.id==='m6')S.yr.envProj++;
      S.yr.commProj++;
      addLog(`🎉 ${p.label} สำเร็จ!`,'good');
    }
  }
  renderAll();
}

// ═══════════════════════════════════════════════════
// COMMUNITY NEEDS UPDATE
// ═══════════════════════════════════════════════════
function updateNeeds(){
  const N=S.needs;
  const DECAY=0.03;
  // age group modifiers
  const manyKids=S.pop.child>30, manyElderly=S.pop.elderly>25, manyWorkers=S.pop.worker>55;
  N_KEYS.forEach(k=>N[k]=Math.max(0,N[k]-DECAY));

  // infra: good roads + buildings
  const goodRoads=S.infra.filter(i=>i.type==='road'&&i.cond>50).length;
  const goodBlds=S.infra.filter(i=>i.type==='building'&&i.cond>50).length;
  N.infra=clamp(N.infra+goodRoads*.07+goodBlds*.05+(pOn('road')?.02:0),0,100);

  // health: doctors + boosts + elderly bonus (หากมีผู้สูงอายุมาก สาธารณสุขสำคัญกว่า → ฟื้นได้มากขึ้น)
  const docs=S.staff.filter(s=>s.type==='doctor').length;
  const elderlyHlBonus=manyElderly?.03:0;
  N.health=clamp(N.health+docs*.08+elderlyHlBonus+(S.docBoostTicks>0?.04:0)+(pOn('health')?.02:0),0,100);

  // edu: good schools + children bonus (มีเด็กมาก → โรงเรียนส่งผลมากขึ้น)
  const goodSchools=S.infra.filter(i=>i.type==='school'&&i.cond>50).length;
  const childEduBonus=manyKids?goodSchools*.03:0;
  N.edu=clamp(N.edu+goodSchools*.08+childEduBonus+(pOn('edu')?.02:0),0,100);

  // econ: net income × worker multiplier
  const tax=calcTax();
  const net=tax+S.subsidy-S.staff.reduce((a,b)=>a+b.sal,0)-S.infra.reduce((a,b)=>a+b.mc,0);
  const workerMult=manyWorkers?1.25:1;
  const econBoost=clamp(net*.01*workerMult,-0.12,0.12);
  N.econ=clamp(N.econ+econBoost+(pOn('econ')?.02:0),0,100);

  // env: good parks
  const goodParks=S.infra.filter(i=>i.type==='park'&&i.cond>50).length;
  N.env=clamp(N.env+goodParks*.08+(S.pkDecayTicks>0?.03:0)+(pOn('env')?.02:0),0,100);
}

function needsSatDelta(){
  let d=0;
  const welfare=calcWelfare();
  const all={...S.needs,welfare};
  Object.entries(all).forEach(([k,sc])=>{
    const pol=POLICIES.find(p=>p.needKey===k);
    const mult=(pol&&pOn(pol.id))?2:1;
    // age group amplifiers: ถ้าประชากรกลุ่มนั้นมาก ความต้องการด้านนั้นมีผลต่อ sat มากขึ้น
    let ageMult=1;
    if(k==='edu'&&S.pop.child>30)ageMult=1.4;
    else if(k==='health'&&S.pop.elderly>25)ageMult=1.4;
    else if(k==='econ'&&S.pop.worker>55)ageMult=1.2;
    if(sc<30)d-=0.04*mult*ageMult;
    else if(sc>70)d+=(k==='welfare'?.04:.02)*mult;
  });
  // welfare policy all-needs bonus
  if(pOn('welfare')&&N_KEYS.every(k=>S.needs[k]>50))d+=0.1;
  return d;
}

// ═══════════════════════════════════════════════════
// GAME TICK
// ═══════════════════════════════════════════════════
function calcTax(){
  const sb=(S.satisfaction-50)*.1;
  const st=S.staff.reduce((s,x)=>s+x.tax*(x.eff||1),0);
  const pc=S.staff.filter(s=>s.type==='planner'&&s.p.includes('สร้างสรรค์')).length*.5;
  return Math.max(5,Math.round(10+sb+st+S.taxBonus+pc));
}

function gameTick(){
  S.tick++;
  if(GAME.phase!=='playing')return;

  // Income & expenses
  const tax=calcTax(),inc=tax+S.subsidy;
  const sal=S.staff.reduce((s,x)=>s+x.sal,0);
  let maint=0;
  S.infra.forEach(it=>{
    maint+=it.mc;
    const roadSlow=it.type==='road'&&pOn('road')?0.85:1;
    const parkSlow=it.type==='park'&&(pOn('env')||S.pkDecayTicks>0)?0.8:1;
    it.cond=Math.max(0,it.cond-it.decay*roadSlow*parkSlow);
  });
  if(S.pkDecayTicks>0)S.pkDecayTicks--;
  const net=inc-sal-maint;
  S.budget+=net;

  // Year stats accumulation
  S.yr.tax+=inc; S.yr.exp+=sal+maint;
  if(S.tick%10===0)S.yr.sat.push(Math.round(S.satisfaction));

  // Satisfaction — ต้องบริหารเชิงรุก ไม่เพิ่มเองโดยไม่มีเหตุผล
  let ds=-0.03; // baseline decay
  S.infra.forEach(i=>{if(i.cond<30)ds-=.12;}); // infra ทรุดโทรม = ลด sat
  ds+=(net>0?.01:-.06); // งบขาดดุล = ลด sat มาก
  if(S.docBoostTicks>0){ds+=.06;S.docBoostTicks--;}
  ds+=needsSatDelta(); // needs ต่ำ/สูง ขับเคลื่อน sat
  S.satisfaction=clamp(S.satisfaction+ds,0,100);

  // Community needs
  updateNeeds();

  // Morale & personality every 15 ticks
  if(S.tick%15===0){
    S.staff.forEach(s=>{
      s.p.forEach(p=>{if(PERS[p].teamMorale)S.staff.forEach(o=>o.morale=Math.min(100,o.morale+PERS[p].teamMorale));});
      s.morale=clamp(s.morale+(Math.random()>.5?1:-1),20,100);
    });
    if(pOn('welfare'))S.staff.forEach(s=>s.morale=Math.min(100,s.morale+2));
  }

  // Conflict from โกรธง่าย
  if(S.tick%10===0){
    S.staff.filter(s=>s.p.includes('โกรธง่าย')).forEach(s=>{
      if(Math.random()<PERS['โกรธง่าย'].conflictRate){
        S.satisfaction=clamp(S.satisfaction-2,0,100);
        addLog(`😤 ${s.name} ก่อเรื่องวุ่นวาย!`,'warn');
      }
    });
  }

  // Projects
  const planBonus=S.staff.some(s=>s.type==='planner')?1.15:1;
  const done=[];
  S.activeProjects.forEach(p=>{p.el++;if(p.el>=Math.ceil(p.ticks/planBonus))done.push(p);});
  done.forEach(p=>{S.activeProjects=S.activeProjects.filter(x=>x!==p);completeProj(p);});

  // Random events (frequency scales with low sat)
  const evtEvery=S.satisfaction<30?18:S.satisfaction<60?32:55;
  if(S.tick%evtEvery===0&&Math.random()<.75)randEvent();

  // Low satisfaction streak → no-confidence
  if(S.satisfaction<10){
    S.lowSatTicks++;
    if(S.lowSatTicks>=30)triggerNC();
  }else S.lowSatTicks=0;

  // Year end
  if(S.tick>0&&S.tick%TPY===0)triggerYearReview();

  updateHUD();updateDots();
  if(S.tick%5===0)renderActivePanel();
  if(S.tick%30===0)saveGame();
}

function randEvent(){
  const badChance=clamp(.15+(50-S.satisfaction)/80,0,.85);
  const isBad=Math.random()<badChance;
  const e=pickContextEvent(isBad);
  e.fn();
  addLog(e.msg,isBad?'warn':'good');
}

function pickContextEvent(isBad){
  const staffCnt=S.staff.length;
  const avgCond=S.infra.length?S.infra.reduce((s,i)=>s+i.cond,0)/S.infra.length:0;
  const hasPark=S.infra.some(i=>i.type==='park'&&i.cond>40);
  const hasGoodBld=S.infra.some(i=>i.type==='building'&&i.cond>50);
  const tradDone=S.oneTime.has('m1')||S.activeProjects.some(p=>p.id==='m1')||S.yr.commProj>0;
  const projRecently=S.yr.projDone>0;
  const hasInfraDamage=S.infra.some(i=>i.cond<30);

  const bad=[], good=[];

  // ── BAD always available ──
  bad.push({w:3,msg:'🌧 ฝนตกหนัก! ถนนในชุมชนเสียหาย',fn:()=>S.infra.filter(i=>i.type==='road').forEach(i=>i.cond=Math.max(0,i.cond-15))});
  bad.push({w:3,msg:'🔧 อุปกรณ์สำนักงานชำรุด -฿120',fn:()=>S.budget-=120});
  bad.push({w:2,msg:'💸 รายจ่ายฉุกเฉิน -฿180',fn:()=>S.budget-=180});

  // ── BAD context: บุคลากรน้อย ──
  if(staffCnt<2){
    bad.push({w:4,msg:'😰 บุคลากรไม่พอ! งานค้างสะสม ชาวบ้านเดือดร้อน -7 sat',fn:()=>S.satisfaction=clamp(S.satisfaction-7,0,100)});
    bad.push({w:4,msg:'📋 งานธุรการล้นมือ ไม่มีคนจัดการ -฿100',fn:()=>S.budget-=100});
  }

  // ── BAD context: ไม่ได้จัดงานประเพณี ──
  if(!tradDone){
    bad.push({w:4,msg:'🎏 ปีนี้ไม่มีงานประเพณีเลย ชาวบ้านผิดหวัง -6 sat',fn:()=>S.satisfaction=clamp(S.satisfaction-6,0,100)});
    bad.push({w:3,msg:'📭 ชาวบ้านตั้งคำถามว่า อบต. ทำอะไรอยู่? -4 sat',fn:()=>S.satisfaction=clamp(S.satisfaction-4,0,100)});
  }

  // ── BAD context: สถานที่ทรุดโทรม ──
  if(avgCond<40&&S.infra.length>0){
    bad.push({w:5,msg:'🏚 สถานที่ทรุดโทรม! จัดกิจกรรมชุมชนไม่เป็นที่น่าพอใจ -8 sat',fn:()=>S.satisfaction=clamp(S.satisfaction-8,0,100)});
    bad.push({w:3,msg:'⚠ โครงสร้างพื้นฐานพัง ประชาชนไม่พอใจ -6 sat',fn:()=>S.satisfaction=clamp(S.satisfaction-6,0,100)});
  }

  // ── BAD context: ไม่ทำโครงการเลย ──
  if(!projRecently){
    bad.push({w:4,msg:'😤 ชาวบ้านถามหาผลงาน: ปีนี้ไม่มีโครงการอะไรเลย? -5 sat',fn:()=>S.satisfaction=clamp(S.satisfaction-5,0,100)});
  }

  // ── BAD context: sat ต่ำ → พลาดรางวัล, ถูกวิจารณ์ ──
  if(S.satisfaction<40){
    bad.push({w:5,msg:'🏆 อบต. พลาดรางวัลดีเด่น เพราะชาวบ้านไม่พอใจ -5 sat',fn:()=>S.satisfaction=clamp(S.satisfaction-5,0,100)});
    bad.push({w:4,msg:'📰 สื่อวิจารณ์การบริหาร อบต. อย่างหนัก -8 sat',fn:()=>S.satisfaction=clamp(S.satisfaction-8,0,100)});
  }

  // ── BAD context: infra เสียหายหนัก ──
  if(hasInfraDamage){
    bad.push({w:4,msg:'⚠ สิ่งปลูกสร้างชำรุดหนัก! ชาวบ้านร้องเรียนแห่ -6 sat',fn:()=>S.satisfaction=clamp(S.satisfaction-6,0,100)});
  }

  bad.push({w:2,msg:'🚧 ไฟฟ้าขัดข้อง! อาคารเสียหาย',fn:()=>S.infra.filter(i=>i.type==='building').forEach(i=>i.cond=Math.max(0,i.cond-10))});
  bad.push({w:2,msg:'🌪 พายุพัดถล่ม! สิ่งปลูกสร้างเสียหาย',fn:()=>S.infra.forEach(i=>i.cond=Math.max(0,i.cond-(rng(8)+3)))});

  // ── GOOD always ──
  good.push({w:3,msg:'💸 เงินอุดหนุนพิเศษจากจังหวัด +฿250',fn:()=>S.budget+=250});
  good.push({w:2,msg:'📦 ได้รับเงินบริจาคจากชุมชน +฿200',fn:()=>S.budget+=200});
  good.push({w:2,msg:'🤝 นักลงทุนสนใจพัฒนาชุมชน! +฿150',fn:()=>S.budget+=150});

  // ── GOOD context: จัดงานประเพณีแล้ว ──
  if(tradDone){
    good.push({w:5,msg:'🎪 งานประเพณีสำเร็จสวยงาม! ประชาชนยินดี +10 sat',fn:()=>S.satisfaction=clamp(S.satisfaction+10,0,100)});
    good.push({w:3,msg:'🎉 งานเลี้ยงชุมชนครื้นเครง! +5 sat, morale ทีม +8',fn:()=>{S.satisfaction=clamp(S.satisfaction+5,0,100);S.staff.forEach(s=>s.morale=Math.min(100,s.morale+8));}});
  }else{
    good.push({w:1,msg:'🎏 ชาวบ้านจัดกันเองเล็กๆ +2 sat',fn:()=>S.satisfaction=clamp(S.satisfaction+2,0,100)});
  }

  // ── GOOD context: มีสวนสาธารณะที่ดี ──
  if(hasPark){
    good.push({w:3,msg:'🌱 สวนสาธารณะคึกคัก ชาวบ้านออกกำลังกาย +5 sat',fn:()=>S.satisfaction=clamp(S.satisfaction+5,0,100)});
  }

  // ── GOOD context: ทำโครงการ + sat >=40 → ได้รางวัล ──
  if(projRecently&&S.satisfaction>=40){
    good.push({w:4,msg:'🏆 อบต. ได้รับรางวัลผลงานดีเด่น! +8 sat',fn:()=>S.satisfaction=clamp(S.satisfaction+8,0,100)});
  }

  // ── GOOD context: บุคลากรเยอะ ──
  if(staffCnt>=4){
    good.push({w:3,msg:'👥 ทีมงานประสานกันดี! ขวัญกำลังใจเพิ่ม morale +8 ทุกคน',fn:()=>S.staff.forEach(s=>s.morale=Math.min(100,s.morale+8))});
  }

  // ── GOOD context: อาคารสาธารณะดี ──
  if(hasGoodBld){
    good.push({w:2,msg:'🏛 อาคารสาธารณะถูกใช้งานคึกคัก! +4 sat',fn:()=>S.satisfaction=clamp(S.satisfaction+4,0,100)});
  }

  // weighted random pick
  const pool=isBad?bad:good;
  if(!pool.length)return{msg:'…',fn:()=>{}};
  const totalW=pool.reduce((s,e)=>s+e.w,0);
  let r=Math.random()*totalW;
  for(const e of pool){r-=e.w;if(r<=0)return e;}
  return pool[pool.length-1];
}

// ═══════════════════════════════════════════════════
// YEAR REVIEW
// ═══════════════════════════════════════════════════
function triggerYearReview(){
  clearInterval(gint);
  GAME.phase='year_review';
  yrNum=S.tick/TPY;

  const avgSat=S.yr.sat.length?Math.round(S.yr.sat.reduce((a,b)=>a+b,0)/S.yr.sat.length):Math.round(S.satisfaction);
  S.termYears.push({
    year:yrNum,taxIncome:Math.round(S.yr.tax),expenses:Math.round(S.yr.exp),
    projDone:S.yr.projDone,roadBuilt:S.yr.roadBuilt,schoolBuilt:S.yr.schoolBuilt,
    parkBuilt:S.yr.parkBuilt,healthProj:S.yr.healthProj,envProj:S.yr.envProj,
    commProj:S.yr.commProj,avgSat,
    avgMorale:avgMorale(),needsSnap:{...S.needs,welfare:Math.round(calcWelfare())},
  });
  S.yr={tax:0,exp:0,sat:[],projDone:0,roadBuilt:0,schoolBuilt:0,parkBuilt:0,healthProj:0,envProj:0,commProj:0};

  pendingEval={};
  S.staff.forEach(s=>pendingEval[s.id]={rating:'fair',bonus:0});

  renderYearReview();
  document.getElementById('modal-review').style.display='flex';
}

function renderYearReview(){
  const yr=S.termYears[S.termYears.length-1];
  document.getElementById('rv-year-title').textContent=`ที่ ${yr.year}`;
  document.getElementById('rv-stats').innerHTML=`
    <div class="rv-stat"><div class="rv-stat-val">฿${yr.taxIncome.toLocaleString()}</div><div class="rv-stat-lbl">รายรับรวม</div></div>
    <div class="rv-stat"><div class="rv-stat-val">฿${yr.expenses.toLocaleString()}</div><div class="rv-stat-lbl">รายจ่ายรวม</div></div>
    <div class="rv-stat"><div class="rv-stat-val">${yr.projDone}</div><div class="rv-stat-lbl">โครงการสำเร็จ</div></div>
    <div class="rv-stat"><div class="rv-stat-val" style="color:${cc(yr.avgSat)}">${yr.avgSat}%</div><div class="rv-stat-lbl">ความพึงพอใจเฉลี่ย</div></div>`;

  // needs snapshot
  const ns=yr.needsSnap;
  const needDefs=[
    {k:'infra',label:'🛣 โครงสร้างฯ'},{k:'health',label:'💊 สาธารณสุข'},
    {k:'edu',label:'📚 การศึกษา'},{k:'econ',label:'💰 เศรษฐกิจ'},
    {k:'env',label:'🌱 สิ่งแวดล้อม'},{k:'welfare',label:'🤝 คุณภาพชีวิต'},
  ];
  document.getElementById('rv-needs').innerHTML=needDefs.map(nd=>{
    const v=ns[nd.k]||0,c=cc(v);
    return`<div class="need-item"><div class="need-lbl">${nd.label}</div>
      <div class="need-bar"><div class="need-fill" style="width:${v}%;background:${c}"></div></div>
      <div class="need-val" style="color:${c}">${Math.round(v)}%</div></div>`;
  }).join('');

  // policy achievement
  const polRows=[...GAME.policies].map(pid=>{
    const pol=POLICIES.find(p=>p.id===pid);
    let ach=false;
    if(pid==='welfare')ach=yr.avgSat>=55;
    else ach=(ns[pol.needKey]||0)>=60;
    return`<div class="ach-row"><span>${pol.icon}</span><span style="flex:1">${pol.label}</span>
      <span style="color:${ach?'var(--green)':'var(--red)'}">${ach?'✅ บรรลุเป้า':'❌ ไม่บรรลุ'}</span>
      <span class="text-gray fs10">${ach?'≥60%':'<60%'}</span></div>`;
  });
  document.getElementById('rv-policy').innerHTML=polRows.length?polRows.join(''):'<div class="text-gray fs11">ไม่ได้เลือกนโยบาย</div>';

  // staff eval
  document.getElementById('rv-staff').innerHTML=S.staff.length===0
    ?'<div class="text-gray fs11">ไม่มีบุคลากร</div>'
    :S.staff.map(s=>rvStaffRow(s)).join('');

  updateRvBonusTotal();
}

function rvStaffRow(s){
  const d=SDEF[s.type];
  const ev=pendingEval[s.id]||{rating:'fair',bonus:0};
  const ratingBtns=RATINGS.map(r=>
    `<button class="rv-btn ${ev.rating===r.id?'a-'+r.id:''}" onclick="setRating('${s.id}','${r.id}')">${r.label}</button>`
  ).join('');
  const bonusBtns=BONUSES.map(b=>{
    const key='b'+String(b.pct).replace('.','');
    return`<button class="rv-btn ${ev.bonus===b.pct?'a-bonus':''}" onclick="setBonus('${s.id}',${b.pct})">${b.label}</button>`;
  }).join('');
  const annSal=s.sal*TPY;
  const bonusCost=Math.round(annSal*(ev.bonus/100));
  return`<div class="rv-row">
    <div class="rv-head">
      <span class="fw7">${s.name} <span style="color:${d.color};font-size:11px">${d.label} Lv.${s.lv}</span></span>
      <span class="fs10 text-gray">ทักษะ ${s.sk.main} · ขวัญ ${Math.round(s.morale)}%</span>
    </div>
    <div class="fs10 text-gray mb4">ผลประเมิน:</div>
    <div class="rv-btns">${ratingBtns}</div>
    <div class="fs10 text-gray mt4 mb4">โบนัสประจำปี (เงินเดือนรายปี ฿${annSal.toLocaleString()}):</div>
    <div class="rv-btns">${bonusBtns}</div>
    <div class="fs10 text-yellow mt4" id="rvcost-${s.id}">ค่าโบนัส: ฿${bonusCost.toLocaleString()}</div>
  </div>`;
}

function setRating(sid,rating){
  if(!pendingEval[sid])pendingEval[sid]={rating:'fair',bonus:0};
  pendingEval[sid].rating=rating;
  // re-render staff section only
  document.getElementById('rv-staff').innerHTML=S.staff.map(s=>rvStaffRow(s)).join('');
  updateRvBonusTotal();
}
function setBonus(sid,pct){
  if(!pendingEval[sid])pendingEval[sid]={rating:'fair',bonus:0};
  pendingEval[sid].bonus=pct;
  document.getElementById('rv-staff').innerHTML=S.staff.map(s=>rvStaffRow(s)).join('');
  updateRvBonusTotal();
}
function updateRvBonusTotal(){
  const total=S.staff.reduce((sum,s)=>{
    const ev=pendingEval[s.id]||{rating:'fair',bonus:0};
    return sum+Math.round(s.sal*TPY*(ev.bonus/100));
  },0);
  document.getElementById('rv-bonus-total').textContent='฿'+total.toLocaleString();
}

function confirmYearReview(){
  let totalCost=0;
  S.staff.forEach(s=>{
    const ev=pendingEval[s.id]||{rating:'fair',bonus:0};
    const rl=RATINGS.find(r=>r.id===ev.rating)||RATINGS[2];
    const bl=BONUSES.find(b=>b.pct===ev.bonus)||BONUSES[6];
    s.eff=clamp((s.eff||1)+rl.eff,0.5,1.8);
    s.morale=clamp(s.morale+rl.morale+bl.morale,0,100);
    const cost=Math.round(s.sal*TPY*(ev.bonus/100));
    totalCost+=cost;
  });
  S.budget-=totalCost;
  addLog(`📊 ปิดรายงานปีที่ ${yrNum} โบนัสรวม ฿${totalCost.toLocaleString()}`,'good');
  document.getElementById('modal-review').style.display='none';
  if(yrNum>=4){triggerTermEnd();}
  else{GAME.phase='playing';paused=false;restartInt();}
}

// ═══════════════════════════════════════════════════
// NO CONFIDENCE
// ═══════════════════════════════════════════════════
function triggerNC(){
  if(GAME.phase==='no_confidence')return;
  clearInterval(gint);
  GAME.phase='no_confidence';
  ncState={qIdx:0,score:0};
  renderNC();
  document.getElementById('modal-nc').style.display='flex';
}

function renderNC(){
  const q=NC_QS[ncState.qIdx];
  const prog=NC_QS.map((_,i)=>
    `<div class="nc-dot ${i<ncState.qIdx?'done':i===ncState.qIdx?'cur':''}"></div>`
  ).join('');
  document.getElementById('nc-prog').innerHTML=prog+`<span class="fs11 text-gray">คำถาม ${ncState.qIdx+1}/${NC_QS.length}</span>`;
  document.getElementById('nc-body').innerHTML=`
    <div class="nc-q">${q.q}</div>
    ${q.choices.map(c=>`<button class="nc-opt" onclick="answerNC(${c.score})">${c.text}</button>`).join('')}`;
  document.getElementById('nc-result').style.display='none';
}

function answerNC(score){
  ncState.score+=score;ncState.qIdx++;
  if(ncState.qIdx>=NC_QS.length){resolveNC();}
  else{renderNC();}
}

function resolveNC(){
  const satAfter=S.satisfaction+15;
  const survived=ncState.score>=1&&satAfter>=15;
  document.getElementById('nc-body').style.display='none';
  const el=document.getElementById('nc-result');el.style.display='block';
  if(survived){
    S.satisfaction=clamp(satAfter,0,100);S.lowSatTicks=0;
    el.innerHTML=`<div class="text-green fw7" style="font-size:15px">✅ ผ่านการลงมติ!</div>
      <p class="fs11 text-gray mt4">ความเชื่อมั่นของประชาชนกลับมาบ้าง (+15% ความพึงพอใจ)</p>
      <button class="btn btn-green btn-lg mt8" onclick="closeNC()">กลับสู่การบริหาร</button>`;
  }else{
    GAME.resigned=true;
    el.innerHTML=`<div class="text-red fw7" style="font-size:15px">😔 ญัตติไม่ไว้วางใจผ่าน</div>
      <p class="fs11 text-gray mt4">นายกฯ ต้องลาออกจากตำแหน่ง</p>
      <button class="btn btn-red btn-lg mt8" onclick="handleResign()">ลาออกจากตำแหน่ง</button>`;
  }
}

function closeNC(){
  document.getElementById('modal-nc').style.display='none';
  document.getElementById('nc-body').style.display='block';
  GAME.phase='playing';paused=false;restartInt();
}
function handleResign(){
  document.getElementById('modal-nc').style.display='none';
  if(S.yr.sat.length||S.yr.projDone>0){
    const avgSat=S.yr.sat.length?Math.round(S.yr.sat.reduce((a,b)=>a+b,0)/S.yr.sat.length):Math.round(S.satisfaction);
    S.termYears.push({year:dispYear(),taxIncome:Math.round(S.yr.tax),expenses:Math.round(S.yr.exp),
      projDone:S.yr.projDone,roadBuilt:S.yr.roadBuilt,schoolBuilt:S.yr.schoolBuilt,
      parkBuilt:S.yr.parkBuilt,healthProj:S.yr.healthProj,envProj:S.yr.envProj,commProj:S.yr.commProj,
      avgSat,avgMorale:avgMorale(),needsSnap:{...S.needs,welfare:Math.round(calcWelfare())},resigned:true});
  }
  triggerTermEnd();
}

// ═══════════════════════════════════════════════════
// TERM END
// ═══════════════════════════════════════════════════
function triggerTermEnd(){
  clearInterval(gint);GAME.phase='term_end';
  renderTermEnd();
  document.getElementById('modal-term').style.display='flex';
}

function renderTermEnd(){
  const resigned=GAME.resigned;
  document.getElementById('term-title').textContent=resigned?'😔 ลาออกจากตำแหน่ง':'🏛 ครบวาระ 4 ปี — '+GAME.abtName;

  // cumulative stats
  const tot={tax:0,exp:0,proj:0,road:0,school:0,park:0,avgSat:0};
  S.termYears.forEach(y=>{tot.tax+=y.taxIncome;tot.exp+=y.expenses;tot.proj+=y.projDone;
    tot.road+=y.roadBuilt;tot.school+=y.schoolBuilt;tot.park+=y.parkBuilt;tot.avgSat+=y.avgSat;});
  const avgSat=S.termYears.length?Math.round(tot.avgSat/S.termYears.length):0;
  const grade=avgSat>=65?'A':avgSat>=50?'B':avgSat>=35?'C':'D';
  const gradeColor={A:'var(--green)',B:'var(--accent)',C:'var(--yellow)',D:'var(--red)'}[grade];

  // year-by-year table
  const yearRows=S.termYears.map(y=>`
    <div class="ty-row">
      <span class="fw7" style="min-width:40px">ปี ${y.year}</span>
      <span class="text-gray">รายรับ ฿${y.taxIncome.toLocaleString()}</span>
      <span class="text-gray">โครงการ ${y.projDone}</span>
      <span style="color:${cc(y.avgSat)}">${y.avgSat}% sat</span>
      ${y.resigned?'<span class="badge badge-red">ลาออก</span>':''}
    </div>`).join('');

  // policy achievement per year
  const selPols=[...GAME.policies].map(id=>POLICIES.find(p=>p.id===id));
  const polRows=selPols.map(pol=>{
    const yAchs=S.termYears.map(y=>{
      if(pol.id==='welfare')return y.avgSat>=55;
      return(y.needsSnap?.[pol.needKey]||0)>=60;
    });
    const achCount=yAchs.filter(Boolean).length;
    return`<div class="ach-row"><span>${pol.icon}</span><span style="flex:1">${pol.label}</span>
      ${yAchs.map(a=>`<span style="color:${a?'var(--green)':'var(--red)'}">${a?'✅':'❌'}</span>`).join('')}
      <span class="text-gray fs10">${achCount}/${S.termYears.length}</span></div>`;
  });

  document.getElementById('term-content').innerHTML=`
    <div class="grade-box">
      <div class="grade-letter" style="color:${gradeColor}">${grade}</div>
      <div class="fs11 text-gray">ผลการบริหาร (ความพึงพอใจเฉลี่ย ${avgSat}%)</div>
    </div>
    <div class="rv-stat-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:10px">
      <div class="rv-stat"><div class="rv-stat-val">฿${tot.tax.toLocaleString()}</div><div class="rv-stat-lbl">รายรับรวม</div></div>
      <div class="rv-stat"><div class="rv-stat-val">${tot.proj}</div><div class="rv-stat-lbl">โครงการทั้งหมด</div></div>
      <div class="rv-stat"><div class="rv-stat-val">${S.infra.length}</div><div class="rv-stat-lbl">สิ่งปลูกสร้าง</div></div>
      <div class="rv-stat"><div class="rv-stat-val">${S.staff.length}</div><div class="rv-stat-lbl">บุคลากร</div></div>
    </div>
    <div class="sec-title">ผลงานรายปี</div>
    <div style="background:var(--bg3);border-radius:8px;padding:10px;margin-bottom:8px">${yearRows||'<span class="text-gray fs11">ไม่มีข้อมูล</span>'}</div>
    ${selPols.length?`<div class="sec-title">ผลงานตามนโยบาย</div><div class="mb8">${polRows.join('')}</div>`:''}`;

  // buttons
  document.getElementById('term-btns').innerHTML=
    `<button class="btn btn-accent" style="flex:1;padding:10px" onclick="chooseReelect()">🗳 หาเสียงใน อบต.เดิม</button>
     <button class="btn btn-blue"   style="flex:1;padding:10px" onclick="chooseNewAbt()">🆕 ย้ายไป อบต.ใหม่</button>`;
}

function chooseReelect(){
  const avgSat=S.termYears.length?Math.round(S.termYears.reduce((a,b)=>a+b.avgSat,0)/S.termYears.length):50;
  const winChance=clamp((avgSat-20)/60,.10,.90);
  const won=Math.random()<winChance;
  const polBonus=Math.min(GAME.policies.size*3,12);
  GAME.electionSat=clamp(Math.round(avgSat*.7+polBonus+(rng(11)-5)),20,78);
  GAME.electWon=won;
  GAME.isReelect=true;
  GAME.termNum++;
  document.getElementById('modal-term').style.display='none';
  renderElectionScreen();
  showScreen('election');
}

function chooseNewAbt(){
  clearSave();
  document.getElementById('modal-term').style.display='none';
  GAME.policies=new Set();GAME.termNum=1;GAME.resigned=false;GAME.isReelect=false;
  _id=0;
  renderSetup();
  POLICIES.forEach(p=>{const el=document.getElementById('pc-'+p.id);if(el)el.classList.remove('on');});
  document.getElementById('abt-name').value='';
  showScreen('setup');
}

// ═══════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════
function switchTab(tab){
  activeTab=tab;
  ['overview','staff','infra','projects'].forEach((t,i)=>{
    document.querySelectorAll('.tab')[i].classList.toggle('active',t===tab);
    document.getElementById('panel-'+t).classList.toggle('active',t===tab);
  });
  renderActivePanel();
}

function renderAll(){updateHUD();renderActivePanel();updateDots();}

function renderActivePanel(){
  if(activeTab==='overview')renderOverview();
  else if(activeTab==='staff')renderStaffTab();
  else if(activeTab==='infra')renderInfraTab();
  else if(activeTab==='projects')renderProjectsTab();
}

function updateHUD(){
  document.getElementById('budgetVal').textContent='฿'+Math.round(S.budget).toLocaleString();
  const tax=calcTax(),sal=S.staff.reduce((s,x)=>s+x.sal,0),mnt=S.infra.reduce((s,x)=>s+x.mc,0);
  const net=tax+S.subsidy-sal-mnt;
  const nv=document.getElementById('netVal');
  nv.textContent=(net>=0?'+':'')+'฿'+pw(net);
  nv.className='stat-val '+(net>=0?'text-green':'text-red');
  const sf=document.getElementById('satFill');
  sf.style.width=S.satisfaction+'%';sf.style.background=cc(S.satisfaction);
  document.getElementById('satLabel').textContent=`${Math.round(S.satisfaction)}%`;
  document.getElementById('yearVal').textContent='ปี '+dispYear();
  document.getElementById('monthVal').textContent=dispMonth();
}

function updateDots(){
  document.getElementById('dotStaff').classList.toggle('show',S.staff.some(s=>s.morale<40));
  document.getElementById('dotInfra').classList.toggle('show',S.infra.some(i=>i.cond<30));
  const needAlert=N_KEYS.some(k=>S.needs[k]<30);
  document.getElementById('dotProjects').classList.toggle('show',S.infra.some(i=>i.cond<20)||S.activeProjects.length>0||needAlert);
}

function renderLog(){
  document.getElementById('eventLog').innerHTML=logs.map(e=>
    `<div class="log-entry log-${e.type}"><span class="log-ts">[${e.ts}]</span>${e.msg}</div>`).join('');
}

function renderOverview(){
  // Needs grid
  const welfare=calcWelfare();
  const allNeeds=[
    {k:'infra',l:'🛣 โครงสร้างฯ',v:S.needs.infra},
    {k:'health',l:'💊 สาธารณสุข',v:S.needs.health},
    {k:'edu',l:'📚 การศึกษา',v:S.needs.edu},
    {k:'econ',l:'💰 เศรษฐกิจ',v:S.needs.econ},
    {k:'env',l:'🌱 สิ่งแวดล้อม',v:S.needs.env},
    {k:'welfare',l:'🤝 คุณภาพชีวิต',v:welfare},
  ];
  document.getElementById('needsGrid').innerHTML=allNeeds.map(n=>{
    const v=Math.round(n.v),c=cc(v);
    const pol=POLICIES.find(p=>p.needKey===n.k);
    const polActive=pol&&pOn(pol.id);
    return`<div class="need-item" style="${n.v<30?'border:1px solid var(--red)':''}">
      <div class="need-lbl">${n.l}${polActive?' ⭐':''}</div>
      <div class="need-bar"><div class="need-fill" style="width:${v}%;background:${c}"></div></div>
      <div class="need-val" style="color:${c}">${v}%${n.v<30?' ⚠':''}</div>
    </div>`;
  }).join('');

  // Budget
  const tax=calcTax(),sal=S.staff.reduce((s,x)=>s+x.sal,0),mnt=S.infra.reduce((s,x)=>s+x.mc,0);
  const net=tax+S.subsidy-sal-mnt;
  document.getElementById('budgetDetail').innerHTML=`
    <div class="brow"><span>ภาษี</span><span class="inc">+฿${pw(tax)}/สัปดาห์</span></div>
    <div class="brow"><span>อุดหนุน</span><span class="inc">+฿${pw(S.subsidy)}/สัปดาห์</span></div>
    <div class="brow"><span>เงินเดือน</span><span class="exp">-฿${pw(sal)}/สัปดาห์</span></div>
    <div class="brow"><span>บำรุงรักษา</span><span class="exp">-฿${pw(mnt)}/สัปดาห์</span></div>
    <div class="brow fw7" style="margin-top:3px"><span>สุทธิ</span><span class="${net>=0?'inc':'exp'}">${net>=0?'+':''}฿${pw(net)}/สัปดาห์</span></div>`;
  document.getElementById('resourceSummary').innerHTML=`
    <div class="brow"><span>ประชากรทั้งหมด</span><span class="fw7">${S.pop.total.toLocaleString()} คน</span></div>
    <div class="brow"><span>🧒 เด็ก / 🧑 วัยทำงาน / 👴 ผู้สูงอายุ</span><span class="fs10 text-gray">${S.pop.child}% / ${S.pop.worker}% / ${S.pop.elderly}%</span></div>
    <div class="brow"><span>บุคลากร</span><span>${S.staff.length} คน</span></div>
    <div class="brow"><span>สิ่งปลูกสร้าง</span><span>${S.infra.length} แห่ง</span></div>
    <div class="brow"><span>โครงการสำเร็จ</span><span>${S.projDone}</span></div>
    <div class="brow"><span>กำลังดำเนิน</span><span>${S.activeProjects.length}</span></div>`;
  renderLog();
}

function renderStaffTab(){
  document.getElementById('staffList').innerHTML=S.staff.length===0
    ?'<div class="text-gray fs11">ยังไม่มีบุคลากร</div>'
    :S.staff.map(sCard).join('');
  renderHire();
}

function sCard(s){
  const d=SDEF[s.type];
  const pers=s.p.map(p=>`<span class="badge ${PERS[p].color||'badge-gray'}">${p}</span>`).join(' ');
  const rels=Object.entries(s.rels).map(([rid,sc])=>{
    const o=S.staff.find(x=>x.id===rid);if(!o)return'';
    const icon=sc>20?'❤':sc<-10?'😠':'😐';
    const c=sc>20?'var(--green)':sc<-10?'var(--red)':'var(--text2)';
    return`<span style="color:${c};font-size:10px">${icon}${o.name.split(' ')[0]}</span>`;
  }).filter(Boolean).join(' ');
  const mc=s.morale>60?'var(--green)':s.morale>35?'var(--yellow)':'var(--red)';
  const effPct=Math.round((s.eff||1)*100);
  return`<div class="staff-card">
    <div class="staff-hd">
      <div><div class="fw7">${s.name}</div><div style="font-size:11px;color:${d.color}"><i class="${d.icon}"></i> ${d.label} Lv.${s.lv}</div></div>
      <button class="btn btn-sm btn-red" onclick="fireStaff('${s.id}')">ปลด</button>
    </div>
    <div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px">${pers}</div>
    <div class="bar-row"><span>ทักษะหลัก</span><span>${s.sk.main}</span></div>
    <div class="mini-bar"><div class="mini-fill" style="width:${s.sk.main}%;background:var(--accent)"></div></div>
    <div class="bar-row"><span>ทักษะสังคม</span><span>${s.sk.soc}</span></div>
    <div class="mini-bar"><div class="mini-fill" style="width:${s.sk.soc}%;background:var(--purple)"></div></div>
    <div class="bar-row"><span>ขวัญกำลังใจ</span><span style="color:${mc}">${Math.round(s.morale)}%</span></div>
    <div class="mini-bar"><div class="mini-fill" style="width:${s.morale}%;background:${mc}"></div></div>
    <div class="fs10 text-gray mt4">เงินเดือน ฿${pw(s.sal)}/สัปดาห์ · ประสิทธิภาพ ${effPct}% · ฝึก ${s.trn}ครั้ง</div>
    ${rels?`<div class="fs10 text-gray mt4">${rels}</div>`:''}
    <button class="btn btn-sm btn-yellow" style="margin-top:6px;width:100%" onclick="trainStaff('${s.id}')">📚 ฝึกอบรม (฿${s.tc})</button>
  </div>`;
}

function renderHire(){
  const el=document.getElementById('hireCandidates');
  if(!hireMode||!hireCands.length){el.innerHTML='';return;}
  const d=SDEF[hireMode];
  el.innerHTML=`<div class="card">
    <div class="card-hd"><span class="card-title">เลือกผู้สมัคร ${d.label}</span><button class="btn btn-sm" onclick="cancelHire()">ยกเลิก</button></div>
    <div style="display:flex;gap:8px">${hireCands.map((c,i)=>candCard(c,i)).join('')}</div>
  </div>`;
}

function candCard(c,idx){
  const d=SDEF[c.type];
  const pers=c.p.map(p=>`<span class="badge ${PERS[p].color||'badge-gray'}">${p}</span>`).join(' ');
  const mc=c.morale>60?'var(--green)':'var(--yellow)';
  return`<div class="cand-card" onclick="confirmHire(${idx})">
    <div class="fw7">${c.name}</div>
    <div class="fs11" style="color:${d.color};margin-bottom:4px">${d.label}</div>
    <div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px">${pers}</div>
    <div class="fs11">ทักษะ <b>${c.sk.main}</b> · สังคม <b>${c.sk.soc}</b></div>
    <div class="fs11">ขวัญ <span style="color:${mc}">${Math.round(c.morale)}%</span></div>
    <div class="fs11 mt4">฿${pw(c.sal)}/สัปดาห์ · ฝึก ฿${c.tc}</div>
    <button class="btn btn-green btn-sm" style="margin-top:6px;width:100%">จ้าง ฿${c.hc}</button>
  </div>`;
}

function renderInfraTab(){
  const list=document.getElementById('infraList'),empty=document.getElementById('infraEmpty');
  if(!S.infra.length){list.style.display='none';empty.style.display='block';return;}
  empty.style.display='none';list.style.display='grid';
  list.innerHTML=S.infra.map(iCard).join('');
}

function iCard(it){
  const cond=Math.round(it.cond),c=cc(cond);
  const cost=Math.round((100-it.cond)*it.mc*.5);
  return`<div class="infra-card">
    <div class="flex-sb mb6">
      <div><div class="fw7">${it.name}</div><div class="fs10 text-gray">${ILBL[it.type]||it.type} · ปี ${it.yr}</div></div>
      <span style="color:${c};font-weight:700">${cond}%</span>
    </div>
    <div class="cond-bar"><div class="cond-fill" style="width:${cond}%;background:${c}"></div></div>
    <div class="fs10 text-gray mb6">เสื่อม ${(it.decay*100).toFixed(1)}%/t · บำรุง ฿${pw(it.mc)}/สัปดาห์${it.cond<30?' <span style="color:var(--red)">⚠ต้องซ่อม!</span>':''}</div>
    <button class="btn btn-sm btn-yellow" onclick="repairNow('${it.id}')" ${S.budget<cost?'disabled':''}>🔧 ซ่อมด่วน ฿${cost}</button>
  </div>`;
}

function renderProjectsTab(){
  // Active
  document.getElementById('activeProjList').innerHTML=!S.activeProjects.length
    ?'<div class="text-gray fs11 mb6">ไม่มีโครงการที่กำลังดำเนิน</div>'
    :S.activeProjects.map(p=>{
      const pct=Math.min(100,(p.el/p.ticks)*100);
      return`<div class="active-proj"><div class="flex-sb"><span>${p.label}</span><span class="fs11 text-gray">${p.el}/${p.ticks}t</span></div>
        <div class="proj-prog mt4"><div class="proj-fill" style="width:${pct}%"></div></div></div>`;
    }).join('');

  // Repair
  const rs=document.getElementById('repairSection');
  const dmg=S.infra.filter(i=>i.cond<80).sort((a,b)=>a.cond-b.cond);
  rs.innerHTML=!dmg.length
    ?'<div class="text-gray fs11 mb6">สิ่งปลูกสร้างทั้งหมดอยู่ในสภาพดี</div>'
    :dmg.map(it=>{
      const cond=Math.round(it.cond),c=cc(cond);
      const cost=Math.round((100-it.cond)*it.mc*.4+50);
      const busy=S.activeProjects.some(p=>p.iid===it.id);
      return`<div class="repair-item">
        <div><span class="fw7">${it.name}</span> <span style="color:${c}">${cond}%</span></div>
        <button class="btn btn-sm btn-yellow" onclick="startRepair('${it.id}')" ${busy||S.budget<cost?'disabled':''}>
          ${busy?'🔄 กำลังซ่อม':'ซ่อม ฿'+cost}</button>
      </div>`;
    }).join('');

  // Construction
  const hasEng=S.staff.some(s=>s.type==='engineer');
  document.getElementById('constructionCards').innerHTML=CONSTRUCT.map(p=>{
    const run=S.activeProjects.some(a=>a.id===p.id);
    const lk=(p.needEng&&!hasEng)||run||S.budget<p.cost;
    const why=run?'กำลังดำเนิน':(p.needEng&&!hasEng)?'ต้องมีนายช่าง':(S.budget<p.cost?'งบไม่พอ':'');
    return`<div class="proj-card ${run?'running':''} ${lk&&!run?'locked':''}" onclick="${lk?'void 0':`startConstruct('${p.id}')`}">
      <div style="font-size:20px;margin-bottom:4px"><i class="${p.icon}"></i></div>
      <div class="fw7 fs11">${p.label}</div>
      <div class="fs10 text-gray mt4">${p.desc}</div>
      <div class="fs10 mt4">฿${p.cost} · ${p.ticks}t</div>
      ${why?`<div class="fs10 text-red mt4">${why}</div>`:''}
    </div>`;
  }).join('');

  // Community
  document.getElementById('communityCards').innerHTML=COMMUNITY.map(p=>{
    const run=S.activeProjects.some(a=>a.id===p.id);
    const done=S.oneTime.has(p.id);
    const lk=run||done||S.budget<p.cost;
    return`<div class="proj-card ${run?'running':''} ${lk&&!run?'locked':''}" onclick="${lk?'void 0':`startCommunity('${p.id}')`}">
      <div style="font-size:20px;margin-bottom:4px"><i class="${p.icon}"></i></div>
      <div class="fw7 fs11">${p.label}</div>
      <div class="fs10 text-gray mt4">${p.desc}</div>
      <div class="fs10 mt4">฿${p.cost} · ${p.ticks}t</div>
      <div class="mt4">${p.rep?'<span class="badge badge-blue">ทำซ้ำได้</span>':'<span class="badge badge-gray">ครั้งเดียว</span>'}</div>
      ${done?'<div class="fs10 text-green mt4">✓ สำเร็จแล้ว</div>':''}${run?'<div class="fs10 text-yellow mt4">กำลังดำเนิน</div>':''}
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════
// SPEED / PAUSE
// ═══════════════════════════════════════════════════
const SPD_IDS={0.25:'sp025',0.5:'sp05',1:'sp1',2:'sp2',5:'sp5'};
function setSpeed(s){
  spd=s;
  Object.entries(SPD_IDS).forEach(([v,id])=>document.getElementById(id).classList.toggle('active',+v===s));
  if(!paused)restartInt();
}
function togglePause(){
  paused=!paused;
  const btn=document.getElementById('btnPause');
  if(paused){clearInterval(gint);btn.textContent='▶';btn.classList.add('active');}
  else{restartInt();btn.textContent='⏸';btn.classList.remove('active');}
}
function restartInt(){clearInterval(gint);gint=setInterval(gameTick,Math.round(1000/spd));}

// ═══════════════════════════════════════════════════
// SAVE / LOAD (localStorage)
// ═══════════════════════════════════════════════════
const SAVE_KEY='idleMayorSave_v1';

function saveGame(){
  if(GAME.phase!=='playing')return;
  try{
    const data={
      S:{...S,oneTime:[...S.oneTime]},
      G:{abtName:GAME.abtName,policies:[...GAME.policies],electionSat:GAME.electionSat,termNum:GAME.termNum,isReelect:GAME.isReelect},
      logs:logs.slice(0,30),spd,activeTab,_id,
    };
    localStorage.setItem(SAVE_KEY,JSON.stringify(data));
  }catch(e){}
}

function loadGame(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return false;
    const data=JSON.parse(raw);
    S={...data.S,oneTime:new Set(data.S.oneTime||[])};
    if(!S.pop)S.pop={total:2500,child:25,worker:55,elderly:20};
    GAME.abtName=data.G.abtName;
    GAME.policies=new Set(data.G.policies||[]);
    GAME.electionSat=data.G.electionSat||50;
    GAME.termNum=data.G.termNum||1;
    GAME.isReelect=data.G.isReelect||false;
    GAME.phase='playing';GAME.resigned=false;GAME.electWon=true;
    logs.length=0;(data.logs||[]).forEach(l=>logs.push(l));
    spd=data.spd||1;
    activeTab=data.activeTab||'overview';
    _id=data._id||0;
    return true;
  }catch(e){return false;}
}

function clearSave(){localStorage.removeItem(SAVE_KEY);}

function confirmResign(){
  clearInterval(gint);
  document.getElementById('modal-resign').style.display='flex';
}

function doResign(){
  document.getElementById('modal-resign').style.display='none';
  GAME.resigned=true;
  const avgSat=S.yr.sat.length?Math.round(S.yr.sat.reduce((a,b)=>a+b,0)/S.yr.sat.length):Math.round(S.satisfaction);
  if(S.tick>0){
    S.termYears.push({
      year:dispYear(),taxIncome:Math.round(S.yr.tax),expenses:Math.round(S.yr.exp),
      projDone:S.yr.projDone,roadBuilt:S.yr.roadBuilt,schoolBuilt:S.yr.schoolBuilt,
      parkBuilt:S.yr.parkBuilt,healthProj:S.yr.healthProj,envProj:S.yr.envProj,
      commProj:S.yr.commProj,avgSat,avgMorale:avgMorale(),
      needsSnap:{...S.needs,welfare:Math.round(calcWelfare())},resigned:true,
    });
  }
  clearSave();
  triggerTermEnd();
}

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
if(loadGame()){
  document.getElementById('hd-name').textContent=GAME.abtName;
  Object.entries(SPD_IDS).forEach(([v,id])=>document.getElementById(id).classList.toggle('active',+v===spd));
  if(activeTab!=='overview')switchTab(activeTab);
  showScreen('game');
  renderAll();
  restartInt();
  addLog('💾 โหลดเกมต่อจากที่บันทึกไว้','good');
}else{
  renderSetup();
  showScreen('setup');
}
