
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm";
const db=createClient("https://rqbmcnczfnfabsgiuvcs.supabase.co","sb_publishable_BrHgJVI8ooHwbV5rbqYVxg_6vRmOzjz");
const $=s=>document.getElementById(s);
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const css=document.createElement("style");css.textContent=".c360btn{background:#6953d8;color:#fff;padding:9px 13px;border:0;border-radius:8px;font-weight:bold;cursor:pointer}.c360btn.light{background:#eeeafe;color:#5842b0}.c360modal{border:0;border-radius:15px;padding:24px;width:min(770px,94vw);max-height:90vh;overflow:auto;box-shadow:0 12px 70px #070f2866}.c360modal::backdrop{background:#10142db0}.c360meta{font-size:12px;color:#8590a8}.c360-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.c360-field{display:block;font-size:12px;font-weight:bold;margin-top:16px}.c360-field textarea,.c360-field input,.c360-field select{width:100%;padding:12px;border:1px solid #d9e0ef;border-radius:9px;margin-top:7px}.c360-info{background:#f3f0ff;color:#5c4ba4;padding:12px;border-radius:8px;line-height:1.6}.c360-card{border-bottom:1px solid #e5eafa;padding:15px 0}.c360-status{color:#6551c5;font-weight:bold;font-size:12px}";document.head.append(css);
const modal=document.createElement("dialog");modal.className="c360modal";modal.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><h2 id="c360Title">Detalhes</h2><button id="c360Close" class="c360btn light">Fechar</button></div><div id="c360Body"></div>';document.body.append(modal);$("c360Close").onclick=()=>modal.close();
function open(title,html){$("c360Title").textContent=title;$("c360Body").innerHTML=html;modal.showModal()}
const link=j=>new URL("candidatura.html?vaga="+encodeURIComponent(j.id),location.href).href;
const msg=j=>{
 const p=[
  "🚨 *OPORTUNIDADE DE EMPREGO — "+(j.job_code||j.title)+"* 🚨",
  "",
  "💼 *VAGA:* "+j.title,
  "📍 *Local:* "+[j.company_name,j.city].filter(Boolean).join(" — "),
  "💰 *Salário:* "+(j.salary_description||"A combinar"),
  j.shift_options?.length?"🕒 *Turnos:* "+j.shift_options.join(" | "):j.schedule_description?"🕒 *Horário:* "+j.schedule_description:"",
  j.work_scale?"📅 *Escala:* "+j.work_scale:"",
  j.benefits_description?"🎁 *Benefícios:* "+j.benefits_description:"",
  j.attendance_bonus?"🏅 *Bônus de assiduidade:* R$ "+Number(j.attendance_bonus).toLocaleString("pt-BR",{minimumFractionDigits:2}):"",
  j.meal_allowance?"🛒 *Vale-alimentação:* R$ "+Number(j.meal_allowance).toLocaleString("pt-BR",{minimumFractionDigits:2}):"",
  j.meal_on_site?"🍽️ Refeição no local":"",
  j.description?"📝 *Descrição:* "+j.description:"",
  j.requirements?"✅ *Requisitos:* "+j.requirements:"",
  j.starts_on?"📆 *Início previsto:* "+new Date(j.starts_on+"T12:00:00").toLocaleDateString("pt-BR"):"",
  "",
  "📍 *Regiões atendidas:*",
  (j.accepted_regions||[]).join(", "),
  "",
  j.contact_whatsapp?"📞 *Contato da seleção:* "+j.contact_whatsapp:"",
  "📲 *PARA SE CANDIDATAR, ABRA O LINK E PREENCHA SEU CADASTRO:*",
  link(j),
  "",
  "Após o cadastro, nossa equipe fará a triagem e poderá entrar em contato para agendar uma entrevista. A inscrição não garante contratação."
 ];
 return p.filter(x=>x!==null&&x!==undefined).join("\n");
};
async function copy(t){try{await navigator.clipboard.writeText(t);alert("Anúncio copiado. Cole no grupo do WhatsApp.")}catch{prompt("Copie:",t)}}
let jobs=[],apps=[],people=[];
document.addEventListener('c360-data',({detail})=>({jobs,apps,people}=detail));
function refresh(){document.dispatchEvent(new Event('c360-refresh'));}
function regionFlag(c,j){
 const normalize=value=>String(value??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim().replace(/\s+/g,' ');
 const accepted=(j.accepted_regions||[]).map(normalize).filter(Boolean);
 const places=[c.city,c.neighborhood].map(normalize).filter(Boolean);
 if(!accepted.length)return 'Regiões da vaga não informadas';
 if(!places.length)return 'Residência a verificar';
 const locations=[...places,normalize([c.city,c.neighborhood].filter(Boolean).join(' - ')),normalize([c.neighborhood,c.city].filter(Boolean).join(' - '))];
 return accepted.some(region=>locations.includes(region))?'Região atendida':'Região a conferir';
}
function route(c,j){
 const origin=[c.address,c.neighborhood,c.city,'SP Brasil'].filter(Boolean).join(', ');
 const destination=[j.address,j.neighborhood,j.city,'SP Brasil'].filter(Boolean).join(', ');
 const query=new URLSearchParams({api:'1',origin,destination,travelmode:'transit'});
 return 'https://www.google.com/maps/dir/?'+query;
}
const statusLabel={new:'Nova inscrição',screening:'Em análise',contacted:'Contato realizado',interview:'Entrevista agendada',interviewed:'Entrevista feita',hired:'Contratado',rejected:'Reprovado'};
const yesNo=value=>value===true?'Sim':value===false?'Não':'Não informado';
const localDate=value=>value?new Date(new Date(value).getTime()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16):'';
function showJobs(id){
 const j=jobs.find(j=>j.id===id);if(!j)return;
 const all=apps.filter(a=>a.job_id===id).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
 open("Candidaturas — "+j.title,'<p class="c360meta">'+safe(j.city||"")+' • '+all.length+' inscrição(ões)</p><div class="c360-info">Um link pode ser encaminhado por outras pessoas. Use prazo de inscrição e encerre a vaga quando quiser bloquear novas candidaturas.</div><div class="c360-actions"><button class="c360btn" id="sendVaga">Divulgar no WhatsApp</button><button class="c360btn light" id="copyVaga">Copiar anúncio</button><button class="c360btn light" id="closeVaga">Encerrar inscrições</button></div><label class="c360-field">Prazo final para inscrições (opcional)<input id="jobExpiry" type="datetime-local" value="'+(j.link_expires_at?new Date(new Date(j.link_expires_at).getTime()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16):'')+'"></label><button class="c360btn light" id="saveExpiry">Salvar prazo</button><h3>Candidatos desta vaga</h3>'+all.map(a=>{const c=people.find(x=>x.id===a.candidate_id)||{};return '<div class="c360-card"><b>'+safe(c.full_name)+'</b><div class="c360meta">'+safe([c.neighborhood,c.city].filter(Boolean).join(", "))+' • '+safe(statusLabel[a.status]||a.status)+'</div><div class="c360-status">'+safe(regionFlag(c,j))+'</div><button class="c360btn light" data-c360application="'+a.id+'">Abrir ficha / triagem</button></div>'}).join('')+(all.length?'':'<p>Nenhuma inscrição ainda.</p>'));
 $("sendVaga").disabled=j.status!=="open";
 $("copyVaga").disabled=j.status!=="open";
 $("closeVaga").disabled=j.status==="closed";
 $("sendVaga").onclick=()=>window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(msg(j)),"_blank","noopener");
 $("copyVaga").onclick=()=>copy(msg(j));
 $("saveExpiry").onclick=async()=>{
  const v=$("jobExpiry").value,iso=v?new Date(v).toISOString():null;
  const {error}=await db.from("jobs").update({link_expires_at:iso}).eq("id",j.id);
  if(error)alert(error.message);else{j.link_expires_at=iso;alert("Prazo de inscrição salvo.")}
 };
 $("closeVaga").onclick=async()=>{
  if(!confirm("Encerrar esta vaga? O link deixará de aceitar novas inscrições."))return;
  const {error}=await db.from("jobs").update({status:"closed"}).eq("id",j.id);
  if(error)alert(error.message);else{modal.close();await refresh();alert("Vaga encerrada.");}
 };
}
async function showApplicant(id){
 const a=apps.find(x=>x.id===id);if(!a)return;const c=people.find(x=>x.id===a.candidate_id)||{},j=jobs.find(x=>x.id===a.job_id)||{};
 const phone=String(c.whatsapp||"").replace(/\D/g,""),number=phone.length===10||phone.length===11?"55"+phone:phone;
 const birth=c.date_of_birth?new Date(c.date_of_birth+'T12:00:00'):null;
 const now=new Date();
 const age=birth?now.getFullYear()-birth.getFullYear()-Number(now.getMonth()<birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate())):null;
 const facts=[
  ['Vaga',[j.title,j.company_name].filter(Boolean).join(' · ')],
  ['Residência',[c.address,c.neighborhood,c.city].filter(Boolean).join(', ')],
  ['Idade declarada',age],['Gênero informado',({female:'Feminino',male:'Masculino',nonbinary:'Não binário',other:'Outro'})[c.gender]],
  ['Experiência na função',yesNo(a.has_experience??c.has_experience)],['Tempo de experiência',a.experience_duration??c.experience_duration],
  ['Experiências',c.experiences],['Já trabalhou na empresa',yesNo(a.worked_at_company??c.worked_at_company)],
  ['Disponibilidade',c.availability],['Conduções por trecho',a.transportation_count??c.transportation_count],
  ['Como chega à empresa',a.access_to_workplace??c.access_to_workplace],['Conduções e custo informados',c.transport_description??a.transport_description],
  ['Limite diário de VT',j.daily_transport_limit==null?null:Number(j.daily_transport_limit).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})],
  ['Fretado e observações',j.transport_notes]
 ];
 const fields=facts.map(([label,value])=>`<div><dt>${label}</dt><dd>${safe(value==null||value===''?'Não informado':value)}</dd></div>`).join('');
 open('Triagem · '+(c.full_name||'Candidato'),`
  <p class="c360-info"><strong>${safe(regionFlag(c,j))}</strong><br>Compare o endereço informado e o trajeto até a empresa no mapa.</p>
  <dl class="candidate-facts">${fields}</dl>
  <div class="c360-actions">
   ${c.city&&(j.address||j.city)?`<a class="c360btn light" target="_blank" rel="noopener noreferrer" href="${safe(route(c,j))}">Ver rota de transporte</a>`:''}
   ${/^\d{10,15}$/.test(number)?`<a class="c360btn light" target="_blank" rel="noopener noreferrer" href="https://wa.me/${number}">WhatsApp do candidato</a>`:''}
   ${a.resume_path?'<button id="downloadApp" class="c360btn light">Abrir currículo</button>':''}
  </div>
  <form id="c360Triagem">
   <label class="c360-field">Etapa<select name="status">${Object.entries(statusLabel).map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label>
   <label class="c360-field">Entrevista · data e horário<input name="interview_at" type="datetime-local" value="${localDate(a.interview_at)}"></label>
   <label class="c360-field">Anotações da entrevista<textarea name="interview_notes" maxlength="3000"></textarea></label>
   <label class="c360-field">Linhas, custo do trajeto e fretado<textarea name="transport_review_notes" maxlength="3000"></textarea></label>
   <label class="c360-field"><input style="width:auto" type="checkbox" name="route_verified"> Trajeto conferido pela equipe</label>
   <p><button class="c360btn">Salvar triagem</button></p>
  </form>`);
 const f=$('c360Triagem');
 f.elements.status.value=a.status;
 f.elements.interview_notes.value=a.interview_notes||'';
 f.elements.transport_review_notes.value=a.transport_review_notes||'';
 f.elements.route_verified.checked=!!a.route_verified;
 f.elements.status.onchange=()=>{f.elements.interview_at.required=f.elements.status.value==='interview';};
 f.elements.status.onchange();
 if(a.resume_path)$("downloadApp").onclick=async()=>{const {data,error}=await db.storage.from("curriculos-privados").createSignedUrl(a.resume_path,90);if(error)alert(error.message);else window.open(data.signedUrl,"_blank","noopener")};
 f.onsubmit=async ev=>{ev.preventDefault();const data=new FormData(f),payload={status:data.get("status"),interview_at:data.get("interview_at")?new Date(data.get("interview_at")).toISOString():null,interview_notes:data.get("interview_notes"),transport_review_notes:data.get("transport_review_notes"),route_verified:!!data.get("route_verified")};const r=await db.from("applications").update(payload).eq("id",a.id).select("id").single();if(r.error){alert(r.error.message);return}modal.close();await refresh();alert("Triagem atualizada.")};
}
document.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.c360share){e.stopImmediatePropagation();const j=jobs.find(x=>x.id===b.dataset.c360share);if(j)window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(msg(j)),"_blank","noopener")}
 if(b.dataset.c360copy){e.stopImmediatePropagation();const j=jobs.find(x=>x.id===b.dataset.c360copy);if(j)copy(msg(j))}
 if(b.dataset.c360application){e.stopImmediatePropagation();showApplicant(b.dataset.c360application)}
 if(b.dataset.job){e.stopImmediatePropagation();showJobs(b.dataset.job)}
},true);
