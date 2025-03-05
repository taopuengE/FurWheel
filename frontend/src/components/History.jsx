import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './History.css';
import { FaUserCircle } from 'react-icons/fa';

function History() {
  const [payments, setPayments] = useState([]);
  const [cars, setCars] = useState({});
  const [rentals, setRentals] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage
  const username = user ? user.username : '';

  useEffect(() => {
    if (user && user.username) {
      setIsLoggedIn(true);
      setUserName(user.username); // Assuming the user object has a 'username' property
    }

    const fetchPayments = async () => {
      try {
        const response = await fetch('http://localhost:3001/payments');
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        const data = await response.json();
        console.log('Fetched payments:', data); // Log fetched payments
        // Filter payments to show only those where the logged-in user is the renter
        const userPayments = data.filter(payment => payment.renterUsername === username);
        setPayments(userPayments);

        // Fetch car details for each payment
        const carDetails = await Promise.all(userPayments.map(async (payment) => {
          try {
            const carResponse = await fetch(`http://localhost:3001/cars/${payment.carId}`);
            if (!carResponse.ok) {
              throw new Error(`Failed to fetch car details for car ID: ${payment.carId}`);
            }
            const carData = await carResponse.json();
            console.log('Fetched car details:', carData); // Log fetched car details
            return { carId: payment.carId, ...carData };
          } catch (error) {
            console.error(error.message);
            return null; // Return null for cars that couldn't be fetched
          }
        }));

        // Create a map of car details, excluding null values
        const carMap = carDetails.reduce((acc, car) => {
          if (car) {
            acc[car.carId] = car;
          }
          return acc;
        }, {});
        setCars(carMap);
      } catch (error) {
        console.error('Error fetching payments or car details:', error);
      }
    };

    const fetchRentals = async () => {
      try {
        const response = await fetch('http://localhost:3001/rentals');
        if (!response.ok) {
          throw new Error('Failed to fetch rentals');
        }
        const data = await response.json();
        setRentals(data);
      } catch (error) {
        console.error('Error fetching rentals:', error);
      }
    };

    fetchPayments();
    fetchRentals();
  }, [username]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleReturnCar = async (carId) => {
    try {
      const response = await fetch(`http://localhost:3001/cars/${carId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'กำลังดำเนินการ' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update car status');
      }

      const updatedCar = await response.json();
      setCars(cars => ({
        ...cars,
        [carId]: updatedCar,
      }));
    } catch (error) {
      console.error('Error updating car status:', error);
    }
  };

  const calculateReturnDate = (startDate, rentalDays) => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + rentalDays);
    return start.toLocaleDateString();
  };

  return (
    <div className="home-container">
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

      <div className="content-container">
        <div className="sidebar">
          <a href="/home">Home</a>
          <a href="/history">Order</a>
        </div>

        <div className="main-content">
          <div className="home-content">
            <h1>รายการเช่ารถ</h1>
            <div className="history-list">
              {payments.map((payment) => {
                const car = cars[payment.carId];
                const rental = rentals.find(rental => rental.carId === payment.carId);
                if (!car || car.status === 'available') return null; // Skip cars with status "available" or not loaded

                return (
                  <div key={payment._id} className="history-item">
                    <img src={`http://localhost:3001${car.image_path}`} alt={`${car.brand} ${car.model}`} className="car-image" />
                    <div className="car-details">
                      <h3>{car.brand} {car.model}</h3>
                      <p>ราคา: {car.price_per_day} บาท/วัน</p>
                      <p>สถานะ: {car.status}</p>
                      <p>จังหวัด: {car.province}</p>
                      {car.status === 'in use' && rental ? (
                        <>
                          <p>วันที่ต้องคืนรถ: {calculateReturnDate(rental.startDate, rental.rentalDays)}</p>
                          <button onClick={() => handleReturnCar(car.carId)}>คืนรถ</button>
                        </>
                      ) : (
                        <span>{car.status}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default History;