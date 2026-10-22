/* Conexión compartida a Firebase (la usan el chat público y el panel de moderación). */
export const FIREBASE_CONFIG={apiKey:"AIzaSyCxKujoh8n5KMnlDcwZqOaClMSqYKx5LuU",authDomain:"firestore-database-cbb35.firebaseapp.com",projectId:"firestore-database-cbb35",storageBucket:"",messagingSenderId:"",appId:"1:225006091512:web:514901a4900dad3b4e4f0d"};
export const COLECCION="mensajes";

const B="https://www.gstatic.com/firebasejs/10.14.1/";

/* Carga Firebase solo cuando se necesita. Con {auth:true} también carga el inicio de sesión. */
export async function cargarFirebase({auth=false}={}){
  const pedidos=[import(B+"firebase-app.js"),import(B+"firebase-firestore.js")];
  if(auth)pedidos.push(import(B+"firebase-auth.js"));
  const [A,F,Au]=await Promise.all(pedidos);
  const app=A.getApps().length?A.getApp():A.initializeApp(FIREBASE_CONFIG);
  return{F,db:F.getFirestore(app),Au,auth:Au?Au.getAuth(app):null};
}
