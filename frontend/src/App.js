import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SignIn from './SignIn';
import HomePage from './HomePage';
import Favorites from './Favorites';
import Navbar from './Navbar';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const storedAuthToken = localStorage.getItem("authToken");
    if (storedAuthToken) {
      setLoggedIn(true);
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
        <Routes>
          <Route path="/" element={<HomePage loggedIn={loggedIn} />} />
          <Route path="/signin" element={<SignIn setLoggedIn={setLoggedIn} />} />
          {loggedIn && <Route path="/favorites" element={<Favorites />} />}
        </Routes>
      </Router>
    </div>
  );
}

export default App;




