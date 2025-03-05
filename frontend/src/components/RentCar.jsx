import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RentCar.css';

function RentCar() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchBrand, setSearchBrand] = useState('');
    const [searchModel, setSearchModel] = useState('');
    const [searchPrice, setSearchPrice] = useState('');
    const [searchProvince, setSearchProvince] = useState('');
    const navigate = useNavigate();

    // Check if user is logged in
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('กรุณาสมัครสมาชิกหรือเข้าสู่ระบบก่อนเช่ารถ');
            navigate('/register');
        }
    }, [navigate]);

    // Fetch car data from API
    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await fetch('http://localhost:3001/cars');
                if (!response.ok) {
                    throw new Error('Failed to fetch cars');
                }
                const data = await response.json();
                setCars(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching cars:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchCars();
    }, []);

    // Get unique brands and models for the select options
    const uniqueBrands = [...new Set(cars.map(car => car.brand))];
    const uniqueModels = [...new Set(cars.map(car => car.model))];
    const uniqueProvinces = [...new Set(cars.map(car => car.province))];

    // Filter cars based on search criteria and availability
    const filteredCars = cars.filter((car) => {
        return (
            car.status === 'available' && // Filter only available cars
            (searchBrand === '' || car.brand === searchBrand) &&
            (searchModel === '' || car.model === searchModel) &&
            (searchProvince === '' || car.province === searchProvince) &&
            (searchPrice === '' || car.price_per_day <= parseInt(searchPrice))
        );
    });

    // Handle car rental
    const handleRent = (carId) => {
        navigate(`/car-details/${carId}`);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="rent-car-container">
            <h1>รายการรถให้เช่า</h1>

            {/* Search fields */}
            <div className="search-container">
                <select value={searchBrand} onChange={(e) => setSearchBrand(e.target.value)}>
                    <option value="">เลือกยี่ห้อรถ</option>
                    {uniqueBrands.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                    ))}
                </select>
                <select value={searchModel} onChange={(e) => setSearchModel(e.target.value)}>
                    <option value="">เลือกรุ่นรถ</option>
                    {uniqueModels.map((model) => (
                        <option key={model} value={model}>{model}</option>
                    ))}
                </select>
                <select value={searchProvince} onChange={(e) => setSearchProvince(e.target.value)}>
                    <option value="">เลือกจังหวัด</option>
                    {uniqueProvinces.map((province) => (
                        <option key={province} value={province}>{province}</option>
                    ))}
                </select>
                <input
                    type="number"
                    placeholder="ราคาสูงสุด (บาท)"
                    value={searchPrice}
                    onChange={(e) => setSearchPrice(e.target.value)}
                />
            </div>

            {/* Car list */}
            <div className="car-list">
                {filteredCars.map((car) => (
                    <div key={car._id} className="car-card" onClick={() => handleRent(car._id)}>
                        <img src={`http://localhost:3001${car.image_path}`} alt={`${car.brand} ${car.model}`} />
                        <div className="car-details">
                            <h2>{car.brand} {car.model}</h2>
                            <p>ราคาต่อวัน: {car.price_per_day} บาท</p>
                            <p>สถานะ: {car.status === 'available' ? 'ว่าง' : 'ถูกจองแล้ว'}</p>
                            <p>จังหวัด: {car.province}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RentCar;