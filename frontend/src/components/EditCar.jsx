import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditCar.css';

function EditCar() {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [details, setDetails] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [file, setFile] = useState(null);
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
        setDetails(data.details);
        setPricePerDay(data.price_per_day);
      } catch (error) {
        console.error('Error fetching car details:', error);
      }
    };

    fetchCarDetails();
  }, [carId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('details', details);
    formData.append('price_per_day', pricePerDay);
    if (file) {
      formData.append('image', file);
    }

    try {
      const response = await fetch(`http://localhost:3001/cars/${carId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        alert('Car updated successfully!');
        navigate('/admin');
      } else {
        throw new Error('Failed to update car');
      }
    } catch (error) {
      console.error('Error updating car:', error);
      alert(error.message);
    }
  };

  if (!car) {
    return <p>Loading...</p>;
  }

  return (
    <div className="edit-car-container">
      <h1>Edit Car</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="brand">Brand</label>
          <input
            type="text"
            id="brand"
            value={car.brand}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="model">Model</label>
          <input
            type="text"
            id="model"
            value={car.model}
            disabled
          />
        </div>
        <div className="form-group">
          <label htmlFor="details">Details</label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="price_per_day">Price per day</label>
          <input
            type="number"
            id="price_per_day"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Upload Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <button type="submit">Update Car</button>
      </form>
    </div>
  );
}

export default EditCar;