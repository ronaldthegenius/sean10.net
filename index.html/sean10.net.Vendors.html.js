


function loadAdmin(){
  let clients = JSON.parse(localStorage.getItem('sean10_clients') || '[]');
  // sort: expired last, soonest expiry first
  clients.sort((a,b)=>a.expiresAt-b.expiresAt);
  const list = document.getElementById('adminList');
  list.innerHTML = '';
  if(clients.length===0){
    list.innerHTML='<p>No vendors. Add depay=30, grace=15, shop2=7 to test.</p>';return;
  }
  clients.forEach(c=>{
    const daysLeft = Math.ceil((c.expiresAt - Date.now())/(24*60*60*1000));
    const isExpired = daysLeft <= 0;
    const isWarning = daysLeft>0 && daysLeft<=5;
    let statusClass = isExpired ? 'expired' : isWarning ? 'warning' : 'active';
    let badgeClass = isExpired ? 'b-exp' : isWarning ? 'b-warn' : 'b-active';
    let badgeText = isExpired ? 'EXPIRED' : daysLeft+'d left';
    const expDate = new Date(c.expiresAt).toLocaleDateString();
    const div=document.createElement('div');
    div.className=`card ${statusClass}`;
    div.innerHTML=`
      <div>
        <div><b>${c.vendor}</b> <span class="badge ${badgeClass}">${badgeText}</span></div>
        <div style="font-size:12px;color:#666;margin-top:4px">Expires: ${expDate} • ${new Date(c.expiresAt).toLocaleString()}</div>
      </div>
      <div style="display:flex;gap:5px;flex-direction:column">
        <button class="pay" onclick="vendorPaid('${c.vendor}',30)">+30d</button>
        <button class="pay" style="background:#3b82f6" onclick="vendorPaid('${c.vendor}',7)">+7d</button>
        <button class="del" onclick="removeVendor('${c.vendor}')">Delete</button>
      </div>`;
    list.appendChild(div);
  });
}

function addVendorFromInput(){
  const name=document.getElementById('vName').value.trim().toLowerCase();
  const days=parseInt(document.getElementById('vDays').value)||30;
  if(!name) return alert("Enter vendor name");
  addVendor(name,days);
  document.getElementById('vName').value='';
}

function addVendor(name,days=30){
  let clients=JSON.parse(localStorage.getItem('sean10_clients')||'[]');
  if(clients.find(c=>c.vendor===name)) return alert("Exists");
  clients.push({vendor:name, expiresAt:Date.now()+days*24*60*60*1000, status:'active'});
  localStorage.setItem('sean10_clients',JSON.stringify(clients));
  loadAdmin();
}

function vendorPaid(v,days){
  let clients=JSON.parse(localStorage.getItem('sean10_clients')||'[]');
  clients=clients.map(c=>{ if(c.vendor===v){ c.expiresAt=Date.now()+days*24*60*60*1000; c.status='active'; } return c; });
  localStorage.setItem('sean10_clients',JSON.stringify(clients));
  loadAdmin();
}
function removeVendor(name){
  if(!confirm("Delete "+name+"?")) return;
  let clients=JSON.parse(localStorage.getItem('sean10_clients')||'[]');
  clients=clients.filter(c=>c.vendor!==name);
  localStorage.setItem('sean10_clients',JSON.stringify(clients));
  loadAdmin();
}
function generateJSON(){
  const clients=JSON.parse(localStorage.getItem('sean10_clients')||'[]');
  if(!clients.length) return alert("Add vendors first");
  const obj={};
  clients.forEach(c=>{ obj[c.vendor]={ expiresAt:c.expiresAt, status: Date.now()>c.expiresAt ? 'expired':'active' }; });
  const str=JSON.stringify(obj,null,2);
  const out=document.getElementById('jsonOutput');
  out.style.display='block'; out.textContent=str;
  navigator.clipboard.writeText(str);
  alert("Copied! Paste to vendors.json");
}
loadAdmin();
