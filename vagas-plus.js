
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
async function copy(t){try{await navigator.clipboard.writeText(t);alert("Link copiado. Cole no grupo do WhatsApp!")}catch{prompt("Copie:",t)}}
let jobs=[],apps=[],people=[],user=null;
async function refresh(){
 const auth=await db.auth.getUser();if(!auth.data.user)return;user=auth.data.user;
 const [j,a,c]=await Promise.all(["jobs","applications","candidates"].map(x=>db.from(x).select("*").limit(500)));
 if(j.error||a.error||c.error)return;jobs=j.data;apps=a.data;people=c.data;
 document.querySelectorAll("[data-job]").forEach(b=>{
  const row=b.closest(".job-row");if(!row||row.dataset.c360enhanced)return;row.dataset.c360enhanced="1";
  const j=jobs.find(j=>j.id===b.dataset.job);if(!j)return;
  const div=document.createElement("div");div.className="c360-actions";
  div.innerHTML='<button class="c360btn light" data-c360share="'+j.id+'">WhatsApp</button><button class="c360btn light" data-c360copy="'+j.id+'">Copiar link</button>';
  row.append(div);
 });
}
function route(c,j){const origin=[c.neighborhood,c.city,"SP Brasil"].filter(Boolean).join(", "),destination=[j.address,j.neighborhood,j.city,"SP Brasil"].filter(Boolean).join(", ");return "https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(origin)+"&destination="+encodeURIComponent(destination)+"&travelmode=transit";}
function regionFlag(c,j){const r=(j.accepted_regions||[]).filter(Boolean);if(!r.length)return "Regiões não informadas — verificar";const str=[c.city,c.neighborhood].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();return r.some(x=>str.includes(String(x).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()))?"Região informada como atendida":"Fora das regiões informadas — conferir";}
function showJobs(id){
 const j=jobs.find(j=>j.id===id);if(!j)return;
 const all=apps.filter(a=>a.job_id===id).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
 open("Candidaturas — "+j.title,'<p class="c360meta">'+safe(j.city||"")+' • '+all.length+' inscrição(ões)</p><div class="c360-info">Um link pode ser encaminhado por outras pessoas. Use prazo de inscrição e encerre a vaga quando quiser bloquear novas candidaturas.</div><div class="c360-actions"><button class="c360btn" id="sendVaga">Divulgar no WhatsApp</button><button class="c360btn light" id="copyVaga">Copiar link</button><button class="c360btn light" id="closeVaga">Encerrar inscrições</button></div><label class="c360-field">Prazo final para inscrições (opcional)<input id="jobExpiry" type="datetime-local" value="'+(j.link_expires_at?new Date(new Date(j.link_expires_at).getTime()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16):'')+'"></label><button class="c360btn light" id="saveExpiry">Salvar prazo</button><h3>Candidatos desta vaga</h3>'+all.map(a=>{const c=people.find(x=>x.id===a.candidate_id)||{};return '<div class="c360-card"><b>'+safe(c.full_name)+'</b><div class="c360meta">'+safe([c.neighborhood,c.city].filter(Boolean).join(", "))+' • '+safe(a.status)+'</div><div class="c360-status">'+safe(regionFlag(c,j))+'</div><button class="c360btn light" data-c360application="'+a.id+'">Abrir ficha / triagem</button></div>'}).join('')+(all.length?'':'<p>Nenhuma inscrição ainda.</p>'));
 $("sendVaga").onclick=()=>window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(msg(j)),"_blank","noopener");
 $("copyVaga").onclick=()=>copy(link(j));
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
 const age=c.date_of_birth?Math.floor((Date.now()-new Date(c.date_of_birth).getTime())/31557600000):"Não informada";
 open("Triagem — "+c.full_name,'<p class="c360-info">'+safe(regionFlag(c,j))+'<br>É apenas uma comparação de regiões, não uma rota de transporte confirmada.</p><p><b>Vaga:</b> '+safe(j.title)+'<br><b>Residência:</b> '+safe([c.neighborhood,c.city].join(", "))+'<br><b>Idade informada:</b> '+safe(age)+'<br><b>Experiências:</b> '+safe(c.experiences)+'<br><b>Disponibilidade:</b> '+safe(c.availability)+'<br><b>Transporte informado:</b> '+safe(c.transport_description)+'<br><b>Limite de VT informado pela empresa:</b> '+safe(j.daily_transport_limit||"Não informado")+'<br><b>Fretado:</b> '+safe(j.transport_notes||"Não informado")+'</p><div class="c360-actions"><a class="c360btn light" target="_blank" rel="noopener" href="'+safe(route(c,j))+'">Ver ônibus no Google Maps</a>'+(number?'<a class="c360btn light" target="_blank" rel="noopener" href="https://wa.me/'+number+'">WhatsApp do candidato</a>':'')+(a.resume_path?'<button id="downloadApp" class="c360btn light">Abrir currículo</button>':'')+'</div><form id="c360Triagem"><label class="c360-field">Etapa<select name="status"><option value="new">Nova inscrição</option><option value="screening">Em triagem</option><option value="contacted">Contato realizado</option><option value="interview">Entrevista</option><option value="hired">Contratado</option><option value="rejected">Não selecionado</option></select></label><label class="c360-field">Anotações da entrevista<textarea name="interview_notes" maxlength="3000"></textarea></label><label class="c360-field">Custo, linhas, trajeto, fretado e conferência<textarea name="transport_review_notes" maxlength="3000"></textarea></label><label class="c360-field"><input style="width:auto" type="checkbox" name="route_verified"> Conferi o transporte e o trajeto com dados reais</label><button class="c360btn" style="margin-top:20px">Salvar triagem</button></form>');
 const f=$("c360Triagem");f.elements.status.value=a.status;f.elements.interview_notes.value=a.interview_notes||"";f.elements.transport_review_notes.value=a.transport_review_notes||"";f.elements.route_verified.checked=!!a.route_verified;
 if(a.resume_path)$("downloadApp").onclick=async()=>{const {data,error}=await db.storage.from("curriculos-privados").createSignedUrl(a.resume_path,90);if(error)alert(error.message);else window.open(data.signedUrl,"_blank","noopener")};
 f.onsubmit=async ev=>{ev.preventDefault();const data=new FormData(f),payload={status:data.get("status"),interview_notes:data.get("interview_notes"),transport_review_notes:data.get("transport_review_notes"),route_verified:!!data.get("route_verified")};const r=await db.from("applications").update(payload).eq("id",a.id);if(r.error){alert(r.error.message);return}modal.close();await refresh();alert("Triagem atualizada.")};
}
document.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.c360share){e.stopImmediatePropagation();const j=jobs.find(x=>x.id===b.dataset.c360share);if(j)window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(msg(j)),"_blank","noopener")}
 if(b.dataset.c360copy){e.stopImmediatePropagation();const j=jobs.find(x=>x.id===b.dataset.c360copy);if(j)copy(link(j))}
 if(b.dataset.c360application){e.stopImmediatePropagation();showApplicant(b.dataset.c360application)}
 if(b.dataset.job){e.stopImmediatePropagation();showJobs(b.dataset.job)}
},true);
const jobsRoot=document.getElementById('jobsList');if(jobsRoot){new MutationObserver(()=>{if(!document.hidden)refresh()}).observe(jobsRoot,{childList:true})};setInterval(()=>{if(!document.hidden)refresh()},15000);setTimeout(refresh,1200);
