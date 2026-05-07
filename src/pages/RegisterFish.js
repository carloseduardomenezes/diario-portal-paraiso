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

  // 🌙 LUA ULTRA PRECISA (8 fases)
  const getFaseLua = (d, m, a) => {
    const year = parseInt(a);
    const month = parseInt(m);
    const day = parseInt(d);

    const c = Math.floor((14 - month) / 12);
    const y = year - c;
    const mo = month + 12 * c - 2;

    const jd =
      day +
      Math.floor((153 * mo + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;

    const daysSinceNew = jd - 2451550.1;
    const newMoons = daysSinceNew / 29.53058867;
    const phase = (newMoons - Math.floor(newMoons)) * 29.53058867;

    if (phase < 1.84566) return "Nova";
    if (phase < 5.53699) return "Crescente";
    if (phase < 9.22831) return "Quarto Crescente";
    if (phase < 12.91963) return "Gibosa Crescente";
    if (phase < 16.61096) return "Cheia";
    if (phase < 20.30228) return "Gibosa Minguante";
    if (phase < 23.99361) return "Quarto Minguante";
    if (phase < 27.68493) return "Minguante";

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

  // 🔥 BUSCA CORRIGIDA
  const buscarPeixes = useCallback(async () => {
    if (!user?.uid) return;

    const dados = await getDocs(collection(db, "peixes"));

    const lista = dados.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item) => item.uid === user.uid);

    setListaPeixes(lista);
  }, [user?.uid]);

  // 🔥 USEEFFECT CORRIGIDO (ESSENCIAL)
  useEffect(() => {
    if (!user?.uid) return;
    buscarPeixes();
  }, [user?.uid, buscarPeixes]);

  const salvar = async () => {
    if (!especie || !peso || !hora || !isca || !dia || !mes || !ano) {
      alert("Preencha tudo!");
      return;
    }

    let fotoComprimida = null;

    if (foto) {
      fotoComprimida = await comprimirImagem(foto);
    }

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

  // 🔍 FILTRO CORRIGIDO
  const peixesVisiveis =
    filtroEspecie === ""
      ? listaPeixes
      : listaPeixes.filter(
          (p) =>
            (p.especie || "").trim().toLowerCase() ===
            (filtroEspecie || "").trim().toLowerCase()
        );

  const totalPeixes = peixesVisiveis.length;

  const gerarDados = (campo) => {
    const contagem = {};

    peixesVisiveis.forEach((p) => {
      let chave = p[campo];
      if (!chave) return;

      if (campo === "hora") {
        const [h, m] = p.hora.split(":").map(Number);

        // 🔥 FIX DA STRING
        chave = `${h.toString().padStart(2, "0")}:${m < 30 ? "00" : "30"}`;
      }

      if (campo === "mes") {
        const nomes = [
          "Jan","Fev","Mar","Abr","Mai","Jun",
          "Jul","Ago","Set","Out","Nov","Dez"
        ];

        chave = nomes[p.mes - 1];
      }

      contagem[chave] = (contagem[chave] || 0) + 1;
    });

    return Object.entries(contagem).map(([name, value]) => ({
      name,
      value
    }));
  };

  const especiesUnicas = [
    ...new Set(listaPeixes.map((p) => p.especie))
  ];

  const dadosHora = gerarDados("hora");

  const maxValor =
    dadosHora.length > 0
      ? Math.max(...dadosHora.map((d) => d.value))
      : 0;

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

      {/* FILTRO */}
      <div>
        <h3>🔍 Filtrar espécie</h3>

        <select
          value={filtroEspecie}
          onChange={(e) => setFiltroEspecie(e.target.value)}
        >
          <option value="">🐟 Geral ({listaPeixes.length})</option>

          {especiesUnicas.map((esp) => (
            <option key={esp} value={esp}>
              {esp}
            </option>
          ))}
        </select>

        <h2>🐟 Capturas: {totalPeixes}</h2>
      </div>

      <hr />

      {/* LISTA */}
      {peixesVisiveis.map((item) => (
        <div key={item.id} style={{ padding: 10, border: "1px solid #ddd", marginBottom: 10 }}>
          <p>🐟 {item.especie}</p>
          <p>⚖️ {item.peso}</p>
          <p>🎣 {item.isca}</p>
          <p>📅 {item.dia}/{item.mes}/{item.ano}</p>

          <button onClick={() => deletarPeixe(item.id)}>
            Excluir
          </button>
        </div>
      ))}
    </div>
  );
}