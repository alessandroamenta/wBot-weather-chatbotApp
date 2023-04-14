import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ loggedIn, setLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // perform logout logic here
    setLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>
        {loggedIn && (
          <li className="nav-item">
            <Link to="/favorites" className="nav-link">
              Favorites
            </Link>
          </li>
        )}
      </ul>
      <div className="navbar-buttons">
        {loggedIn ? (
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/signin">
            <button className="login-button">Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;


