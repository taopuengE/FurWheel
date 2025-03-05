import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import rentCarButton from '../assets/rentCarButton.png'; // นำเข้ารูปภาพปุ่ม

function Home() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.username) {
      setIsLoggedIn(true);
      setUserName(user.username); // Assuming the user object has a 'username' property
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <div className="navbar">
        <h1>FurWheel</h1>
        <div className="account-container">
          {isLoggedIn && <span className="user-name">{userName}</span>}
          <FaUserCircle size={30} className="account-icon" onClick={toggleMenu} />
          {showMenu && (
            <div className="dropdown-menu">
              {isLoggedIn ? (
                <>
                  <button onClick={() => navigate('/history')}>รายการเช่า</button>
                  <button onClick={handleLogout}>ออกจากระบบ</button>
                </>
              ) : (
                <button onClick={() => navigate('/login')}>เข้าสู่ระบบ</button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="sidebar">
        <a href="/home">Home</a>
        <a href="/history">Order</a>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="home-content">
          <div className="button-group">
            <img
              src={rentCarButton}
              alt="Rent a Car"
              className="rent-car-button"
              onClick={() => navigate('/rent')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;