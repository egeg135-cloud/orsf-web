(() => {
  const form=document.getElementById('trialForm'), fields=document.getElementById('fields'), btn=document.getElementById('submit'), msg=document.getElementById('formMsg'), availability=document.getElementById('availability');
  const allowed={source:['meta','instagram','community','direct'],medium:['paid_social','organic','referral','none'],campaign:['orsf_trial_202610'],content:['tactile','family','profile','community']};
  const query=new URLSearchParams(location.search), attribution={};
  let stored={};try{stored=JSON.parse(sessionStorage.getItem('orsf_trial_attribution')||'{}')||{};}catch{}
  const fresh=query.has('utm_source')||query.has('utm_campaign');
  for(const [key,values] of Object.entries(allowed)){const value=fresh?query.get('utm_'+key):stored[key];attribution[key]=values.includes(value)?value:'';}
  try{sessionStorage.setItem('orsf_trial_attribution',JSON.stringify(attribution));}catch{}
  const events=[];let pixelReady=false;
  // Only fixed event names and allowlisted attribution; never serialize form answers.
  function track(name){const payload={campaign:'orsf_trial_202610',creative:attribution.content||'direct'};events.push({name,payload});if(pixelReady)emit(name,payload);}
  function emit(name,payload){if(name==='trial_application_submit')window.fbq('track','Lead',payload);else window.fbq('trackCustom',name,payload);}
  function setupPixel(id){if(!/^\d{5,25}$/.test(id||''))return;const q=function(){q.callMethod?q.callMethod.apply(q,arguments):q.queue.push(arguments)};q.push=q;q.loaded=true;q.version='2.0';q.queue=[];window.fbq=q;window._fbq=q;const script=document.createElement('script');script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';document.head.append(script);q('set','autoConfig',false,id);q('init',id);pixelReady=true;events.forEach(e=>emit(e.name,e.payload));}
  track('trial_landing_view');
  let started=false;form.addEventListener('focusin',()=>{if(!started){started=true;track('trial_form_start');}});
  fetch('/api/family-trial').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{if(data.open===true){fields.disabled=false;availability.textContent='20가구 모집 · 10월 3일 23:59 마감 예정';setupPixel(data.metaPixelId);}else availability.textContent=data.reason==='closed'?'이번 체험단 모집이 마감되었습니다.':'체험단 접수 준비 중입니다. 문의: 2025syso@gmail.com';}).catch(()=>{availability.textContent='접수 상태를 확인하지 못했습니다. 새로고침하거나 이메일로 문의해 주세요.';});
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const f=new FormData(form), contact=String(f.get('contact')||'').trim();
    if(!(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)||/^01[016789][ -]?\d{3,4}[ -]?\d{4}$/.test(contact))){msg.textContent='이메일 또는 휴대폰 번호 형식을 확인해 주세요.';msg.focus();return;}
    const body={guardianName:f.get('guardianName'),contact,childAgeGroup:f.get('childAgeGroup'),currentSolution:f.get('currentSolution'),mainIssue:f.get('mainIssue'),participationAgreed:f.has('participationAgreed'),privacyConsent:f.has('privacyConsent'),website:f.get('website'),attribution};
    btn.disabled=true;btn.textContent='신청서 저장 중…';msg.textContent='';
    try{const r=await fetch('/api/family-trial',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok||!data.ok||(!data.created&&!data.duplicate))throw Error(data.message||'신청이 저장되지 않았습니다. 다시 시도해 주세요.');
      if(data.created)track('trial_application_submit');
      form.reset();fields.disabled=true;msg.textContent=data.duplicate?'이미 접수된 연락처입니다. 추가 신청 없이 기존 접수 내역을 확인하겠습니다.':'신청이 접수되었습니다. 최종 선정은 10월 4일까지 개별 안내드립니다. 신청 완료는 최종 선정을 의미하지 않습니다.';msg.focus();btn.textContent='접수 완료';
    }catch(error){track('trial_application_error');msg.textContent=error.message||'연결이 원활하지 않습니다. 다시 시도해 주세요.';msg.focus();btn.disabled=false;btn.textContent='체험단 신청하기 ↗';}
  });
})();
