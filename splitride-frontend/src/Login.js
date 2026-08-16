import React, { useState } from 'react';

function Login() {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        const url = isLoginMode
            ? 'http://localhost:8080/api/users/login'
            : 'http://localhost:8080/api/users/register';

        const body = isLoginMode
            ? { email, password }
            : { name, email, password };

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
                } else {
                    setMessage('Registration successful! You can now log in.');
                    setIsLoginMode(true);
                }
            } else {
                setMessage(data.message || 'Something went wrong');
            }
        } catch (error) {
            setMessage('Could not connect to server');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h2>{isLoginMode ? 'Login' : 'Sign Up'}</h2>
            <form onSubmit={handleSubmit}>
                {!isLoginMode && (
                    <div>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                )}
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">{isLoginMode ? 'Login' : 'Sign Up'}</button>
            </form>
            <p onClick={() => setIsLoginMode(!isLoginMode)} style={{ cursor: 'pointer', color: 'blue' }}>
                {isLoginMode ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </p>
            {message && <p>{message}</p>}
        </div>
    );
}

export default Login;