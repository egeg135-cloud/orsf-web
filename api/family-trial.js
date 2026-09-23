// October 2026 cohort. New table keeps earlier trial records unchanged.
const SB_URL = 'https://cpfawfukpssesuoypzub.supabase.co';
const TABLE = 'family_trial_202610';
const CLOSE_AT = Date.parse('2026-10-03T23:59:59+09:00');
const AGE = new Set(['4-6', '7-10']);
const SOLUTIONS = new Set(['거품형 핸드워시','액상 핸드워시','고체 비누','젤리 비누','물만 사용','기타']);
const ISSUES = new Set(['손 씻기 시작을 꺼려요','너무 빨리 끝내요','비누 사용을 꺼려요','씻은 뒤 정리가 어려워요','특별한 불편은 없어요','기타']);
const ATTR = {source:new Set(['meta','instagram','community','direct']),medium:new Set(['paid_social','organic','referral','none']),campaign:new Set(['orsf_trial_202610']),content:new Set(['tactile','family','profile','community'])};
const str = (v,max) => typeof v === 'string' && v.length <= max ? v.trim() : '';
function normalizeContact(v) { const raw = str(v,80); return raw.includes('@') ? raw.toLowerCase() : raw.replace(/[ -]/g,''); }
function parse(body) { if (typeof body === 'string') { try { return JSON.parse(body); } catch { return null; } } return body && typeof body === 'object' && !Array.isArray(body) ? body : null; }
function validate(body) {
  const guardian = str(body.guardianName,40), contact = normalizeContact(body.contact);
  if(guardian.length<2 || !(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)||/^01[016789]\d{7,8}$/.test(contact))) return null;
  if(!AGE.has(body.childAgeGroup)||!SOLUTIONS.has(body.currentSolution)||!ISSUES.has(body.mainIssue)||body.participationAgreed!==true||body.privacyConsent!==true) return null;
  const a = body.attribution || {}, attr = {};
  for(const [key,set] of Object.entries(ATTR)) attr[key] = set.has(a[key]) ? a[key] : '';
  return {guardian_name:guardian,contact,child_age_group:body.childAgeGroup,current_solution:body.currentSolution,main_issue:body.mainIssue,participation_agreed:true,privacy_consent:true,consent_version:'2026-09-24-v1',attribution:attr};
}
module.exports = async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  const reply=(status,data)=>res.status(status).json(data);
  if(!['GET','POST'].includes(req.method)) {res.setHeader('Allow','GET, POST');return reply(405,{ok:false});}
  const configured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const enabled = process.env.TRIAL_RECRUITMENT_OPEN === 'true';
  const open = enabled && configured && Date.now() <= CLOSE_AT;
  if(req.method==='GET'){
    if(!open) return reply(200,{ok:true,open:false,reason:Date.now()>CLOSE_AT?'closed':'preparing'});
    try {
      const check=await fetch(`${SB_URL}/rest/v1/${TABLE}?select=id&limit=0`,{headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`},signal:AbortSignal.timeout(8000)});
      return reply(200,{ok:true,open:check.ok,reason:check.ok?'open':'preparing',metaPixelId:/^\d{5,25}$/.test(process.env.META_PIXEL_ID||'')?process.env.META_PIXEL_ID:''});
    } catch{return reply(200,{ok:true,open:false,reason:'preparing'});}
  }
  if(!open) return reply(503,{ok:false,message:Date.now()>CLOSE_AT?'모집이 마감되었습니다.':'신청 접수 준비 중입니다. 잠시 후 다시 확인해 주세요.'});
  const body=parse(req.body);
  if(!body||JSON.stringify(body).length>5000) return reply(400,{ok:false,message:'신청 내용을 확인해 주세요.'});
  if(body.website) return reply(400,{ok:false,message:'신청 내용을 확인해 주세요.'});
  const row=validate(body);
  if(!row) return reply(400,{ok:false,message:'연락처, 연령 및 필수 응답·동의를 확인해 주세요.'});
  try{
    const result=await fetch(`${SB_URL}/rest/v1/${TABLE}`,{method:'POST',headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row),signal:AbortSignal.timeout(10000)});
    if(result.status===409) return reply(200,{ok:true,duplicate:true});
    if(!result.ok) {console.error('family_trial_insert_failed',result.status);return reply(503,{ok:false,message:'신청이 저장되지 않았습니다. 잠시 후 다시 시도해 주세요.'});}
    return reply(201,{ok:true,created:true});
  }catch{return reply(503,{ok:false,message:'신청이 저장되지 않았습니다. 잠시 후 다시 시도해 주세요.'});}
};
module.exports.validate=validate;
