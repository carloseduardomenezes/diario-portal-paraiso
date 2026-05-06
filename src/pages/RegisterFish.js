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

  // 🌙 LUA
  const getFaseLua = (d, m, a) => {
    const data = new Date(a, m - 1, d);
    const diff = data - new Date(2001, 0, 1);
    const dias = diff / (1000 * 60 * 60 * 24);
    const fase = Math.floor(dias % 29.53);

    if (fase < 7) return "Nova";
    if (fase < 15) return "Crescente";
    if (fase < 22) return "Cheia";
    return "Minguante";
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

  // 🔍 filtro
  const peixesFiltrados = () => {
    if (!filtroEspecie) return listaPeixes;
    return listaPeixes.filter((p) => p.especie === filtroEspecie);
  };

  // 📊 total geral ou filtrado
  const totalPeixes = peixesFiltrados().length;

  // 📊 dados
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
      const ordem = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
      result.sort((a, b) => ordem.indexOf(a.name) - ordem.indexOf(b.name));
    } else {
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

      {/* FORM */}
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

      {/* FILTRO */}
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

      {/* GRÁFICOS */}
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

      <h2>🌙 Lua</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={gerarDados("faseLua")}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#a855f7" />
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
          <p>🌙 {item.faseLua}</p>

          <button onClick={() => deletarPeixe(item.id)}>Excluir</button>
        </div>
      ))}
    </div>
  );
}