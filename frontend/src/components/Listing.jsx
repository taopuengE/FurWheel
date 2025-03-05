import { useState, useEffect } from 'react';
import './Listing.css';

function Listing() {
  const [cars, setCars] = useState([]);
  const [payments, setPayments] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [selectedRenter, setSelectedRenter] = useState(null);
  const [renterDetails, setRenterDetails] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage
  const username = user ? user.username : '';

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const carsResponse = await fetch('http://localhost:3001/cars');
        const carsData = await carsResponse.json();
        setCars(carsData);
      } catch (error) {
        console.error('❌ ข้อผิดพลาด:', error);
      }
    };

    const fetchPayments = async () => {
      try {
        const paymentsResponse = await fetch('http://localhost:3001/payments');
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      } catch (error) {
        console.error('❌ ข้อผิดพลาดในการดึงข้อมูลการชำระเงิน:', error);
      }
    };

    const fetchRentals = async () => {
      try {
        const rentalsResponse = await fetch('http://localhost:3001/rentals');
        const rentalsData = await rentalsResponse.json();
        setRentals(rentalsData);
      } catch (error) {
        console.error('❌ ข้อผิดพลาดในการดึงข้อมูลการเช่า:', error);
      }
    };

    fetchCars();
    fetchPayments();
    fetchRentals();
  }, []);

  const handleSetInUse = async (carId) => {
    try {
      const response = await fetch(`http://localhost:3001/cars/${carId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'in use' }),
      });

      if (response.ok) {
        const updatedCar = await response.json();
        setCars(cars.map(car => car._id === carId ? { ...car, status: updatedCar.status } : car));
      } else {
        const errorText = await response.text();
        console.error('❌ ข้อผิดพลาดในการเปลี่ยนสถานะรถ:', errorText);
      }
    } catch (error) {
      console.error('❌ ข้อผิดพลาด:', error);
    }
  };

  const handleConfirmReturn = async (carId) => {
    try {
      const response = await fetch(`http://localhost:3001/cars/${carId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'available' }),
      });

      if (response.ok) {
        const updatedCar = await response.json();
        setCars(cars.map(car => car._id === carId ? { ...car, status: updatedCar.status } : car));

        // ลบการจองใน payments และ rentals
        await fetch(`http://localhost:3001/bookings/${carId}`, {
          method: 'DELETE',
        });

        // อัปเดตสถานะใน frontend
        setPayments(payments.filter(payment => payment.carId !== carId));
        setRentals(rentals.filter(rental => rental.carId !== carId));
      } else {
        const errorText = await response.text();
        console.error('❌ ข้อผิดพลาดในการเปลี่ยนสถานะรถ:', errorText);
      }
    } catch (error) {
      console.error('❌ ข้อผิดพลาด:', error);
    }
  };

  const handleConfirmProcessing = async (carId) => {
    try {
      const response = await fetch(`http://localhost:3001/cars/${carId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'available' }),
      });

      if (response.ok) {
        const updatedCar = await response.json();
        setCars(cars.map(car => car._id === carId ? { ...car, status: updatedCar.status } : car));

        // ลบการจองใน payments และ rentals
        await fetch(`http://localhost:3001/bookings/${carId}`, {
          method: 'DELETE',
        });

        // อัปเดตสถานะใน frontend
        setPayments(payments.filter(payment => payment.carId !== carId));
        setRentals(rentals.filter(rental => rental.carId !== carId));
      } else {
        const errorText = await response.text();
        console.error('❌ ข้อผิดพลาดในการเปลี่ยนสถานะรถ:', errorText);
      }
    } catch (error) {
      console.error('❌ ข้อผิดพลาด:', error);
    }
  };

  const handleConfirmDocument = async (carId) => {
    try {
      const response = await fetch(`http://localhost:3001/cars/${carId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'in use' }),
      });

      if (response.ok) {
        const updatedCar = await response.json();
        setCars(cars.map(car => car._id === carId ? { ...car, status: updatedCar.status } : car));
      } else {
        const errorText = await response.text();
        console.error('❌ ข้อผิดพลาดในการเปลี่ยนสถานะรถ:', errorText);
      }
    } catch (error) {
      console.error('❌ ข้อผิดพลาด:', error);
    }
  };

  const handleContactRenter = async (renterUsername) => {
    try {
      const response = await fetch(`http://localhost:3001/users/${renterUsername}`);
      if (!response.ok) {
        throw new Error('Failed to fetch renter details');
      }
      const renterData = await response.json();
      setRenterDetails(renterData);
      setSelectedRenter(renterUsername);
    } catch (error) {
      console.error('❌ ข้อผิดพลาดในการดึงข้อมูลผู้เช่า:', error);
    }
  };

  return (
    <div className="listing-container">
      <h2>รายการรถทั้งหมด</h2>
      <div className="car-list">
        {cars.map((car) => {
          const payment = payments.find(payment => payment.carId === car._id);
          const rental = rentals.find(rental => rental.carId === car._id);
          return (
            <div key={car._id} className="car-card">
              <img src={`http://localhost:3001${car.image_path}`} alt={`${car.brand} ${car.model}`} />
              <div className="car-details">
                <h3>{car.brand} {car.model}</h3>
                <p>ราคา: {car.price_per_day} บาท/วัน</p>
                <p>สถานะ: {car.status}</p>
                {car.status !== 'available' && <p>ผู้ใช้: {payment ? payment.renterUsername : car.username}</p>}
                {car.status === 'booked' && (
                  <>
                    {payment && payment.paymentMethod === 'bank_transfer' && (
                      <p><a href={`http://localhost:3001${payment.slip}`} target="_blank" rel="noopener noreferrer">ดูสลิป</a></p>
                    )}
                    <button onClick={() => handleSetInUse(car._id)}>ยืนยัน</button>
                  </>
                )}
                {car.status === 'รอดำเนินการ' && (
                  <button onClick={() => handleConfirmReturn(car._id)}>ยืนยันการรับรถ</button>
                )}
                {car.status === 'กำลังดำเนินการ' && (
                  <button onClick={() => handleConfirmProcessing(car._id)}>ยืนยันการส่งคืน</button>
                )}
                {car.status === 'กำลังตรวจสอบเอกสาร' && (
                  <>
                    {payment && rental && (
                      <>
                        {payment.paymentMethod === 'bank_transfer' && (
                          <p><a href={`http://localhost:3001${payment.slip}`} target="_blank" rel="noopener noreferrer">ดูสลิป</a></p>
                        )}
                        <p><a href={`http://localhost:3001${rental.documentPath}`} target="_blank" rel="noopener noreferrer">ดูเอกสาร</a></p>
                      </>
                    )}
                    <button onClick={() => handleConfirmDocument(car._id)}>ยืนยัน</button>
                  </>
                )}
                {car.status === 'in use' && (
                  <button onClick={() => handleContactRenter(payment.renterUsername)}>ติดต่อ</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {selectedRenter && renterDetails && (
        <div className="renter-details">
          <h3>ข้อมูลผู้เช่า</h3>
          <p>ชื่อผู้ใช้: {renterDetails.username}</p>
          <p>อีเมล: {renterDetails.email}</p>
          <p>เบอร์ติดต่อ: {renterDetails.phone}</p>
          <button onClick={() => setSelectedRenter(null)}>ปิด</button>
        </div>
      )}
    </div>
  );
}

export default Listing;