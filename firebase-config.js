/* ============================================================
   CONFIGURACIÓN DE FIREBASE (SDK modular v10)
   Proyecto: merchct-d059a
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRCq0FuAY5NYBcQFv03WmdmUSehi1L_B4",
  authDomain: "merchct-d059a.firebaseapp.com",
  databaseURL: "https://merchct-d059a-default-rtdb.firebaseio.com",
  projectId: "merchct-d059a",
  storageBucket: "merchct-d059a.firebasestorage.app",
  messagingSenderId: "290525612160",
  appId: "1:290525612160:web:1aca5527196597c3eebe65",
  measurementId: "G-5VE65DCLCW"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const firebaseReady = true;

/* Colección donde se guardan los registros de verificación */
export const VERIFICATIONS_COLLECTION = "verificaciones";

/* Analytics solo se activa si el navegador lo soporta (no falla en SSR/entornos raros) */
isSupported().then(supported => {
  if (supported) getAnalytics(app);
}).catch(() => {});
