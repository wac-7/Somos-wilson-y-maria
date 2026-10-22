/* ENLACES: pega aquí cada URL. Si queda vacío, el botón muestra "Muy pronto". */
const LINKS={tiktokDevocionales:"https://www.tiktok.com/@somoswilsonymaria",podcast:"https://open.spotify.com/show/0TnAnWImwVjspwF79HNyi2",youtube:"https://www.youtube.com/@somos-wilsonymaria",tiktokLives:"https://www.tiktok.com/@somoswilsonymaria",playLibros:"https://play.google.com/store/books/details?id=pcvbEAAAQBAJ",appleLibros:"",amazon:"https://a.co/d/02ueAosJ",gup:"https://generaciondeuncionypoder.somoswilsonymaria.site",alfarero:"https://manosdealfarero.somoswilsonymaria.site/",appAndroid:"",appIos:"",creacion:"https://creaciondigital.somoswilsonymaria.site/"};
/* DATOS DE CONTACTO: cambia estos valores */
const CONTACTO={email:"wac11mmd@gmail.com",whatsapp:"",telefono:""};
/* RADIO: URL de la grabación (mp3). Vacío = Muy pronto */
const RADIO_BASE="https://pstnet4.shoutcastnet.com:40184";
const RADIO_SRC=RADIO_BASE+"/stream";
/* HORARIO: dias 0=Dom 1=Lun 2=Mar 3=Mié 4=Jue 5=Vie 6=Sáb · hora 24h de Colombia · dur = duración en minutos (si no la pones, 60).
   Mientras un programa esté dentro de su horario, aparece arriba en "Sonando ahora". Cámbialo por tus programas reales. */
const PROGRAMACION=[
 {nombre:"Devocional de la mañana",hora:"06:00",dur:60,dias:[1,2,3,4,5,6]},
 {nombre:"Tiempo de Peticiones y Milagros",hora:"20:00",dur:60,dias:[5]},
 {nombre:"Pan del cielo - Predicas",hora:"15:00",dur:60,dias:[2,4]},
 {nombre:"Repetición - devocional de la mañana",hora:"09:00",dur:60,dias:[1,2,3,4,5,6]}
];

document.getElementById('y').textContent=new Date().getFullYear();
const mail=document.getElementById('mail');mail.textContent=CONTACTO.email;mail.href='mailto:'+CONTACTO.email;
document.getElementById('mailBtn').href='mailto:'+CONTACTO.email+'?subject=Invitación%20de%20iglesia';
const wa=document.getElementById('wa');wa.textContent='WhatsApp: '+CONTACTO.telefono;if(!CONTACTO.telefono)wa.style.display='none';
if(CONTACTO.whatsapp){wa.href='https://wa.me/'+CONTACTO.whatsapp}else{wa.classList.add('soon');wa.style.position='relative'}

function soon(el){el.classList.add('soon');el.addEventListener('click',e=>{e.preventDefault();el.classList.add('tap');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('tap'),1800)})}
document.querySelectorAll('[data-key]').forEach(a=>{const u=LINKS[a.dataset.key];if(u){a.href=u;a.target='_blank';a.rel='noopener'}else{a.href='#';soon(a)}});
if(wa.classList.contains('soon'))soon(wa);

/* ondas al hacer clic */
document.addEventListener('click',e=>{const b=e.target.closest('.btn');if(!b||b.classList.contains('soon'))return;const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)/6,d=document.createElement('span');d.className='rip';d.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;b.appendChild(d);setTimeout(()=>d.remove(),600)});

/* aparición al ver cada bloque */
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.2});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

/* menú activo */
const links=[...document.querySelectorAll('nav a')];
const so=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting)links.forEach(l=>l.classList.toggle('on',l.getAttribute('href')==='#'+x.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
document.querySelectorAll('section').forEach(s=>so.observe(s));

/* chispas de luz en el inicio */
const hero=document.querySelector('#inicio');
for(let i=0;i<14;i++){const c=document.createElement('i');c.className='chispa';c.style.cssText=`left:${Math.random()*100}%;bottom:${Math.random()*30}%;animation-delay:${Math.random()*6}s;animation-duration:${5+Math.random()*4}s`;hero.appendChild(c)}

/* radio */
const play=document.getElementById('play'),audio=document.getElementById('audio'),box=document.getElementById('radioBox');
const rnow=document.getElementById('rnow'),rnext=document.getElementById('rnext'),rsub=document.getElementById('rsub'),rinfo=document.querySelector('.rinfo');
let tituloStream='';
if(!RADIO_SRC)soon(play);
function radioStop(){audio.pause();audio.removeAttribute('src');audio.load();play.textContent='▶';box.classList.remove('sonando')}
play.addEventListener('click',()=>{if(!RADIO_SRC)return;
 if(audio.paused||!audio.getAttribute('src')){audio.src=RADIO_SRC+'?t='+Date.now();audio.play().then(()=>{play.textContent='❚❚';box.classList.add('sonando')}).catch(radioStop);leerAhora()}
 else{radioStop()}});
audio.addEventListener('error',()=>{if(audio.getAttribute('src'))radioStop()});
audio.addEventListener('ended',radioStop);

function limpiar(t){return String(t||'').replace(/\.(mp3|m4a|flac|ogg|mp4|webm|mkv)$/i,'').replace(/_/g,' ').trim()}
function mostrar(t){t=limpiar(t);if(/[<>]/.test(t))t='';tituloStream=t;pintarAhora()}
function leerAhora(){if(!RADIO_SRC)return;
 /* Shoutcast v1: /7.html = "oyentes,estado,pico,max,unicos,bitrate,TITULO" (dentro de un html mínimo) */
 fetch(RADIO_BASE+'/7.html',{cache:'no-store'}).then(r=>{if(!r.ok)throw 0;return r.text()}).then(t=>{
  const c=t.replace(/<[^>]*>/g,'').trim();
  if(!/^\d+,\d+,\d+,\d+,\d+,\d+,/.test(c))throw 0;
  mostrar(c.split(',').slice(6).join(','))})
 .catch(()=>fetch(RADIO_BASE+'/stats?sid=1&json=1',{cache:'no-store'}).then(r=>{if(!r.ok)throw 0;return r.json()}).then(d=>mostrar(d.songtitle))
 .catch(()=>mostrar('')))}

const DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
function ahoraCO(){const o={};new Intl.DateTimeFormat('en-US',{timeZone:'America/Bogota',hour12:false,weekday:'short',hour:'2-digit',minute:'2-digit'}).formatToParts(new Date()).forEach(x=>o[x.type]=x.value);
 return{dia:{Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[o.weekday],min:(parseInt(o.hour,10)%24)*60+parseInt(o.minute,10)}}
function horaFin(h,dur){const[a,b]=h.split(':'),t=(parseInt(a,10)*60+parseInt(b,10)+dur)%1440;return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')}
function programaActivo(){const n=ahoraCO();
 for(const e of PROGRAMACION){const[a,b]=e.hora.split(':'),ini=parseInt(a,10)*60+parseInt(b,10),dur=e.dur||60;
  for(const d of e.dias){const t=((n.dia-d+7)%7)*1440+n.min-ini;if(t>=0&&t<dur)return{e,fin:horaFin(e.hora,dur)}}}
 return null}
function pintarAhora(){const p=programaActivo();
 if(p){rnow.textContent=p.e.nombre;rsub.textContent='En vivo · hasta las '+fmtHora(p.fin);rinfo.classList.add('programa')}
 else{rnow.textContent=tituloStream||'Radio de Fuego';rsub.textContent='';rinfo.classList.remove('programa')}}
function fmtHora(h){const[a,m]=h.split(':'),n=parseInt(a,10);return(n%12||12)+':'+m+' '+(n>=12?'p. m.':'a. m.')}
function pintarProximo(){const n=ahoraCO();let best=null;
 PROGRAMACION.forEach(e=>{const[a,b]=e.hora.split(':'),m=parseInt(a,10)*60+parseInt(b,10);
  e.dias.forEach(d=>{let t=((d-n.dia+7)%7)*1440+(m-n.min);if(t<=0)t+=10080;if(!best||t<best.t)best={t,e,d}})});
 if(!best){rnext.textContent='—';return}
 const cuando=best.t<1440&&best.d===n.dia?'Hoy':(best.d===(n.dia+1)%7&&best.t<2880?'Mañana':DIAS[best.d][0].toUpperCase()+DIAS[best.d].slice(1));
 rnext.textContent=best.e.nombre+' · '+cuando+' '+fmtHora(best.e.hora)}
leerAhora();pintarAhora();pintarProximo();setInterval(leerAhora,15000);setInterval(()=>{pintarAhora();pintarProximo()},30000);
