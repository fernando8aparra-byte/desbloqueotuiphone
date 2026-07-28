/* ============================================================
   CONFIGURACIÓN DE FIREBASE (SDK modular v10)
   Proyecto: mensaje-76bbc
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUE6QZa8ClQLNPXSuv0QFa2myLIAT2Y9s",
  authDomain: "mensaje-76bbc.firebaseapp.com",
  databaseURL: "https://mensaje-76bbc-default-rtdb.firebaseio.com",
  projectId: "mensaje-76bbc",
  storageBucket: "mensaje-76bbc.firebasestorage.app",
  messagingSenderId: "257129078581",
  appId: "1:257129078581:web:48c923addfa3d28526f67c",
  measurementId: "G-7F10K2Z3VJ"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const firebaseReady = true;

/* Colección donde se guardan los registros de verificación */
export const VERIFICATIONS_COLLECTION = "verificaciones";


/* Colecciones principales para el CRM de técnicos */
export const USERS_COLLECTION = "users";
export const JOBS_COLLECTION = "jobs";
export const CLIENTS_COLLECTION = "clients";
export const BRANDS_COLLECTION = "brands";
export const MODELS_COLLECTION = "models";
export const LOCK_TYPES_COLLECTION = "lock_types";
export const TOOLS_COLLECTION = "tools";
export const PROCEDURES_COLLECTION = "procedures";
export const RANKINGS_COLLECTION = "rankings";
export const EARNINGS_COLLECTION = "earnings";
export const NOTIFICATIONS_COLLECTION = "notifications";
export const BADGES_COLLECTION = "badges";
export const LEVELS_COLLECTION = "levels";
export const STATISTICS_COLLECTION = "statistics";

/* Analytics solo se activa si el navegador lo soporta (no falla en SSR/entornos raros) */
isSupported().then(supported => {
  if (supported) getAnalytics(app);
}).catch(() => {});
