const {timingSafeEqual}=require('node:crypto');
const ROOT='https://cpfawfukpssesuoypzub.supabase.co/rest/v1/family_trial_202610';
const states=new Set(['applied','eligible','selected','waitlisted','confirmed','shipped','completed','declined']);
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({ok:false});
 let b=req.body;try{if(typeof b==='string')b=JSON.parse(b);}catch{return res.status(400).json({ok:false});}
 const admin=process.env.ADMIN_PASSWORD,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!admin||!key)return res.status(503).json({ok:false,message:'관리 설정을 확인해 주세요.'});
 const a=Buffer.from(typeof b?.password==='string'?b.password:''),expected=Buffer.from(admin);
 if(a.length!==expected.length||!timingSafeEqual(a,expected))return res.status(401).json({ok:false,message:'로그인 정보를 확인해 주세요.'});
 const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
 try{
  if(b.action==='list'){const r=await fetch(ROOT+'?select=*&order=created_at.desc&limit=1000',{headers,signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();return res.status(200).json({ok:true,applications:await r.json()});}
  if(b.action==='status'&&/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(b.id||'')&&states.has(b.status)){
   const r=await fetch(ROOT+'?id=eq.'+b.id,{method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify({status:b.status,updated_at:new Date().toISOString()}),signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const rows=await r.json();if(rows.length!==1)return res.status(404).json({ok:false});return res.status(200).json({ok:true});
  }
  return res.status(400).json({ok:false,message:'요청 내용을 확인해 주세요.'});
 }catch{return res.status(503).json({ok:false,message:'자료를 불러오거나 저장하지 못했습니다.'});}
};
