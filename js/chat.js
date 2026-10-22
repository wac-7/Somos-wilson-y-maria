/* Chat en vivo de la radio. Los mensajes entran con aprobado:false y solo se ven cuando se aprueban en admin.html. */
import {FIREBASE_CONFIG,COLECCION,cargarFirebase} from './firebase.js';

const CHAT_MAX=60;       /* mensajes visibles */
const CHAT_ESPERA=10000; /* ms mínimos entre mensajes de una misma persona */
const CHAT_MALAS=/(puta|puto|mierda|marica|malparid|gonorrea|hijueputa|hp\b|porn|sexo|xxx)/i;
const CHAT_ENLACE=/(https?:\/\/|www\.|\.com\b|\.net\b|\.site\b)/i;

function iniciarChat(){
 const box=document.getElementById('chatBox'),lista=document.getElementById('chatMsgs'),form=document.getElementById('chatForm'),
  inNombre=document.getElementById('chatNombre'),inTexto=document.getElementById('chatTexto'),inHp=document.getElementById('chatHp'),
  est=document.getElementById('chatEstado'),btn=document.getElementById('chatEnviar'),chips=[...document.querySelectorAll('#chatTipos .chip')];
 const vacio=t=>{lista.innerHTML='';const d=document.createElement('div');d.className='chat-vacio';d.textContent=t;lista.appendChild(d)};
 const aviso=t=>{est.textContent=t};
 const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
 let id=ls.get('chatUid');if(!id){id=(self.crypto&&crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)).slice(0,40);ls.set('chatUid',id)}
 inNombre.value=(ls.get('chatNombre')||'').slice(0,30);
 let tipo='saludo';
 const ICONO={oracion:'🙏 ',saludo:'👋 '};
 chips.forEach(c=>c.addEventListener('click',()=>{tipo=c.dataset.k;chips.forEach(x=>{const on=x===c;x.classList.toggle('on',on);x.setAttribute('aria-checked',on)});
  inTexto.placeholder=tipo==='oracion'?'Cuéntanos por qué quieres que oremos…':'Escribe tu mensaje…'}));

 if(!FIREBASE_CONFIG.apiKey||!FIREBASE_CONFIG.projectId){vacio('Chat muy pronto');aviso('');return}

 cargarFirebase().then(({F,db})=>{
  const col=F.collection(db,COLECCION);
  box.classList.remove('off');vacio('Aún no hay mensajes publicados.');
  const hora=ts=>{try{return ts?ts.toDate().toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit',timeZone:'America/Bogota'}):''}catch(e){return ''}};
  F.onSnapshot(F.query(col,F.where('aprobado','==',true),F.orderBy('creado','desc'),F.limit(CHAT_MAX)),snap=>{
   lista.innerHTML='';
   if(snap.empty){vacio('Aún no hay mensajes publicados.');return}
   snap.docs.forEach(d=>{const m=d.data({serverTimestamps:'estimate'}),el=document.createElement('div');
    el.className='msg'+(m.tipo==='oracion'?' oracion':'');
    const top=document.createElement('div'),n=document.createElement('b'),h=document.createElement('time'),t=document.createElement('p');
    top.className='top';top.append((ICONO[m.tipo]||''));
    n.textContent=String(m.nombre||'').slice(0,30);h.textContent=hora(m.creado);t.textContent=String(m.texto||'').slice(0,280);
    top.append(n,h);el.append(top,t);lista.appendChild(el)});
  },()=>{vacio('No se pudo conectar el chat. Revisa tu Internet.')});

  let ultimo=0;
  form.addEventListener('submit',async e=>{e.preventDefault();
   if(inHp.value)return; /* trampa para bots */
   const nombre=inNombre.value.replace(/\s+/g,' ').trim().slice(0,30),texto=inTexto.value.replace(/\s+/g,' ').trim().slice(0,280);
   if(!nombre){aviso('Escribe tu nombre.');return}
   if(!texto){aviso('Escribe tu mensaje.');return}
   if(CHAT_ENLACE.test(texto)){aviso('No se permiten enlaces en el chat.');return}
   if(CHAT_MALAS.test(nombre+' '+texto)){aviso('Por favor cuida el lenguaje: este es un espacio de fe y respeto.');return}
   if(Date.now()-ultimo<CHAT_ESPERA&&ultimo){aviso('Espera unos segundos antes de enviar otro mensaje.');return}
   btn.disabled=true;btn.textContent='Enviando…';aviso('');
   try{await F.addDoc(col,{nombre,texto,tipo,dispositivo:id,aprobado:false,creado:F.serverTimestamp()});
    ultimo=Date.now();ls.set('chatNombre',nombre);inTexto.value='';aviso('✅ ¡Recibido! Tu mensaje se publicará cuando sea aprobado.')}
   catch(err){aviso('No se pudo enviar. Inténtalo de nuevo.')}
   btn.disabled=false;btn.textContent='Enviar';
  });
 }).catch(()=>{vacio('No se pudo conectar el chat. Revisa tu Internet.')});
}

iniciarChat();
