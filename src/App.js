import { useState } from "react";
import Login from "./pages/Login";
import RegisterFish from "./pages/RegisterFish";

export default function App() {
  const [user, setUser] = useState(null);

  // 🔐 se não estiver logado, mostra login
  if (!user) {
    return <Login setUser={setUser} />;
  }

  // 🎣 depois do login entra no app
  return <RegisterFish user={user} />;
}