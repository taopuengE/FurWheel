import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("📩 กำลังส่ง:", formData);

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("📥 คำตอบจากเซิร์ฟเวอร์:", data);

      if (response.ok) {
        alert('เข้าสู่ระบบสำเร็จ!');
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/home');
      } else {
        throw new Error(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error("❌ ข้อผิดพลาด:", error);
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h2>เข้าสู่ระบบ</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="email" name="email" placeholder="อีเมล์" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="รหัสผ่าน" value={formData.password} onChange={handleChange} required />
          <button type="submit">เข้าสู่ระบบ</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
