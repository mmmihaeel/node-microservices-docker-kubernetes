import React, { useState, useEffect } from 'react';
import './SignupForm.css';
import { Link, useNavigate } from 'react-router-dom'

function SignupForm() {
    const navigate = useNavigate();

    useEffect(() => {
        const cookieToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('userId='))
            ?.split('=')[1]
        if (cookieToken) {
            navigate('/login')
        }
    }, [navigate])

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
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

        if (!formData.firstName) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        }

        if (!formData.lastName) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        }

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
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            fetch('http://localhost:1778/signup', {
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
                        'userId=' +
                        resData.userId +
                        '; expires=' +
                        date.toUTCString() +
                        '; path=/'
                    navigate('/login')
                }).catch(error => {
                    console.log('Error:', error);
                    setError(error.message);
                });
        } else {
            console.log('Form validation failed');
        }
    };

    return (
        <div className="custom-signup-form">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div className="custom-form-control">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                    {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                </div>
                <div className="custom-form-control">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                    {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                </div>
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
                <button type="submit">Sign Up</button>
                {error && <div className="error-message">{error}</div>}
                <p className="login-link">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    );
}

export default SignupForm;