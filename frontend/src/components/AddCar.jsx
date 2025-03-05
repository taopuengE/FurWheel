import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddCar.css';

function AddCar() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [province, setProvince] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes-Benz'];
  const models = {
    Toyota: ['Corolla', 'Camry', 'Yaris'],
    Honda: ['Civic', 'Accord', 'CR-V'],
    Ford: ['Mustang', 'Focus', 'Ranger'],
    BMW: ['X5', '3 Series', '5 Series'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC'],
  };

  const provinces = [
    'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'พะเยา', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อุดรธานี', 'อุทัยธานี', 'อุตรดิตถ์', 'อุบลราชธานี', 'อำนาจเจริญ'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brand || !model || !pricePerDay || !image || !description || !year || !mileage || !province) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (isNaN(pricePerDay) || pricePerDay <= 0) {
      alert('กรุณากรอกราคาเป็นตัวเลขและมากกว่า 0');
      return;
    }

    if (isNaN(year) || year <= 0) {
      alert('กรุณากรอกปีเป็นตัวเลขและมากกว่า 0');
      return;
    }

    if (isNaN(mileage) || mileage <= 0) {
      alert('กรุณากรอกเลขไมล์เป็นตัวเลขและมากกว่า 0');
      return;
    }

    const formData = new FormData();
    formData.append('brand', brand);
    formData.append('model', model);
    formData.append('price_per_day', pricePerDay);
    formData.append('image', image);
    formData.append('description', description); // Include description
    formData.append('year', year); // Include year
    formData.append('mileage', mileage); // Include mileage
    formData.append('province', province); // Include province

    try {
      const response = await fetch('http://localhost:3001/cars', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert('เพิ่มรถสำเร็จ!');
        navigate('/admin'); // Navigate to admin page after successful addition
      } else {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการเพิ่มรถ');
      }
    } catch (error) {
      console.error('❌ ข้อผิดพลาด:', error);
      alert(error.message);
    }
  };

  return (
    <div className="add-car-container">
      <h2>เพิ่มรถ</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(''); }} required>
          <option value="">เลือกยี่ห้อรถ</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        <select value={model} onChange={(e) => setModel(e.target.value)} required disabled={!brand}>
          <option value="">เลือกรุ่นรถ</option>
          {brand && models[brand].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        <input type="number" placeholder="ราคาต่อวัน (บาท)" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required />

        <textarea placeholder="รายละเอียดรถ" value={description} onChange={(e) => setDescription(e.target.value)} required />

        <input type="number" placeholder="ปีที่ผลิต" value={year} onChange={(e) => setYear(e.target.value)} required />

        <input type="number" placeholder="เลขไมล์ (กม.)" value={mileage} onChange={(e) => setMileage(e.target.value)} required />

        <select value={province} onChange={(e) => setProvince(e.target.value)} required>
          <option value="">เลือกจังหวัด</option>
          {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* อัปโหลดรูปภาพ */}
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />

        <button type="submit">เพิ่มรถ</button>
      </form>
    </div>
  );
}

export default AddCar;