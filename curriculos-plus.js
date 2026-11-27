import { printRecord, printResume } from './impressao.js';

import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm";
const db=createClient("https://rqbmcnczfnfabsgiuvcs.supabase.co","sb_publishable_BrHgJVI8ooHwbV5rbqYVxg_6vRmOzjz");
const $=id=>document.getElementById(id);
const esc=t=>String(t??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm=t=>String(t??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const css=document.createElement("style");css.textContent=".c360-table{width:100%;border-collapse:collapse}.c360-table td,.c360-table th{text-align:left;padding:14px;border-bottom:1px solid #e5e8f2;font-size:13px}.c360-controls{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:8px;margin:15px 0}.c360-controls input,.c360-controls select,.c360-form input,.c360-form select{padding:12px;background:white;border:1px solid #d9dff0;border-radius:9px;width:100%}.c360btn{padding:10px 14px;background:#6852d8;border:0;color:white;border-radius:8px;cursor:pointer;font-weight:bold}.c360btn.alt{background:#efebff;color:#5643b5}.c360-modal{width:min(780px,96vw);max-height:90vh;overflow:auto;border:0;border-radius:15px;padding:25px;box-shadow:0 30px 80px #16153977}.c360-modal::backdrop{background:#0b1535aa}.c360-cards{display:flex;gap:10px;flex-wrap:wrap;margin:15px 0}.c360-cards>div{padding:13px;background:#f5f2ff;border-radius:12px;min-width:125px}.c360-cards b{display:block;font-size:22px;margin:8px 0}.c360-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.c360-form label{display:block;font-size:12px;font-weight:bold}.c360-form input,.c360-form select{margin-top:6px}.c360-muted{color:#8090a7;font-size:12px;line-height:1.7}.c360-import{padding:22px;border:2px dashed #c1b9ed;border-radius:12px;background:#fbfaff;margin:13px 0}.c360-import input{display:block;margin:15px 0}.c360-notice{padding:14px;background:#f4f2ff;color:#58439c;border-radius:9px;margin:15px 0}.c360-row-actions{display:flex;gap:8px;flex-wrap:wrap}@media(max-width:720px){.c360-controls,.c360-form{grid-template-columns:1fr}.c360-table{display:block;overflow:auto}}";document.head.append(css);
const modal=document.createElement("dialog");modal.className="c360-modal";modal.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between"><h2 id="c360RTitle">Currículos</h2><button class="c360btn alt" id="c360RClose" type="button"><span aria-hidden="true">←</span> Voltar</button></div><div id="c360RBody"></div>';document.body.append(modal);$("c360RClose").onclick=()=>modal.close();
function dialog(title,html){$("c360RTitle").textContent=title;$("c360RBody").innerHTML=html;modal.showModal()}
const regions=[
["Osasco","Zona Oeste"],["Carapicuíba","Zona Oeste"],["Jandira","Zona Oeste"],["Itapevi","Zona Oeste"],["Barueri","Zona Oeste"],["Cotia","Zona Oeste"],["Santana de Parnaíba","Grande SP"],["Cajamar","Grande SP"],["Caieiras","Grande SP"],["Franco da Rocha","Grande SP"],["Francisco Morato","Grande SP"],["Perus","Zona Norte"],["Brasilândia","Zona Norte"],["Freguesia do Ó","Zona Norte"],["Lapa","Zona Oeste"],["Vila dos Remédios","Zona Oeste"],["Barra Funda","Zona Oeste"],["Pompeia","Zona Oeste"],["Pirituba","Zona Norte"],["Jaraguá","Zona Norte"],["Casa Verde","Zona Norte"],["Santana","Zona Norte"],["Tucuruvi","Zona Norte"],["Vila Maria","Zona Norte"],["Vila Guilherme","Zona Norte"],["Limão","Zona Norte"],["Jardim Peri","Zona Norte"],["Tatuapé","Zona Leste"],["Itaquera","Zona Leste"],["São Mateus","Zona Leste"],["Penha","Zona Leste"],["Mooca","Zona Leste"],["Santo Amaro","Zona Sul"],["Capão Redondo","Zona Sul"],["Campo Limpo","Zona Sul"],["Grajaú","Zona Sul"],["Pinheiros","Zona Oeste"],["Butantã","Zona Oeste"],["Jaguaré","Zona Oeste"],["Morro Doce","Zona Norte"],["Morro Grande","Grande SP"],["Bom Retiro","Centro"],["Bela Vista","Centro"],["Jardins","Zona Oeste"]
];
const professions=["Auxiliar de logística","Auxiliar de produção","Auxiliar de operações","Auxiliar administrativo","Assistente administrativo","Analista administrativo","Operador de empilhadeira","Conferente","Separador","Estoquista","Almoxarife","Repositor","Motorista","Ajudante geral","Auxiliar de limpeza","Auxiliar de serviços gerais","Auxiliar de manutenção","Técnico de manutenção","Eletricista","Mecânico","Recepcionista","Atendente","Vendedor","Operador de caixa","Auxiliar de RH","Analista de RH","Recrutador","Auxiliar de cozinha","Cozinheiro","Porteiro","Vigilante","Soldador","Pedreiro","Jardineiro","Operador de máquina","Montador","Costureira","Supervisor","Gerente","Telemarketing","Operador de produção"];
function classify(text){const t=norm(text);const found=regions.filter(([place])=>t.includes(norm(place))).sort((a,b)=>b[0].length-a[0].length);
 const roles=professions.filter(p=>t.includes(norm(p)));
 return {city:found[0]?.[0]||"Não identificada",neighborhood:found[1]?.[0]||"",zone:found[0]?.[1]||"Não identificada",professions:roles,main_profession:roles[0]||"Não identificada"};
}
let files=[],rows=[],uid=null;const view=$("resumesView");if(!view)throw Error("Não foi possível encontrar a área de currículos");
const shell=view.querySelector(".panel");const prior=shell.innerHTML;
shell.innerHTML='<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3>Banco de currículos</h3><p class="c360-muted">Organize e busque profissionais por região, profissão, faixa etária e gênero informado.</p></div><button id="c360Import" class="c360btn">＋ Importar currículos</button></div><div class="c360-cards"><div>Currículos<b id="c360Total">0</b></div><div>Regiões<b id="c360Cities">0</b></div><div>Aguardam revisão<b id="c360Reviews">0</b></div></div><div class="c360-controls"><input id="c360Search" placeholder="Pesquisar nome, região ou profissão"><select id="c360City"><option value="">Todas as regiões</option></select><select id="c360Job"><option value="">Todas as profissões</option></select><select id="c360Gender"><option value="">Todos os gêneros</option><option value="female">Feminino</option><option value="male">Masculino</option><option value="nonbinary">Não binário</option><option value="other">Outro</option></select><select id="c360Age"><option value="">Todas as idades</option><option value="18-25">18 a 25</option><option value="26-35">26 a 35</option><option value="36-45">36 a 45</option><option value="46-99">46+</option></select></div><div id="c360List"></div><p class="c360-muted">Cidades e profissões são sugestões automáticas editáveis. A data de nascimento e o gênero não são deduzidos do currículo. Confirme antes de usar qualquer informação.</p>';
const other=document.createElement("div");other.className="panel";other.innerHTML='<h3>Inscritos nas vagas</h3>'+prior;view.append(other);
function age(birth){if(!birth)return null;const d=new Date(birth+"T12:00:00");return Number.isFinite(d.getTime())?Math.floor((Date.now()-d.getTime())/31557600000):null}
function genderName(g){return ({female:"Feminino",male:"Masculino",nonbinary:"Não binário",other:"Outro",prefer_not_to_say:"Prefere não informar"})[g]||"Não informado"}
async function refresh(){
 const u=await db.auth.getUser();if(!u.data.user)return;uid=u.data.user.id;
 const {data,error}=await db.from("resume_records").select("*").is("deleted_at",null).order("created_at",{ascending:false}).limit(1500);
 if(error){$("c360List").textContent="Erro ao consultar currículos: "+error.message;return}rows=data||[];
 $("c360Total").textContent=rows.length;$("c360Cities").textContent=new Set(rows.map(x=>x.city).filter(x=>x&&x!=="Não identificada")).size;
 $("c360Reviews").textContent=rows.filter(x=>x.status==="review").length;
 for(const [id,options,key] of [["c360City",[...new Set(rows.map(x=>x.city))].filter(Boolean),"cidade"],["c360Job",[...new Set(rows.flatMap(x=>x.professions||[]))].filter(Boolean),"profissão"]]){
 const el=$(id),v=el.value;el.innerHTML='<option value="">Todas as '+(key==="cidade"?"regiões":"profissões")+'</option>'+options.sort().map(x=>'<option>'+esc(x)+'</option>').join("");el.value=v;
 }
 render();
}
function render(){
 const q=norm($("c360Search").value),city=$("c360City").value,job=$("c360Job").value,gender=$("c360Gender").value,range=$("c360Age").value;
 const filtered=rows.filter(r=>{
 const a=age(r.birth_date);return (!q||norm([r.full_name,r.city,r.neighborhood,r.main_profession,(r.professions||[]).join(" "),r.extracted_text].join(" ")).includes(q))
 &&(!city||r.city===city)&&(!job||(r.professions||[]).includes(job))&&(!gender||r.gender===gender)
 &&(!range||(a!==null&&a>=Number(range.split("-")[0])&&a<=Number(range.split("-")[1])));
 });
 $("c360List").innerHTML='<p class="c360-muted">'+filtered.length+' currículos encontrados</p><div style="overflow:auto"><table class="c360-table"><thead><tr><th>Nome / arquivo</th><th>Região</th><th>Profissão</th><th>Idade</th><th>Gênero</th><th></th></tr></thead><tbody>'+filtered.slice(0,400).map(r=>'<tr><td><b>'+esc(r.full_name||r.source_name)+'</b><br><small>'+esc(r.source_name)+'</small></td><td>'+esc(r.city)+'<br><small>'+esc(r.neighborhood)+'</small></td><td>'+esc(r.main_profession)+'</td><td>'+esc(age(r.birth_date)??"—")+'</td><td>'+esc(genderName(r.gender))+'</td><td><button class="c360btn alt" data-openresume="'+r.id+'">Abrir</button></td></tr>').join("")+'</tbody></table></div>';
}
["c360Search","c360City","c360Job","c360Gender","c360Age"].forEach(id=>$(id).addEventListener(id==="c360Search"?"input":"change",render));
async function readDocument(file){
 const name=file.name.toLowerCase();
 if(name.endsWith(".pdf")){
  const m=await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs");
  m.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
  const pdf=await m.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
  let text="";for(let p=1;p<=Math.min(pdf.numPages,10);p++){const page=await pdf.getPage(p),obj=await page.getTextContent();text+=" "+obj.items.map(x=>x.str||"").join(" ")}
  return text.slice(0,30000);
 }
 if(name.endsWith(".docx")){
  const m=await import("https://esm.sh/mammoth@1.9.0");
  return (await m.extractRawText({arrayBuffer:await file.arrayBuffer()})).value.slice(0,30000);
 }
 return "";
}
function openImport(){
 dialog("Importar currículos",'<div class="c360-import"><b>Selecione os arquivos baixados do WhatsApp</b><p class="c360-muted">PDF ou DOCX, máximo 3 MB cada. Você pode selecionar vários arquivos ao mesmo tempo.</p><input type="file" id="c360Files" accept=".pdf,.docx" multiple><button id="c360Start" class="c360btn">Importar para o banco de currículos</button><p id="c360Progress" role="status"></p></div><div class="c360-notice">Classificaremos automaticamente as profissões e as referências de regiões quando elas estiverem no texto. PDFs escaneados e endereços ambíguos precisam de revisão.</div>');
 $("c360Start").onclick=importFiles;
}
async function importFiles(){
 const selected=[...$("c360Files").files],button=$("c360Start"),status=$("c360Progress");if(!selected.length)return;
 button.disabled=true;let count=0;
 for(const file of selected){
  status.textContent="Processando "+file.name+" — "+(count+1)+"/"+selected.length;
  try{
   if(file.size>3145728||!/\.(pdf|docx)$/i.test(file.name))throw Error("Arquivo precisa ser PDF/DOCX de até 3 MB");
   const buff=await file.arrayBuffer();
   const digest=await crypto.subtle.digest("SHA-256",buff),hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
   if(rows.some(r=>r.file_hash===hash)){count++;continue}
   let text="",reason="";
   try{text=await readDocument(file)}catch(e){reason="Não foi possível ler o texto automaticamente"}
   const classified=classify(text),ext=file.name.toLowerCase().endsWith(".pdf")?"pdf":"docx";
   const path="manual/"+crypto.randomUUID()+"."+ext;
   const upload=await db.storage.from("curriculos-privados").upload(path,file,{upsert:false,contentType:ext==="pdf"?"application/pdf":"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
   if(upload.error)throw Error(upload.error.message);
   const record={source_name:file.name,storage_path:path,file_hash:hash,created_by:uid,full_name:file.name.replace(/\.(pdf|docx)$/i,"").replace(/[-_]/g," ").trim().slice(0,130),extracted_text:text,...classified,status:classified.city==="Não identificada"||classified.main_profession==="Não identificada"?"review":"new",extraction_note:reason||"Classificação automática sujeita a revisão"};
   const save=await db.from("resume_records").insert(record);
   if(save.error){await db.storage.from("curriculos-privados").remove([path]);throw Error(save.error.message)}
   count++;
  }catch(e){status.textContent="Falha em "+file.name+": "+(e?.message||e);button.disabled=false;await refresh();return}
 }
 status.textContent="✓ "+count+" currículos processados. Confira os filtros e os registros que exigem revisão.";button.disabled=false;await refresh();
}
async function openResume(id){
 const r=rows.find(r=>r.id===id);if(!r)return;
 dialog("Ficha do currículo",'<p class="c360-muted">Arquivo original: '+esc(r.source_name)+'</p><form id="c360Edit" class="c360-form"><label>Nome<input name="full_name" value="'+esc(r.full_name)+'"></label><label>Região / cidade<input name="city" value="'+esc(r.city)+'"></label><label>Bairro<input name="neighborhood" value="'+esc(r.neighborhood)+'"></label><label>Zona<input name="zone" value="'+esc(r.zone)+'"></label><label>Profissão principal<input name="main_profession" value="'+esc(r.main_profession)+'"></label><label>Outras profissões (separadas por vírgula)<input name="professions" value="'+esc((r.professions||[]).join(", "))+'"></label><label>Data de nascimento (opcional)<input type="date" name="birth_date" value="'+esc(r.birth_date)+'"></label><label>Gênero autodeclarado<select name="gender"><option value="">Não informado</option><option value="female">Feminino</option><option value="male">Masculino</option><option value="nonbinary">Não binário</option><option value="other">Outro</option><option value="prefer_not_to_say">Prefere não informar</option></select></label><label>Telefone<input name="phone" value="'+esc(r.phone)+'"></label><label>Status<select name="status"><option value="new">Arquivado</option><option value="review">Revisar</option><option value="contacted">Contato feito</option></select></label><div class="c360-row-actions" style="grid-column:1/-1"><button type="submit" class="c360btn">Salvar correções</button><button type="button" id="c360Download" class="c360btn alt">Abrir arquivo original</button><button type="button" id="printResumeRecord" class="c360btn alt">Imprimir ficha</button><button type="button" id="printOriginalResume" class="c360btn alt">Imprimir currículo</button></div></form>');
 const f=$("c360Edit");f.elements.gender.value=r.gender||"";f.elements.status.value=r.status==="review"?"review":r.status==="contacted"?"contacted":"new";
 f.onsubmit=async e=>{e.preventDefault();const data=new FormData(f),upd={full_name:data.get("full_name"),city:data.get("city"),neighborhood:data.get("neighborhood"),zone:data.get("zone"),main_profession:data.get("main_profession"),professions:String(data.get("professions")||"").split(",").map(s=>s.trim()).filter(Boolean),birth_date:data.get("birth_date")||null,gender:data.get("gender")||null,phone:data.get("phone"),status:data.get("status")};const {error}=await db.from("resume_records").update(upd).eq("id",id);if(error){alert(error.message);return}modal.close();await refresh()};
 $('printResumeRecord').onclick=()=>printRecord('Ficha do currículo · '+(r.full_name||r.source_name),[
  ['Nome',r.full_name],['Telefone',r.phone],['E-mail',r.email],
  ['Cidade',r.city],['Bairro',r.neighborhood],['Zona',r.zone],
  ['Profissão principal',r.main_profession],['Outras profissões',(r.professions||[]).join(', ')],
  ['Idade',age(r.birth_date)],['Gênero informado',genderName(r.gender)],['Experiência',r.experience_text],
  ['Arquivo original',r.source_name]
 ]);
 $('printOriginalResume').disabled=!r.storage_path;
 $('printOriginalResume').onclick=()=>printResume(db,r.storage_path);
 $("c360Download").onclick=async()=>{const {data,error}=await db.storage.from("curriculos-privados").createSignedUrl(r.storage_path,75);if(error)alert(error.message);else window.open(data.signedUrl,"_blank","noopener,noreferrer")};
}
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.openresume)openResume(b.dataset.openresume);},true);
$("c360Import").onclick=openImport;
$("topImport").addEventListener("click",e=>{e.stopImmediatePropagation();openImport()},true);
const teamPanel=$("teamView").querySelector(".panel");
const teamActions=document.createElement("div");teamPanel.append(teamActions);
async function refreshTeam(){
 const u=await db.auth.getUser();if(!u.data.user)return;
 const {data:own}=await db.from("recruiters").select("role,enabled").eq("user_id",u.data.user.id).maybeSingle();
 if(own?.role!=="admin"||!own.enabled)return;
 const firstDay=new Date();
 firstDay.setDate(firstDay.getDate()-30);
 const {data:team,error}=await db.from("recruiters").select("user_id,full_name,role,enabled").order("created_at",{ascending:false});
 if(error)return;
 const totals=new Map();
 let activityAvailable=true;
 for(let offset=0;;offset+=500){
  const activity=await db.from("activity_log").select("actor_user_id,action,record_id").eq("record_type","application").in("action",["interview_scheduled","interview_completed","candidate_hired"]).gte("created_at",firstDay.toISOString()).order("id").range(offset,offset+499);
  if(activity.error){activityAvailable=false;break;}
  for(const row of activity.data){
   const key=row.actor_user_id+":"+row.action;
   if(!totals.has(key))totals.set(key,new Set());
   totals.get(key).add(row.record_id);
  }
  if(activity.data.length<500)break;
 }
 const count=(member,action)=>totals.get(member.user_id+":"+action)?.size||0;
 $("teamList").classList.add("hidden");
 teamActions.innerHTML=`<h3>Controle dos recrutadores</h3><p class="c360-muted">${activityAvailable?"Atividade registrada nos últimos 30 dias":"Não foi possível consultar a atividade da equipe."}</p>`+team.map(member=>`
  <div class="job-row">
   <div><strong>${esc(member.full_name)}</strong><small>${member.role==="admin"?"Administrador":"Recrutador"} · ${member.enabled?"Ativo":"Acesso pendente"}</small>
   ${activityAvailable?`<small> · ${count(member,"interview_scheduled")} agendadas · ${count(member,"interview_completed")} realizadas · ${count(member,"candidate_hired")} contratações</small>`:""}</div>
   ${member.user_id!==u.data.user.id?`<button class="c360btn alt" data-team="${esc(member.user_id)}" data-enable="${!member.enabled}">${member.enabled?"Desativar":"Autorizar"}</button>`:""}
  </div>`).join("");
}
teamActions.onclick=async e=>{
 const b=e.target.closest("[data-team]");if(!b)return;const enable=b.dataset.enable==="true";
 if(!confirm(enable?"Autorizar este recrutador a ver currículos e candidaturas?":"Desativar este acesso?"))return;
 const {error}=await db.from("recruiters").update({enabled:enable}).eq("user_id",b.dataset.team).select("user_id").single();if(error)alert(error.message);else refreshTeam();
};
setInterval(()=>{if(!document.hidden){refresh();refreshTeam()}},30000);
document.querySelector('[data-view="team"]').addEventListener("click",refreshTeam);
setTimeout(()=>{refresh();refreshTeam()},1500);
