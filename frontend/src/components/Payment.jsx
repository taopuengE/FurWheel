import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Payment.css';

function Payment() {
    const { carId } = useParams();
    const [file, setFile] = useState(null);
    const [ownerUsername, setOwnerUsername] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [rentalDays, setRentalDays] = useState(0);
    const [pricePerDay, setPricePerDay] = useState(0);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user')); // Get user from localStorage
    const renterUsername = user ? user.username : '';

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3001/cars/${carId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch car details');
                }
                const data = await response.json();
                setOwnerUsername(data.username);
                setPricePerDay(data.price_per_day);
            } catch (error) {
                console.error('Error fetching car details:', error);
            }
        };

        const fetchRentalDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3001/rentals/${carId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch rental details');
                }
                const data = await response.json();
                setRentalDays(data.rentalDays);
            } catch (error) {
                console.error('Error fetching rental details:', error);
            }
        };

        fetchCarDetails();
        fetchRentalDetails();
    }, [carId]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handlePayment = async () => {
        if (paymentMethod === 'bank_transfer' && !file) {
            alert('กรุณาแนบสลิปโอนเงิน');
            return;
        }

        const totalPrice = pricePerDay * rentalDays;

        const formData = new FormData();
        formData.append('carId', carId);
        formData.append('renterUsername', renterUsername);
        formData.append('ownerUsername', ownerUsername);
        formData.append('paymentMethod', paymentMethod);
        formData.append('amount', totalPrice); // เพิ่ม amount
        if (paymentMethod === 'bank_transfer') {
            formData.append('slip', file);
        }

        try {
            const response = await fetch('http://localhost:3001/payments', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                // Update car status to 'กำลังตรวจสอบเอกสาร'
                await fetch(`http://localhost:3001/cars/${carId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'กำลังตรวจสอบเอกสาร' }),
                });

                // เพิ่มข้อมูลการสั่งซื้อ
                await fetch('http://localhost:3001/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        carId,
                        renterUsername,
                        amount: totalPrice,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000),
                        rentalDays,
                    }),
                });

                alert('ชำระเงินสำเร็จ!');
                navigate('/home'); // Navigate to home page after successful payment
            } else {
                throw new Error(data.message || 'เกิดข้อผิดพลาดในการชำระเงิน');
            }
        } catch (error) {
            console.error('❌ ข้อผิดพลาด:', error);
            alert(error.message);
        }
    };

    const totalPrice = pricePerDay * rentalDays;

    return (
        <div className="payment-container">
            <h1>ชำระเงิน</h1>
            <p>คุณกำลังชำระเงินสำหรับรถ ID: {carId}</p>
            <p>จำนวนวันที่เช่า: {rentalDays} วัน</p>
            <p>ราคาต่อวัน: {pricePerDay} บาท</p>
            <p>จำนวนเงินที่ต้องจ่าย: {totalPrice} บาท</p>
            <div className="payment-method-container">
                <label htmlFor="payment-method">เลือกวิธีการชำระเงิน:</label>
                <select
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                >
                    <option value="">-- เลือกวิธีการชำระเงิน --</option>
                    <option value="bank_transfer">โอนเงินผ่านธนาคาร</option>
                    <option value="cash">เงินสด</option>
                </select>
            </div>

            {paymentMethod === 'bank_transfer' && (
                <div className="bank-transfer-container">
                    <div className="qr-code-container">
                        <img
                            src="https://cdn.discordapp.com/attachments/944607431424622694/1345402720718160016/1345402537141997598remix-1740839400784.png?ex=67c46b6c&is=67c319ec&hm=4cc192f01cedb48ebe4f32c8516ddc5e4e903ef1bfa6336ab61ce987ca076d72&fbclid=IwZXh0bgNhZW0CMTEAAR1QipRM8L5uXMxMpk6ey-uqlnndXHkTLZq_lY1jMwMiG_wN8wFKDqB9JH4_aem_pDtmPdtDg23yyClAIAP4sw"
                            alt="QR Code"
                            className="qr-code"
                        />
                        <p>สแกนคิวอาร์โค้ดเพื่อชำระเงิน</p>
                    </div>
                    <div className="file-upload-container">
                        <label htmlFor="payment-slip">แนบสลิปโอนเงิน:</label>
                        <input type="file" id="payment-slip" accept="image/*" onChange={handleFileChange} />
                    </div>
                </div>
            )}

            <button onClick={handlePayment}>ชำระเงิน</button>
        </div>
    );
}

export default Payment;