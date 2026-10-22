/* Panel de moderación del chat (solo administrador). Página: admin.html
   Inicia sesión con Firebase Auth (correo y contraseña). Solo tu UID puede aprobar/borrar, según las reglas de Firestore. */
import {COLECCION,cargarFirebase} from './firebase.js';

const cuerpo=document.getElementById('modCuerpo');
let unsub=null,tab='pendientes';

const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const hora=ts=>{try{return ts?ts.toDate().toLocaleString('es-CO',{hour:'numeric',minute:'2-digit',day:'numeric',month:'short',timeZone:'America/Bogota'}):''}catch(e){return ''}};

function login(m){
  const e=el('input');e.type='email';e.placeholder='Correo';e.autocomplete='username';
  const c=el('input');c.type='password';c.placeholder='Contraseña';c.autocomplete='current-password';
  const er=el('div','merr',''),b=el('button','mbtn','Entrar');b.type='button';
  const ir=async()=>{er.textContent='';try{await m.Au.signInWithEmailAndPassword(m.auth,e.value.trim(),c.value)}catch(x){er.textContent='Correo o contraseña incorrectos.'}};
  b.onclick=ir;c.onkeydown=ev=>{if(ev.key==='Enter')ir()};
  cuerpo.replaceChildren(el('p','mp','Solo para el administrador de la radio.'),e,c,er,b);
}

function panel(m){
  const tabs=el('div','mtabs'),lista=el('div'),er=el('div','merr',''),
    out=el('button','salir','Cerrar sesión');out.type='button';out.onclick=()=>m.Au.signOut(m.auth);
  [['pendientes','Pendientes'],['publicados','Publicados']].forEach(([k,t])=>{
    const b=el('button',k===tab?'on':'',t);b.type='button';b.onclick=()=>{tab=k;if(unsub)unsub();panel(m)};tabs.appendChild(b)});
  cuerpo.replaceChildren(tabs,er,lista,out);
  lista.appendChild(el('p','mp','Cargando…'));
  const q=m.F.query(m.F.collection(m.db,COLECCION),m.F.where('aprobado','==',tab==='publicados'),m.F.orderBy('creado','desc'),m.F.limit(100));
  unsub=m.F.onSnapshot(q,snap=>{
    lista.replaceChildren();
    if(snap.empty){lista.appendChild(el('p','mp',tab==='pendientes'?'No hay mensajes pendientes 🎉':'Aún no hay publicados.'));return}
    snap.docs.forEach(d=>{
      const x=d.data({serverTimestamps:'estimate'}),card=el('div','mm'+(x.tipo==='oracion'?' oracion':'')),
        top=el('div','mt',x.tipo==='oracion'?'🙏 ':x.tipo==='saludo'?'👋 ':'💬 ');
      top.append(el('b',null,String(x.nombre||'').slice(0,30)),el('time',null,hora(x.creado)));
      const f=el('div','mf');
      if(tab==='pendientes'){
        const a=el('button','ok','✓ Aprobar');a.type='button';
        a.onclick=()=>m.F.updateDoc(m.F.doc(m.db,COLECCION,d.id),{aprobado:true}).catch(()=>er.textContent='No se pudo aprobar.');
        f.appendChild(a);
      }
      const r=el('button','del','🗑 Borrar');r.type='button';
      r.onclick=()=>{if(confirm('¿Borrar el mensaje de '+(x.nombre||'')+'?'))m.F.deleteDoc(m.F.doc(m.db,COLECCION,d.id)).catch(()=>er.textContent='No se pudo borrar.')};
      f.appendChild(r);
      card.append(top,el('p',null,String(x.texto||'').slice(0,280)),f);lista.appendChild(card);
    });
  },()=>{lista.replaceChildren();er.textContent='No se pudo leer. ¿Pusiste tu UID en las reglas y creaste el índice?'});
}

cargarFirebase({auth:true})
  .then(m=>m.Au.onAuthStateChanged(m.auth,u=>{if(unsub){unsub();unsub=null}u?panel(m):login(m)}))
  .catch(()=>cuerpo.replaceChildren(el('p','merr','No se pudo cargar. Revisa tu Internet.')));
