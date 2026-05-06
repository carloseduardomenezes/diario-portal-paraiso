import { useState } from "react";
import { auth, provider } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // 🔐 login email/senha
  const loginEmail = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, senha);
      setUser(result.user);
    } catch (error) {
      alert("Erro login: " + error.message);
    }
  };

  // 🆕 criar conta
  const criarConta = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, senha);
      setUser(result.user);
    } catch (error) {
      alert("Erro criar conta: " + error.message);
    }
  };

  // 🌐 Google login
  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      alert("Erro Google: " + error.message);
    }
  };

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>🎣 Portal do Paraíso</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", margin: "10px auto", padding: 8 }}
      />

      <input
        placeholder="Senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        style={{ display: "block", margin: "10px auto", padding: 8 }}
      />

      <button onClick={loginEmail} style={{ margin: 5 }}>
        Entrar
      </button>

      <button onClick={criarConta} style={{ margin: 5 }}>
        Criar conta
      </button>

      <hr style={{ margin: 20 }} />

      <button onClick={loginGoogle}>
        Entrar com Google
      </button>
    </div>
  );
}