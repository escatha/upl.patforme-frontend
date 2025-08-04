import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../contexts/UserContext";

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();

  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [faculty, setFaculty] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Tentative de login :", { matricule, password, faculty });
      const response = await axios.post("http://localhost:3001/api/auth/login", {
        
        matricule,
        password,
        faculty,
      });

      const { user, token } = response.data;

      if (user && user.role && user.faculty) {
        login(user);
        const cleanFaculty = user.faculty.toLowerCase().replace(/\s+/g, "-");
        navigate(`/dashboard/${cleanFaculty}/${user.role}`);
      }
    } catch (err) {
      console.error("Erreur de connexion :", err);
      alert("Identifiants incorrects ou utilisateur introuvable.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Matricule"
        value={matricule}
        onChange={(e) => setMatricule(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Faculté"
        value={faculty}
        onChange={(e) => setFaculty(e.target.value)}
        required
      />
      <button type="submit">Connexion</button>
    </form>
  );
};

export default Login;