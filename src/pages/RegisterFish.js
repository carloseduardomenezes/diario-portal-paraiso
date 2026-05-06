import { useState, useEffect, useCallback } from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";

import fishImg from "../assets/fish.png";

export default function RegisterFish({ user }) {
  const [especie, setEspecie] = useState("");
  const [peso, setPeso] = useState("");
  const [hora, setHora] = useState("");
  const [isca, setIsca] = useState("");
  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [ano, setAno] = useState("");
  const [foto, setFoto] = useState(null);

  const [listaPeixes, setListaPeixes] = useState([]);
  const [filtroEspecie, setFiltroEspecie] = useState("");

  // 🌙 LUA CORRIGIDA (8 fases)
  const getFaseLua = (d, m, a) => {
    const date = new Date(a, m - 1, d);

    const lp = 2551443;
    const new_moon = new Date(Date.UTC(1970, 0, 7, 20, 35, 0));

    const phase = ((date.getTime() - new_moon.getTime()) / 1000) % lp;
    const days = phase / (24 * 3600);

    if (days < 1.84566) return "Nova";
    if (days < 5.53699) return "Crescente";
    if (days < 9.22831) return "Quarto Crescente";
    if (days < 12.91963) return "Gibosa Crescente";
    if (days < 16.61096) return "Cheia";
    if (days < 20.30228) return "Gibosa Minguante";
    if (days < 23.99361) return "Quarto Minguante";
    if (days < 27.68493) return "Minguante";

    return "Nova";
  };

  const comprimirImagem = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = 600 / img.width;

          canvas.width = 600;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
      };
    });
  };

  const buscarPeixes = useCallback(async () => {
    const dados = await getDocs(collection(db, "peixes"));

    const lista = dados.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item) => item.uid === user.uid);

    setListaPeixes(lista);
  }, [user]);

  useEffect(() => {
    if (user) buscarPeixes();
  }, [user, buscarPeixes]);

  const salvar = async () => {
    if (!especie || !peso || !hora || !isca || !dia || !mes || !ano) {
      alert("Preencha tudo!");
      return;
    }

    let fotoComprimida = null;
    if (foto) fotoComprimida = await comprimirImagem(foto);

    await addDoc(collection(db, "peixes"), {
      especie,
      peso: Number(peso),
      hora,
      isca,
      dia,
      mes,
      ano,
      faseLua: getFaseLua(dia, mes, ano),
      foto: fotoComprimida || null,
      uid: user.uid
    });

    setEspecie("");
    setPeso("");
    setHora("");
    setIsca("");
    setDia("");
    setMes("");
    setAno("");
    setFoto(null);

    buscarPeixes();
  };

  const deletarPeixe = async (id) => {
    if (!window.confirm("Excluir captura?")) return;
    await deleteDoc(doc(db, "peixes", id));
    buscarPeixes();
  };

  const peixesFiltrados = () => {
    if (!filtroEspecie) return listaPeixes;
    return listaPeixes.filter((p) => p.especie === filtroEspecie);
  };

  const totalPeixes = peixesFiltrados().length;

  // 📊 DADOS
  const gerarDados = (campo) => {
    const contagem = {};

    peixesFiltrados().forEach((p) => {
      let chave = p[campo];
      if (!chave) return;

      if (campo === "hora") {
        const [h, m] = p.hora.split(":").map(Number);
        chave = `${h.toString().padStart(2, "0")}:${m < 30 ? "00" : "30"}`;
      }

      if (campo === "mes") {
        const nomes = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
        chave = nomes[p.mes - 1];
      }

      contagem[chave] = (contagem[chave] || 0) + 1;
    });

    let result = Object.entries(contagem).map(([name, value]) => ({
      name,
      value
    }));

    if (campo === "mes") {
      const ordem = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
      result.sort((a, b) => ordem.indexOf(a.name) - ordem.indexOf(b.name));
    }
    else if (campo === "faseLua") {
      const ordemLua = [
        "Nova",
        "Crescente",
        "Quarto Crescente",
        "Gibosa Crescente",
        "Cheia",
        "Gibosa Minguante",
        "Quarto Minguante",
        "Minguante"
      ];
      result.sort((a, b) => ordemLua.indexOf(a.name) - ordemLua.indexOf(b.name));
    }
    else {
      result.sort((a, b) => b.value - a.value);
    }

    return result;
  };

  const especiesUnicas = [...new Set(listaPeixes.map((p) => p.especie))];

  const dadosHora = gerarDados("hora");
  const maxValor = Math.max(...dadosHora.map(d => d.value));

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>

      <h1>🎣 Portal do Paraíso</h1>

      <input placeholder="Espécie" value={especie} onChange={(e) => setEspecie(e.target.value)} />
      <input placeholder="Peso" value={peso} onChange={(e) => setPeso(e.target.value)} />
      <input placeholder="Hora" value={hora} onChange={(e) => setHora(e.target.value)} />
      <input placeholder="Isca" value={isca} onChange={(e) => setIsca(e.target.value)} />
      <input placeholder="Dia" value={dia} onChange={(e) => setDia(e.target.value)} />
      <input placeholder="Mês" value={mes} onChange={(e) => setMes(e.target.value)} />
      <input placeholder="Ano" value={ano} onChange={(e) => setAno(e.target.value)} />

      <input type="file" onChange={(e) => setFoto(e.target.files[0])} />

      <button onClick={salvar}>Salvar 🎣</button>

      <hr />

      <div>
        <select value={filtroEspecie} onChange={(e) => setFiltroEspecie(e.target.value)}>
          <option value="">Todas espécies</option>
          {especiesUnicas.map((esp) => (
            <option key={esp}>{esp}</option>
          ))}
        </select>

        <h3 style={{ marginTop: 10 }}>
          🐟 Total de peixes: {totalPeixes}
        </h3>
      </div>

      <hr />

      {/* HORÁRIO */}
      <h2>📊 Horário</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={dadosHora}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value">
            {dadosHora.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.value === maxValor ? "#ef4444" : "#0ea5e9"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* ISCA */}
      <h2>🎣 Isca</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={gerarDados("isca")}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>

      {/* MES */}
      <h2>📅 Meses</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={gerarDados("mes")}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>

      {/* LUA */}
      <h2>🌙 Lua</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={gerarDados("faseLua")}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value">
            {gerarDados("faseLua").map((entry, index) => {
              const cores = {
                "Nova": "#111827",
                "Crescente": "#60a5fa",
                "Quarto Crescente": "#3b82f6",
                "Gibosa Crescente": "#93c5fd",
                "Cheia": "#fde047",
                "Gibosa Minguante": "#c084fc",
                "Quarto Minguante": "#a855f7",
                "Minguante": "#6b7280"
              };

              return (
                <Cell
                  key={index}
                  fill={cores[entry.name] || "#a855f7"}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <hr />

      {/* LISTA */}
      {peixesFiltrados().map((item) => (
        <div key={item.id} style={{ padding: 15, border: "1px solid #ddd", marginBottom: 10 }}>
          <img 
            src={item.foto || fishImg} 
            alt={item.especie || "peixe"} 
            style={{ width: 200 }} 
          />

          <p>🐟 {item.especie}</p>
          <p>⚖️ {item.peso}</p>
          <p>🎣 {item.isca}</p>
          <p>📅 {item.dia}/{item.mes}/{item.ano}</p>

          <p>
            {(() => {
              const emojis = {
                "Nova": "🌑",
                "Crescente": "🌒",
                "Quarto Crescente": "🌓",
                "Gibosa Crescente": "🌔",
                "Cheia": "🌕",
                "Gibosa Minguante": "🌖",
                "Quarto Minguante": "🌗",
                "Minguante": "🌘"
              };
              return `${emojis[item.faseLua] || "🌙"} ${item.faseLua}`;
            })()}
          </p>

          <button onClick={() => deletarPeixe(item.id)}>Excluir</button>
        </div>
      ))}
    </div>
  );
}