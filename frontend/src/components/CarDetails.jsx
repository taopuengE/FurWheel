import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CarDetails.css';

function CarDetails() {
    const { carId } = useParams();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3001/cars/${carId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch car details');
                }
                const data = await response.json();
                setCar(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching car details:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchCarDetails();
    }, [carId]);

    const handleRent = () => {
        navigate(`/uploaddocument/${carId}`);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="car-details-container">
            <h1>รายละเอียดรถ</h1>
            <div className="car-details-card">
                <img src={`http://localhost:3001${car.image_path}`} alt={`${car.brand} ${car.model}`} />
                <div className="car-details-info">
                    <h2>{car.brand} {car.model}</h2>
                    <p>ราคาต่อวัน: {car.price_per_day} บาท</p>
                    <p>ปีที่ผลิต: {car.year}</p>
                    <p>เลขไมล์: {car.mileage} กม.</p>
                    <p>รายละเอียด: {car.description}</p>
                    <p>สถานะ: {car.status === 'available' ? 'ว่าง' : `ถูกจองแล้ว`}</p>
                    {car.status === 'available' && (
                        <button onClick={handleRent}>จองรถ</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CarDetails;