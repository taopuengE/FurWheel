import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 ข้อมูลที่ส่งไป:', formData);

    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert('สมัครสมาชิกสำเร็จ');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <h2>สมัครสมาชิก</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="ชื่อผู้ใช้" value={formData.username} onChange={handleChange} required />
          <input type="email" name="email" placeholder="อีเมล์" value={formData.email} onChange={handleChange} required />
          <input type="text" name="phone" placeholder="เบอร์โทร" value={formData.phone} onChange={handleChange} required />
          <input type="password" name="password" placeholder="รหัสผ่าน" value={formData.password} onChange={handleChange} required />
          <button type="submit">สมัครสมาชิก</button>
        </form>
        <p>มีบัญชีอยู่แล้ว? <a href="/login">เข้าสู่ระบบ</a></p>
      </div>
    </div>
  );
}

export default Register;