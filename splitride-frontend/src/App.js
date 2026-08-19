import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import RequestRide from './RequestRide';
import GroupView from './GroupView';

function App() {
    const [page, setPage] = useState('login');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeGroupId, setActiveGroupId] = useState(null);

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
        setActiveGroupId(null);
        setPage('login');
    };

    const handleRideRequested = (groupId) => {
        setActiveGroupId(groupId);
        setPage('group');
    };

    const navButtonStyle = (active) => ({
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: '600',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: active ? '#111' : 'transparent',
        color: active ? 'white' : '#555',
    });

    return (
        <div className="App" style={{ fontFamily: 'Arial, sans-serif' }}>
            <nav style={{
                display: 'flex', justifyContent: 'center', gap: '6px',
                margin: '20px auto', padding: '6px', maxWidth: '360px',
                backgroundColor: '#f2f2f2', borderRadius: '10px',
            }}>
                {isLoggedIn ? (
                    <>
                        <button style={navButtonStyle(page === 'request')} onClick={() => setPage('request')}>Request Ride</button>
                        {activeGroupId && (
                            <button style={navButtonStyle(page === 'group')} onClick={() => setPage('group')}>My Group</button>
                        )}
                        <button style={navButtonStyle(false)} onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <button style={navButtonStyle(true)} onClick={() => setPage('login')}>Login</button>
                )}
            </nav>

            {!isLoggedIn && <Login onLoginSuccess={handleLoginSuccess} />}
            {isLoggedIn && page === 'request' && <RequestRide onRideRequested={handleRideRequested} />}
            {isLoggedIn && page === 'group' && <GroupView groupId={activeGroupId} />}
        </div>
    );
}

export default App;