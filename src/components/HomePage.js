import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const HomePage = () => {
  const navigate = useNavigate();

  const baseUrl = window.location.origin;
  const formUrl = `${baseUrl}/feedback`;
// const formUrl = 'http://192.168.0.121:3000/feedback'; // LOCAL URL for mobile testing

  return (
    <div className="container py-5">
      <div className="text-center">
        <h1 className="fw-bold  mb-4" style={{ color: "#0A2362" }}>Ahilyanagar Police Feedback</h1>
        <p className="lead text-secondary">We value your opinion! Help us improve policing by submitting your feedback.</p>

        <button
  className="btn mt-4 px-4 py-2 fw-semibold"
  onClick={() => navigate('/feedback')}
  style={{
    color: "#0A2362",        // Text color
    borderColor: "#0A2362",  // Border color
  }}
>
  Give Feedback
</button>

        <div className="mt-5">
          <p className="text-muted">Or scan this QR Code:</p>
          <div className="d-flex justify-content-center">
            <QRCodeCanvas value={formUrl} size={180} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
