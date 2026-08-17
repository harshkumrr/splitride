import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import RequestRide from './RequestRide';

function App() {
    const [page, setPage] = useState('login');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            setPage('request');
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setPage('request');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setPage('login');
    };

    return (
        <div className="App">
            <nav style={{ textAlign: 'center', margin: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {isLoggedIn ? (
                    <>
                        <button onClick={() => setPage('request')}>Request Ride</button>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <button onClick={() => setPage('login')}>Login</button>
                )}
            </nav>

            {!isLoggedIn && <Login onLoginSuccess={handleLoginSuccess} />}
            {isLoggedIn && page === 'request' && <RequestRide />}
        </div>
    );
}

export default App;