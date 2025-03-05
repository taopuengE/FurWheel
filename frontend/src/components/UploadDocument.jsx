import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UploadDocument.css';

function UploadDocument() {
    const { carId } = useParams();
    const [file, setFile] = useState(null);
    const [rentalDays, setRentalDays] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleRentalDaysChange = (e) => {
        setRentalDays(e.target.value);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('กรุณาเลือกไฟล์เพื่ออัปโหลด');
            return;
        }

        if (!rentalDays) {
            alert('กรุณาใส่จำนวนวันในการเช่า');
            return;
        }

        const formData = new FormData();
        formData.append('document', file);
        formData.append('carId', carId);
        formData.append('rentalDays', rentalDays);

        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('อัปโหลดเอกสารสำเร็จ!');
                navigate(`/payment/${carId}`);
            } else {
                const errorText = await response.text();
                console.error('❌ ข้อผิดพลาดในการอัปโหลดเอกสาร:', errorText);
                alert('เกิดข้อผิดพลาดในการอัปโหลดเอกสาร');
            }
        } catch (error) {
            console.error('❌ ข้อผิดพลาด:', error);
            alert('เกิดข้อผิดพลาดในการอัปโหลดเอกสาร');
        }
    };

    return (
        <div className="upload-document-container">
            <h1>อัปโหลดเอกสาร</h1>
            <div className="form-group">
                <label htmlFor="document">อัปโหลดรูปบัตรประชาชนหรือใบขับขี่:</label>
                <input type="file" id="document" onChange={handleFileChange} />
            </div>
            <div className="form-group">
                <label htmlFor="rentalDays">จำนวนวันในการเช่า:</label>
                <input
                    type="number"
                    id="rentalDays"
                    value={rentalDays}
                    onChange={handleRentalDaysChange}
                    min="1"
                />
            </div>
            <button onClick={handleUpload}>อัปโหลด</button>
        </div>
    );
}

export default UploadDocument;