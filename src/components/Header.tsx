import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header style={{ padding: '10px', backgroundColor: '#0d5c8d', color: 'white' }}>
      <nav>
        <Link to="/" style={{ marginRight: 15, color: 'white' }}>Accueil</Link>
        <Link to="/login" style={{ marginRight: 15, color: 'white' }}>Connexion</Link>
        <Link to="/register" style={{ color: 'white' }}>Inscription</Link>
      </nav>
    </header>
  );
};

export default Header;
