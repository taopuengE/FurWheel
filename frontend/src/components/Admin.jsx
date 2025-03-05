import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

function Admin() {
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBookings, setNewBookings] = useState([]);
  const [showCars, setShowCars] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showRentals, setShowRentals] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsResponse, usersResponse, rentalsResponse, paymentsResponse, ordersResponse] = await Promise.all([
          fetch('http://localhost:3001/cars'),
          fetch('http://localhost:3001/users'),
          fetch('http://localhost:3001/rentals'),
          fetch('http://localhost:3001/payments'),
          fetch('http://localhost:3001/orders'),
        ]);

        if (!carsResponse.ok || !usersResponse.ok || !rentalsResponse.ok || !paymentsResponse.ok || !ordersResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const carsData = await carsResponse.json();
        const usersData = await usersResponse.json();
        const rentalsData = await rentalsResponse.json();
        const paymentsData = await paymentsResponse.json();
        const ordersData = await ordersResponse.json();

        setCars(carsData);
        setUsers(usersData);
        setRentals(rentalsData);
        setPayments(paymentsData);
        setOrders(ordersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const checkNewBookings = async () => {
      try {
        const response = await fetch('http://localhost:3001/rentals');
        if (!response.ok) {
          throw new Error('Failed to fetch rentals');
        }
        const rentalsData = await response.json();
        const newBookings = rentalsData.filter(rental => !rentals.some(r => r._id === rental._id));
        if (newBookings.length > 0) {
          setNewBookings(newBookings);
        }
      } catch (error) {
        console.error('Error checking new bookings:', error);
      }
    };

    const intervalId = setInterval(checkNewBookings, 5000); // Check for new bookings every 5 seconds

    return () => clearInterval(intervalId);
  }, [rentals]);

  const handleDeleteCar = async (carId) => {
    try {
      const response = await fetch(`http://localhost:3001/cars/${carId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete car');
      }
      setCars(cars.filter(car => car._id !== carId));
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditCar = (car) => {
    navigate(`/edit-car/${car._id}`);
  };

  const handleRefund = async (carId) => {
    try {
      const response = await fetch('http://localhost:3001/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carId }),
      });
      if (!response.ok) {
        throw new Error('Failed to process refund');
      }
      // Update state after successful refund
      setRentals(rentals.filter(rental => rental.carId !== carId));
      setPayments(payments.filter(payment => payment.carId !== carId));
      setOrders(orders.filter(order => order.carId !== carId));
      setCars(cars.map(car => car._id === carId ? { ...car, status: 'available' } : car));
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // คำนวณจำนวนออเดอร์และยอดเงินทั้งหมด
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      <div className="summary-container">
        <div className="summary-box">
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>
        <div className="summary-box">
          <h3>Total Amount</h3>
          <p>{totalAmount} บาท</p>
        </div>
      </div>

      {newBookings.length > 0 && (
        <div className="notification">
          <p>New bookings available!</p>
          <button onClick={() => setNewBookings([])}>Dismiss</button>
        </div>
      )}

      <section>
        <h2 onClick={() => setShowCars(!showCars)} style={{ cursor: 'pointer' }}>
          Manage Cars {showCars ? '▲' : '▼'}
        </h2>
        {showCars && (
          <>
            <div className="button-group">
              <button onClick={() => navigate('/add-car')}>Add Car</button>
              <button onClick={() => navigate('/listing')}>Go to Listing</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Price per day</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car._id}>
                    <td>{car.brand}</td>
                    <td>{car.model}</td>
                    <td>{car.price_per_day} บาท</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEditCar(car)}>Edit</button>
                      <button onClick={() => handleDeleteCar(car._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <section>
        <h2 onClick={() => setShowUsers(!showUsers)} style={{ cursor: 'pointer' }}>
          Manage Users {showUsers ? '▲' : '▼'}
        </h2>
        {showUsers && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 onClick={() => setShowRentals(!showRentals)} style={{ cursor: 'pointer' }}>
          Rental Order {showRentals ? '▲' : '▼'}
        </h2>
        {showRentals && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Car</th>
                <th>Renter</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map(rental => {
                const payment = payments.find(payment => payment.carId === rental.carId);
                const renterUsername = payment ? payment.renterUsername : 'Unknown';
                return (
                  <tr key={rental._id}>
                    <td>{rental.carId}</td>
                    <td>{renterUsername}</td>
                    <td>{new Date(rental.startDate).toLocaleDateString()}</td>
                    <td>{new Date(rental.endDate).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 onClick={() => setShowPayments(!showPayments)} style={{ cursor: 'pointer' }}>
          Manage Payments {showPayments ? '▲' : '▼'}
        </h2>
        {showPayments && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Renter</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment._id}>
                  <td>{payment._id}</td>
                  <td>{payment.renterUsername}</td>
                  <td>{payment.amount} บาท</td>
                  <td>{payment.status}</td>
                  <td>
                    <button onClick={() => handleRefund(payment.carId)}>Refund</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Admin;