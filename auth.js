/* ============================================================
   Menú hamburguesa + autenticación (compartido entre páginas)
   SDK modular v10 — importa auth y db desde firebase-config.js

   Fase 1: registro de técnicos, roles (admin/tecnico) y
   recuperación de contraseña.
   ============================================================ */
import { auth, db, USERS_COLLECTION } from './firebase-config.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

/* ---------- Menú lateral ---------- */
const menuBtn = document.getElementById('menuBtn');
const overlay = document.getElementById('overlay');
const sidePanel = document.getElementById('sidePanel');
const closePanel = document.getElementById('closePanel');

const loggedOutView = document.getElementById('loggedOutView');
const loggedInView = document.getElementById('loggedInView');

/* ---------- Formulario: iniciar sesión ---------- */
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

/* ---------- Formulario: crear cuenta ---------- */
const registerForm = document.getElementById('registerForm');
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
const registerBtn = document.getElementById('registerBtn');
const registerError = document.getElementById('registerError');

/* ---------- Formulario: recuperar contraseña ---------- */
const forgotForm = document.getElementById('forgotForm');
const forgotEmail = document.getElementById('forgotEmail');
const forgotBtn = document.getElementById('forgotBtn');
const forgotMsg = document.getElementById('forgotMsg');

/* ---------- Vista de sesión iniciada ---------- */
const avatarInitials = document.getElementById('avatarInitials');
const profileEmail = document.getElementById('profileEmail');
const profileRole = document.getElementById('profileRole');
const logoutBtn = document.getElementById('logoutBtn');

/* ---------- Abrir / cerrar panel ---------- */
function openPanel(){
  overlay.classList.add('open');
  sidePanel.classList.add('open');
}
function closeSidePanel(){
  overlay.classList.remove('open');
  sidePanel.classList.remove('open');
}
menuBtn.addEventListener('click', openPanel);
closePanel.addEventListener('click', closeSidePanel);
overlay.addEventListener('click', closeSidePanel);
window.openAccountPanel = openPanel;

/* ---------- Cambiar entre login / registro / recuperar ---------- */
function showForm(which){
  loginForm.style.display = which === 'login' ? 'block' : 'none';
  registerForm.style.display = which === 'register' ? 'block' : 'none';
  forgotForm.style.display = which === 'forgot' ? 'block' : 'none';
  loginError.textContent = '';
  registerError.textContent = '';
  forgotMsg.textContent = '';
}
document.getElementById('showRegisterBtn').addEventListener('click', ()=> showForm('register'));
document.getElementById('showForgotBtn').addEventListener('click', ()=> showForm('forgot'));
document.getElementById('showLoginFromRegisterBtn').addEventListener('click', ()=> showForm('login'));
document.getElementById('showLoginFromForgotBtn').addEventListener('click', ()=> showForm('login'));

/* Otras páginas se suscriben con window.onAuthChange(fn) para reaccionar
   cuando cambia la sesión (ej. habilitar el botón de registrar).
   fn recibe (user, profile) — profile incluye { rol, nombre, ... } o null. */
window._authListeners = [];
window.onAuthChange = function(fn){ window._authListeners.push(fn); };
window.currentUser = null;
window.currentUserProfile = null;
window.isAdmin = function(){ return !!(window.currentUserProfile && window.currentUserProfile.rol === 'admin'); };

function notifyAuthListeners(user, profile){
  window.currentUser = user;
  window.currentUserProfile = profile;
  window._authListeners.forEach(fn => fn(user, profile));
}

/* ---------- Perfil Firestore: users/{uid} ---------- */
async function ensureUserProfile(user, nombre){
  const ref = doc(db, USERS_COLLECTION, user.uid);
  const snap = await getDoc(ref);
  if(snap.exists()) return snap.data();

  const profile = {
    nombre: nombre || user.displayName || user.email.split('@')[0],
    email: user.email,
    fotoURL: '',
    fechaRegistro: serverTimestamp(),
    rol: 'tecnico',            // el rol "admin" se asigna manualmente en Firestore
    trabajosRealizados: 0,
    trabajosExitosos: 0,
    gananciasTotales: 0,
    gananciasMensuales: 0,
    puntos: 0,
    nivel: 1
  };
  await setDoc(ref, profile);
  return profile;
}

function applyProfileToUI(user, profile){
  profileEmail.textContent = user.email;
  avatarInitials.textContent = (profile && profile.nombre ? profile.nombre.slice(0,2) : user.email.slice(0,2)).toUpperCase();
  profileRole.textContent = profile && profile.rol === 'admin' ? 'Administrador' : 'Técnico';
}

onAuthStateChanged(auth, async user => {
  if (user) {
    loggedOutView.style.display = 'none';
    loggedInView.style.display = 'block';
    let profile = null;
    try{
      profile = await ensureUserProfile(user);
      applyProfileToUI(user, profile);
    }catch(err){
      console.error('No se pudo cargar el perfil del usuario:', err);
      applyProfileToUI(user, null);
    }
    notifyAuthListeners(user, profile);
  } else {
    loggedOutView.style.display = 'block';
    loggedInView.style.display = 'none';
    showForm('login');
    notifyAuthListeners(null, null);
  }
});

/* ---------- Iniciar sesión ---------- */
loginBtn.addEventListener('click', () => {
  const email = loginEmail.value.trim();
  const pass = loginPassword.value;
  if (!email || !pass) {
    loginError.textContent = 'Ingresa correo y contraseña.';
    return;
  }
  loginError.textContent = '';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Entrando...';
  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Iniciar sesión';
      loginEmail.value = '';
      loginPassword.value = '';
      closeSidePanel();
    })
    .catch(err => {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Iniciar sesión';
      loginError.textContent = 'No se pudo iniciar sesión. Verifica tus datos.';
      console.error(err);
    });
});

/* ---------- Crear cuenta de técnico ---------- */
registerBtn.addEventListener('click', () => {
  const nombre = registerName.value.trim();
  const email = registerEmail.value.trim();
  const pass = registerPassword.value;
  const passConfirm = registerPasswordConfirm.value;

  if (!nombre || !email || !pass || !passConfirm) {
    registerError.textContent = 'Completa todos los campos.';
    return;
  }
  if (pass.length < 6) {
    registerError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }
  if (pass !== passConfirm) {
    registerError.textContent = 'Las contraseñas no coinciden.';
    return;
  }

  registerError.textContent = '';
  registerBtn.disabled = true;
  registerBtn.textContent = 'Creando cuenta...';

  createUserWithEmailAndPassword(auth, email, pass)
    .then(async cred => {
      await updateProfile(cred.user, { displayName: nombre }).catch(()=>{});
      await ensureUserProfile(cred.user, nombre);
      registerBtn.disabled = false;
      registerBtn.textContent = 'Crear cuenta';
      registerName.value = '';
      registerEmail.value = '';
      registerPassword.value = '';
      registerPasswordConfirm.value = '';
      closeSidePanel();
    })
    .catch(err => {
      registerBtn.disabled = false;
      registerBtn.textContent = 'Crear cuenta';
      if (err.code === 'auth/email-already-in-use') {
        registerError.textContent = 'Ese correo ya tiene una cuenta.';
      } else if (err.code === 'auth/invalid-email') {
        registerError.textContent = 'El correo no es válido.';
      } else {
        registerError.textContent = 'No se pudo crear la cuenta. Intenta de nuevo.';
      }
      console.error(err);
    });
});

/* ---------- Recuperar contraseña ---------- */
forgotBtn.addEventListener('click', () => {
  const email = forgotEmail.value.trim();
  if (!email) {
    forgotMsg.textContent = 'Ingresa tu correo electrónico.';
    forgotMsg.className = 'hint err';
    return;
  }
  forgotMsg.textContent = '';
  forgotBtn.disabled = true;
  forgotBtn.textContent = 'Enviando...';
  sendPasswordResetEmail(auth, email)
    .then(() => {
      forgotBtn.disabled = false;
      forgotBtn.textContent = 'Enviar enlace';
      forgotMsg.textContent = 'Te enviamos un enlace para restablecer tu contraseña.';
      forgotMsg.className = 'hint ok';
      forgotEmail.value = '';
    })
    .catch(err => {
      forgotBtn.disabled = false;
      forgotBtn.textContent = 'Enviar enlace';
      forgotMsg.textContent = 'No se pudo enviar el enlace. Verifica el correo.';
      forgotMsg.className = 'hint err';
      console.error(err);
    });
});

/* ---------- Cerrar sesión ---------- */
logoutBtn.addEventListener('click', () => {
  signOut(auth);
  closeSidePanel();
});
