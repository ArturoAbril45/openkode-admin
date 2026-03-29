// Ejecuta este script UNA SOLA VEZ para crear el usuario admin
// node scripts/createAdmin.mjs

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey:            "AIzaSyAbRNmKupvRxWrTlb_dnCeYmA8Lm0dx0ak",
  authDomain:        "openkode-admin.firebaseapp.com",
  projectId:         "openkode-admin",
  storageBucket:     "openkode-admin.firebasestorage.app",
  messagingSenderId: "282849037858",
  appId:             "1:282849037858:web:02d629ce0b0d152278447b",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ── Cambia estos datos si quieres ──
const EMAIL    = "admin@openkode.com";
const PASSWORD = "Copito1020";

createUserWithEmailAndPassword(auth, EMAIL, PASSWORD)
  .then(() => {
    console.log(`✅ Usuario admin creado: ${EMAIL}`);
    process.exit(0);
  })
  .catch(err => {
    if (err.code === "auth/email-already-in-use") {
      console.log("⚠️  El usuario ya existe, puedes iniciar sesión.");
    } else {
      console.error("❌ Error:", err.message);
    }
    process.exit(0);
  });
