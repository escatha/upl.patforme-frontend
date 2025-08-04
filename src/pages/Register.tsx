import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate, Link } from 'react-router-dom';
import './register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    matricule: '',
    password: '',
    role: 'student',
    faculty: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiClient.post('/auth/register', formData);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <img src="https://i.postimg.cc/mZwbqh7Z/1752262954454.jpg"alt="logo UPL" width="60" height="60" ></img>
        <h2 className="register-title">Inscription</h2>
      
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Inscription réussie ! Redirection...</p>}
        
        <form onSubmit={handleSubmit} className="register-form">
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nom complet</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="matricule" className="form-label">Matricule</label>
            <input
              id="matricule"
              name="matricule"
              type="text"
              className="form-input"
              value={formData.matricule}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role" className="form-label">Rôle</label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Étudiant</option>
              <option value="teacher">Professeur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="faculty" className="form-label">Faculté</label>
            <select
              id="faculty"
              name="faculty"
              className="form-select"
              value={formData.faculty}
              onChange={handleChange}
            >
              <option value="">choisir une  Faculté</option>
             <option value="Gestion">Gestion</option>
              <option value="informatique">informatique</option>
               
                  <option value= "Sciences de l'ingénieur"> Sciences de l'ingénieur</option>
                    <option value="Lettres et sciences humaines">Lettres et sciences humaines</option>
                      <option value="Sciences de la santé">Sciences de la santé</option>
                        <option value=  "Polytechnique">  Polytechnique</option>
                          <option value="Études de la Bible">Études de la Bible</option>
                            <option value="Agronomie">Agronomie</option>
                              <option value="Droit">Droit</option>
                                <option value= "Économie"> Économie</option>
            </select>                    
          </div>
          
          <button type="submit" className="submit-button">S'inscrire</button>
        </form>
        
        <div className="nav-link">
          Déjà inscrit ? <Link to="/">Connectez-vous</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;