import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm";
const db=createClient("https://rqbmcnczfnfabsgiuvcs.supabase.co","sb_publishable_BrHgJVI8ooHwbV5rbqYVxg_6vRmOzjz");
const btn=document.createElement("button");btn.textContent="Lixeira";btn.className="c360btn alt";
const importer=document.getElementById("c360Import");importer?.insertAdjacentElement("afterend",btn);
btn.onclick=async()=>{
 const {data,error}=await db.from("resume_records").select("id,source_name,deleted_at").not("deleted_at","is",null).order("deleted_at",{ascending:false});
 if(error){alert(error.message);return}
 const d=document.createElement("dialog");d.style.cssText="padding:25px;border:0;border-radius:12px;min-width:350px";
 d.innerHTML='<h2>Lixeira de currículos</h2><p>'+data.length+' currículos arquivados</p>'+data.map(r=>'<p><span>'+r.source_name.replace(/[<>]/g,"")+'</span> <button data-restore="'+r.id+'">Restaurar</button></p>').join("")+'<button id="closeTrash">Fechar</button>';
 document.body.append(d);d.showModal();d.querySelector("#closeTrash").onclick=()=>{d.close();d.remove()};
 d.onclick=async e=>{const id=e.target.dataset?.restore;if(!id)return;const r=await db.from("resume_records").update({deleted_at:null,deleted_by:null,deletion_reason:null}).eq("id",id);if(r.error)alert(r.error.message);else{d.close();d.remove();location.reload()}};
};

document.addEventListener("click",e=>{
 const b=e.target.closest("button[data-openresume]");if(!b)return;
 const id=b.dataset.openresume;
 setTimeout(()=>{
  const form=document.getElementById("c360Edit");if(!form||document.getElementById("moveToTrash"))return;
  const t=document.createElement("button");t.id="moveToTrash";t.type="button";t.className="c360btn alt";t.textContent="Mover para lixeira";t.style.margin="12px";form.append(t);
  t.onclick=async()=>{
   if(!confirm("Mover este currículo para a lixeira?"))return;
   const user=await db.auth.getUser();if(!user.data.user)return;
   const {error}=await db.from("resume_records").update({deleted_at:new Date().toISOString(),deleted_by:user.data.user.id,deletion_reason:"Movido para lixeira"}).eq("id",id);
   if(error)alert(error.message);else{alert("Currículo movido para a lixeira");location.reload()}
  };
 },100);
},true);
