import {createClient} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm";
const db=createClient("https://rqbmcnczfnfabsgiuvcs.supabase.co","sb_publishable_BrHgJVI8ooHwbV5rbqYVxg_6vRmOzjz");
const btn=document.createElement("button");btn.textContent="Lixeira";btn.className="c360btn alt";
const importer=document.getElementById("c360Import");importer?.insertAdjacentElement("afterend",btn);
btn.onclick=async()=>{const {data,error}=await db.from("resume_records").select("id,source_name,deleted_at").not("deleted_at","is",null);if(error){alert(error.message);return}alert("Currículos na lixeira: "+data.length)};
