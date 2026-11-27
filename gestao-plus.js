
import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm";
const db=createClient("https://rqbmcnczfnfabsgiuvcs.supabase.co","sb_publishable_BrHgJVI8ooHwbV5rbqYVxg_6vRmOzjz");
const esc=t=>String(t??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=v=>v?new Date(new Date(v).getTime()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16):"";
const dialog=document.createElement("dialog");dialog.style.cssText="width:min(780px,95vw);max-height:90vh;overflow:auto;border:0;border-radius:16px;padding:25px;box-shadow:0 20px 80px #08142b66";dialog.innerHTML='<div style="display:flex;justify-content:space-between"><h2 id="mgTitle"></h2><button id="mgClose">Fechar</button></div><div id="mgBody"></div>';document.body.append(dialog);
document.getElementById("mgClose").onclick=()=>dialog.close();
const body=()=>document.getElementById("mgBody");
const field=(label,key,val="",type="text")=>'<label style="display:block;font-weight:700;margin:13px 0">'+esc(label)+'<input style="display:block;width:100%;padding:12px;border:1px solid #d9ddec;border-radius:9px;margin-top:5px" name="'+key+'" type="'+type+'"'+(type==='number'?' min="0" step="0.01"':'')+' value="'+esc(val)+'"></label>';
const longFields=new Set(['requirements','description','benefits_description','transport_notes']);
function jobField(label,key,value){
 if(longFields.has(key))return '<label class="c360-field span-all">'+esc(label)+'<textarea name="'+key+'">'+esc(value)+'</textarea></label>';
 return field(label,key,value);
}
function show(title,html){document.getElementById("mgTitle").textContent=title;body().innerHTML=html;dialog.showModal()}
async function editJob(id){
 const {data:j,error}=await db.from("jobs").select("*").eq("id",id).single();if(error){alert(error.message);return}
 const keys=[["Cargo","title"],["Código","job_code"],["Empresa","company_name"],["Cidade","city"],["Bairro","neighborhood"],["Endereço","address"],["Salário","salary_description"],["Horários","schedule_description"],["Escala","work_scale"],["Requisitos","requirements"],["Descrição","description"],["Benefícios","benefits_description"],["Transporte / fretado","transport_notes"],["WhatsApp da vaga","contact_whatsapp"],["Turnos separados por vírgulas","shift_options"],["Regiões atendidas, separadas por vírgulas","accepted_regions"]];
 let html='<form id="mgJobForm">'+keys.map(([label,key])=>jobField(label,key,(key==="accepted_regions"||key==="shift_options")?(j[key]||[]).join(", "):j[key]||"")).join("")+
 field("Bônus assiduidade (R$)","attendance_bonus",j.attendance_bonus||"","number")+field("Vale-alimentação (R$)","meal_allowance",j.meal_allowance||"","number")+field("Limite de VT por dia (R$)","daily_transport_limit",j.daily_transport_limit||"","number")+field("Início previsto","starts_on",j.starts_on||"","date")+
 '<label>Status<select name="status" style="display:block;padding:12px;width:100%"><option value="draft">Rascunho</option><option value="open">Aberta</option><option value="closed">Encerrada</option></select></label><p><button class="mgButton">Salvar alterações da vaga</button></p></form>';
 show("Editar vaga",html);const form=document.getElementById("mgJobForm");form.elements.status.value=j.status;
 form.onsubmit=async e=>{e.preventDefault();const data=new FormData(form);const vals=Object.fromEntries(data.entries());for(const k of ["attendance_bonus","meal_allowance","daily_transport_limit"])vals[k]=vals[k]===""?null:Number(vals[k]);vals.starts_on=vals.starts_on||null;vals.accepted_regions=vals.accepted_regions.split(",").map(x=>x.trim()).filter(Boolean);vals.shift_options=vals.shift_options.split(",").map(x=>x.trim()).filter(Boolean);const r=await db.from("jobs").update(vals).eq("id",id).select("id").single();if(r.error){alert(r.error.message);return}dialog.close();document.dispatchEvent(new Event("c360-refresh"))};
}
async function editApplication(id){
 const {data:a,error}=await db.from("applications").select("*").eq("id",id).single();if(error){alert(error.message);return}
 const c=await db.from("candidates").select("*").eq("id",a.candidate_id).single();if(c.error){alert(c.error.message);return}
 const s=[["new","Novo"],["screening","Em triagem"],["contacted","Contato feito"],["interview","Entrevista agendada"],["interviewed","Entrevistado"],["hired","Contratado"],["rejected","Não selecionado"]];
 let html='<form id="mgAppForm"><h3>Dados do candidato</h3>'+field("Nome","full_name",c.data.full_name)+field("WhatsApp","whatsapp",c.data.whatsapp)+field("Cidade","city",c.data.city)+field("Bairro","neighborhood",c.data.neighborhood)+field("Endereço","address",c.data.address)+field("Experiências","experiences",c.data.experiences||"")+
 '<h3>Etapas de recrutamento</h3><label>Etapa<select name="status" style="display:block;padding:12px;width:100%">'+s.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join("")+'</select></label>'+
 field("Entrevista — data e horário","interview_at",fmt(a.interview_at),"datetime-local")+
 field("Integração — data e horário","onboarding_at",fmt(a.onboarding_at),"datetime-local")+
 field("Início no trabalho","employment_start_date",a.employment_start_date||"","date")+
 field("Empresa contratante","hiring_company",a.hiring_company||"")+
 field("Recrutadora / entrevistadora","interviewer_name",a.interviewer_name||"")+
 '<label style="display:block;margin:12px 0">Observações da entrevista<textarea name="interview_notes" style="width:100%;padding:12px;border:1px solid #dce0ed;border-radius:10px">'+esc(a.interview_notes||"")+'</textarea></label><button class="mgButton">Salvar ficha completa</button></form>';
 show("Editar candidatura",html);
 const form=document.getElementById("mgAppForm");form.elements.status.value=a.status;
 form.onsubmit=async e=>{e.preventDefault();const f=new FormData(form);
  const cd={full_name:f.get("full_name"),whatsapp:f.get("whatsapp"),city:f.get("city"),neighborhood:f.get("neighborhood"),address:f.get("address")||null,experiences:f.get("experiences")};
  const ad={status:f.get("status"),interview_at:f.get("interview_at")?new Date(f.get("interview_at")).toISOString():null,onboarding_at:f.get("onboarding_at")?new Date(f.get("onboarding_at")).toISOString():null,employment_start_date:f.get("employment_start_date")||null,hiring_company:f.get("hiring_company"),interviewer_name:f.get("interviewer_name"),interview_notes:f.get("interview_notes"),updated_at:new Date().toISOString()};
  const rc=await db.from("candidates").update(cd).eq("id",a.candidate_id).select("id").single();if(rc.error){alert(rc.error.message);return}
  const ra=await db.from("applications").update(ad).eq("id",id).select("id").single();if(ra.error){alert(ra.error.message);return}
  dialog.close();document.getElementById("c360Close")?.click();document.dispatchEvent(new Event("c360-refresh"))
 };
}
const css=document.createElement("style");css.textContent=".mgButton{background:#6852da;color:white;border:0;border-radius:9px;padding:12px 18px;cursor:pointer;font-weight:700}.mgSmall{margin:5px;background:#eeeaff;color:#5542ad;border:0;border-radius:7px;padding:9px 12px;cursor:pointer}";document.head.append(css);
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-editjob]');
 if(button)editJob(button.dataset.editjob);
});
window.addEventListener("click",event=>{
 const id=event.target.closest("[data-c360application]")?.dataset.c360application;
 if(!id)return;
 setTimeout(()=>{
  const container=document.getElementById("c360Body");
  if(!container||!document.getElementById("c360Triagem"))return;
  if(container.querySelector("[data-full-edit]"))return;
  const b=document.createElement("button");b.className="mgButton";b.textContent="Editar ficha completa / entrevista / contratação";b.dataset.fullEdit=id;
  b.onclick=()=>editApplication(id);container.prepend(b);
 },100);
},true);
