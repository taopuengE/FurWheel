import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import AddCar from './components/AddCar';
import EditCar from './components/EditCar';
import RentCar from './components/RentCar';
import CarDetails from './components/CarDetails';
import Payment from './components/Payment';
import History from './components/History';
import UploadDocument from './components/UploadDocument';
import Admin from './components/Admin';
import Listing from './components/Listing'; // Import the Listing component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/add-car" element={<AddCar />} />
                <Route path="/edit-car/:carId" element={<EditCar />} />
                <Route path="/rent" element={<RentCar />} />
                <Route path="/car-details/:carId" element={<CarDetails />} />
                <Route path="/payment/:carId" element={<Payment />} />
                <Route path="/home" element={<Home />} />
                <Route path="/history" element={<History />} />
                <Route path="/uploaddocument/:carId" element={<UploadDocument />} /> {/* แก้ไขเส้นทางนี้ */}
                <Route path="/admin" element={<Admin />} />
                <Route path="/listing" element={<Listing />} /> {/* Add this line */}
            </Routes>
        </Router>
    );
}

export default App;
