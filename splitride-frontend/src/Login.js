import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        const url = isLoginMode
            ? 'http://localhost:8080/api/users/login'
            : 'http://localhost:8080/api/users/register';

        const body = isLoginMode ? { email, password } : { name, email, password };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                if (isLoginMode) {
                    localStorage.setItem('token', data.token);
                    setMessage('Login successful!');
                    if (onLoginSuccess) onLoginSuccess();
                } else {
                    setMessage('Account created. You can log in now.');
                    setIsLoginMode(true);
                }
            } else {
                setMessage(data.message || 'Something went wrong');
            }
        } catch (error) {
            setMessage('Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '13px 14px',
        marginBottom: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
    };

    return (
        <div style={{
            maxWidth: '380px',
            margin: '60px auto',
            padding: '32px',
            backgroundColor: 'white',
            borderRadius: '14px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            fontFamily: 'Arial, sans-serif',
        }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '22px', fontWeight: '700' }}>
                {isLoginMode ? 'Welcome back' : 'Create your account'}
            </h2>

            <form onSubmit={handleSubmit}>
                {!isLoginMode && (
                    <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                        required
                    />
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '13px',
                        backgroundColor: '#111',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '4px',
                    }}
                >
                    {loading ? 'Please wait...' : isLoginMode ? 'Log in' : 'Sign up'}
                </button>
            </form>

            <p
                onClick={() => setIsLoginMode(!isLoginMode)}
                style={{
                    textAlign: 'center',
                    marginTop: '18px',
                    fontSize: '13px',
                    color: '#666',
                    cursor: 'pointer',
                }}
            >
                {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
                <span style={{ color: '#111', fontWeight: '600' }}>
          {isLoginMode ? 'Sign up' : 'Log in'}
        </span>
            </p>

            {message && (
                <p style={{
                    textAlign: 'center',
                    fontSize: '13px',
                    marginTop: '12px',
                    color: message.includes('successful') || message.includes('created') ? '#2e7d32' : '#c0392b',
                }}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default Login;