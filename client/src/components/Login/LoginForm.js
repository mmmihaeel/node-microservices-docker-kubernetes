import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import './LoginForm.css';

function LoginForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            fetch('http://localhost:1778/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization: 'Bearer abc',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            })
                .then(async function (response) {
                    if (response.status !== 201) {
                        const message = await response.json();
                        throw new Error(message.message)
                    }
                    return response.json();
                })
                .then(function (resData) {
                    console.log('Form submitted:', resData);
                    const date = new Date();
                    date.setHours(date.getHours() + 10);
                    document.cookie =
                        'token=' + resData.token + '; expires=' + date.toUTCString() + '; path=/'
                    document.cookie =
                        'userId=' +
                        resData.userId +
                        '; expires=' +
                        date.toUTCString() +
                        '; path=/'
                    navigate('/', { replace: true })
                }).catch(error => {
                    console.log('Error:', error);
                    setError(error.message);
                });
        } else {
            console.log('Form validation failed');
        }
    };

    return (
        <div className="custom-login-form">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="custom-form-control">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                <div className="custom-form-control">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
                <button type="submit">Login</button>
                {error && <div className="error-message">{error}</div>}
            </form>
            <p className="signup-link">
                Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
        </div>
    );
}

export default LoginForm;