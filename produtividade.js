const categories = {
  screening_started: 'Triagens iniciadas',
  job_created: 'Vagas cadastradas',
  candidate_contacted: 'Contatos realizados',
  interview_scheduled: 'Entrevistas agendadas',
  interview_completed: 'Entrevistas realizadas',
  candidate_rejected: 'Reprovações',
  candidate_hired: 'Contratações'
};
const actions = Object.keys(categories);
const dayFormat = new Intl.DateTimeFormat('fr-CA', {timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'});
const timeFormat = new Intl.DateTimeFormat('pt-BR', {timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'});
const today = () => dayFormat.format(new Date());
const percent = new Intl.NumberFormat('pt-BR', {style:'percent',maximumFractionDigits:1});
const esc = value => String(value??'').replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function summarizeActivity(events, team) {
  const members=new Map(team.map(member=>[member.user_id,{...member,total:0,counts:{},events:[]}]));
  const seen=new Set();
  let total=0;
  for(const event of events){
    const person=members.get(event.actor_user_id);
    if(!person||!Object.hasOwn(categories,event.action))continue;
    const key=JSON.stringify([event.actor_user_id,event.action,event.record_id]);
    if(seen.has(key))continue;
    seen.add(key);
    person.counts[event.action]=(person.counts[event.action]||0)+1;
    person.events.push(event);
    person.total++;
    total++;
  }
  return {members,total};
}

export function setupProductivity(db,openPanel) {
  const $=id=>document.getElementById(id);
  const panel=$('productivityPanel'), shortcut=$('productivityShortcut'), date=$('productivityDate');
  const preview=$('productivityPreview'), roster=$('productivityRoster'), detail=$('productivityDetail'), status=$('productivityStatus');
  let admin=null,channel=null,timer=null,pending=null,request=0,memberId=null,latest=null;
  let followsToday=true;
  function stop(){
    request++;
    admin=null;
    latest=null;
    memberId=null;
    panel.hidden=true;
    shortcut.hidden=true;
    preview.hidden=true;
    preview.replaceChildren();
    roster.replaceChildren();
    detail.replaceChildren();
    $('productivityBrief').textContent='';
    clearInterval(timer);
    clearTimeout(pending);
    if(channel){db.removeChannel(channel);channel=null;}
  }
  function showDetail(){
    const member=latest?.members.get(memberId);
    if(!member){detail.replaceChildren();return;}
    const metrics=actions.map(action=>`<div><dt>${categories[action]}</dt><dd>${member.counts[action]||0}</dd></div>`).join('');
    const recent=member.events.slice(0,20).map(event=>`<li>${timeFormat.format(new Date(event.created_at))} · ${categories[event.action]}</li>`).join('');
    detail.innerHTML=`<h3>${esc(member.full_name)}</h3><dl class="productivity-metrics">${metrics}</dl>`+
      (recent?`<h4>Até 20 ações recentes do dia</h4><ul>${recent}</ul>`:'<p class="muted">Nenhuma atividade registrada nessa data.</p>');
    roster.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.member===memberId)));
  }
  async function refresh(){
    if(!admin)return;
    if(followsToday)date.value=today();
    const selected=date.value;
    if(!selected)return;
    const generation=++request;
    try{
      const access=await db.from('recruiters').select('role,enabled').eq('user_id',admin).maybeSingle();
      if(generation!==request)return;
      if(access.error)throw access.error;
      if(!access.data?.enabled||access.data.role!=='admin'){stop();return;}
      const team=await db.from('recruiters').select('user_id,full_name,enabled').order('full_name');
      if(team.error)throw team.error;
      const start=new Date(selected+'T00:00:00-03:00');
      const end=new Date(start.getTime()+86400000);
      const events=[];
      for(let offset=0;;offset+=500){
        const result=await db.from('activity_log').select('id,actor_user_id,action,record_id,created_at').in('action',actions)
          .gte('created_at',start.toISOString()).lt('created_at',end.toISOString()).order('id',{ascending:false}).range(offset,offset+499);
        if(generation!==request)return;
        if(result.error)throw result.error;
        events.push(...result.data);
        if(result.data.length<500)break;
      }
      latest=summarizeActivity(events,team.data);
      const {members,total}=latest;
      const list=[...members.values()].filter(person=>person.enabled||person.total>0);
      const active=list.filter(person=>person.total>0).length;
      const isToday=selected===today();
      const previewMembers=isToday?list.slice(0,5):[];
      preview.hidden=!previewMembers.length;
      preview.innerHTML=previewMembers.map(person=>`<button type="button" class="btn-small" data-member="${esc(person.user_id)}">${esc(person.full_name||'Recrutador')} · ${person.total} ações · ${percent.format(total?person.total/total:0)}</button>`).join('');
      $('productivityBrief').textContent=selected===today()?total+' ações registradas hoje':'';
      status.textContent=total+' ações · '+active+' pessoas com atividade';
      roster.innerHTML=list.map(member=>{
        const share=total?member.total/total:0;
        return `<button type="button" class="productivity-member" data-member="${esc(member.user_id)}" aria-pressed="${memberId===member.user_id}"><strong>${esc(member.full_name||'Recrutador')}</strong><span>${member.total} ações · ${percent.format(share)}</span><progress max="1" value="${share}" aria-label="Participação nas ações da equipe"></progress></button>`;
      }).join('')||'<p class="muted">Nenhum membro habilitado.</p>';
      showDetail();
    }catch{
      if(generation===request)status.textContent='Não foi possível atualizar a produtividade. Tentaremos novamente.';
    }
  }
  date.addEventListener('change',()=>{followsToday=date.value===today();refresh();});
  roster.addEventListener('click',event=>{
    const button=event.target.closest('[data-member]');
    if(!button)return;
    memberId=button.dataset.member;
    showDetail();
    detail.focus({preventScroll:true});
    detail.scrollIntoView({block:'nearest'});
  });
  preview.addEventListener('click',event=>{
    const button=event.target.closest('[data-member]');
    if(!button)return;
    memberId=button.dataset.member;
    openPanel();
    showDetail();
    detail.focus();
  });
  return {
    stop,
    start(userId,role){
      stop();
      if(role!=='admin')return;
      admin=userId;
      followsToday=true;
      date.value=today();
      panel.hidden=false;
      shortcut.hidden=false;
      status.textContent='Consultando a atividade da equipe…';
      channel=db.channel('c360-productivity').on('postgres_changes',{event:'INSERT',schema:'public',table:'activity_log'},()=>{
        if(!followsToday)return;
        clearTimeout(pending);
        pending=setTimeout(refresh,250);
      }).subscribe();
      timer=setInterval(()=>{if(!document.hidden)refresh();},15000);
      refresh();
    }
  };
}
