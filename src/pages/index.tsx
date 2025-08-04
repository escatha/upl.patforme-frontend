import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import "./index.css";

const faculties = [
  "Informatique",
  "Gestion",
  "Sciences de l'ingénieur",
  "Lettres et sciences humaines",
  "Sciences de la santé",
  "Polytechnique",
  "Études de la Bible",
  "Agronomie",
  "Droit",
  "Économie",
];

const Index: React.FC = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    matricule: "",
    password: "",
    role: "",
    faculty: "",
  });

  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await axios.post("http://localhost:3001/api/auth/login", {
        matricule: loginForm.matricule,
        password: loginForm.password,
        faculty: loginForm.faculty,
        role: loginForm.role,
      });

      const user = response.data.user;

      if (user.role !== loginForm.role) {
        setLoginError("Rôle incorrect pour cet utilisateur.");
        return;
      }

      setUser(user);

      const facSlug = user.faculty.toLowerCase().replace(/\s+/g, "-");
      navigate(`/dashboard/${facSlug}/${user.role}`);
    } catch (error: any) {
      console.error("Erreur de connexion :", error);
      const message =
        error.response?.data?.message || "Nom, mot de passe ou faculté incorrect.";
      setLoginError(message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="https://i.postimg.cc/mZwbqh7Z/1752262954454.jpg"alt="logo UPL" width="60" height="60" ></img>
          <h1 className="login-title">Connexion</h1>
          <p className="login-description">Accédez à votre espace personnel</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          {/* Rôle */}
          <div className="form-group">
            <label className="form-label">Rôle</label>
            <div className="form-select">
              <select
                value={loginForm.role}
                onChange={(e) => setLoginForm({...loginForm, role: e.target.value})}
                className="select-trigger"
                required
              >
                <option value="">Choisir un rôle</option>
                <option value="student">Étudiant</option>
                <option value="teacher">Professeur</option>
                <option value="admin">Administration</option>
              </select>
            </div>
          </div>

          {/* Faculté */}
          <div className="form-group">
            <label className="form-label">Faculté</label>
            <div className="form-select">
              <select
                value={loginForm.faculty}
                onChange={(e) => setLoginForm({...loginForm, faculty: e.target.value})}
                className="select-trigger"
                required
              >
                <option value="">Choisir une faculté</option>
                {faculties.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Matricule */}
          <div className="form-group">
            <label className="form-label">Matricule</label>
            <input
              type="text"
              className="form-input"
              value={loginForm.matricule}
              onChange={(e) => setLoginForm({...loginForm, matricule: e.target.value})}
              required
            />
          </div>

          {/* Mot de passe */}
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              required
            />
          </div>

          {/* Affichage erreur */}
          {loginError && <p className="error-message">{loginError}</p>}

          {/* Bouton de connexion */}
          <button type="submit" className="login-button">
            Se connecter
          </button>

          {/* Lien inscription */}
          <div className="login-link">
            <p>
              Pas encore de compte ?{" "}
              <Link to="/register">Créer un compte</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Index;