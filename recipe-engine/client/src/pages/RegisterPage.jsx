/**
 * @file RegisterPage.jsx
 * @description Registration form with client-side validation.
 *              Server-side validation (express-validator) provides a second layer.
 * @author Hossein
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

/**
 * RegisterPage component.
 */
const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Updates form field state.
   * @param {React.ChangeEvent} e
   */
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  /**
   * Client-side validation - mirrors the server-side rules in validateMiddleware.js.
   * @returns {boolean} True if valid
   */
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters.';

    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Enter a valid email address.';

    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Password must contain at least one uppercase letter.';
    else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Password must contain at least one number.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Submits registration data to the API.
   */
  const handleSubmit = async () => {
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        // Handle array of validation errors from express-validator
        if (result.errors) {
          const mapped = {};
          result.errors.forEach((err) => { mapped[err.path] = err.msg; });
          setErrors(mapped);
        } else {
          setServerError(result.message || 'Registration failed.');
        }
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>

        <div className="auth-field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min. 8 chars, 1 uppercase, 1 number"
            className={errors.password ? 'input-error' : ''}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        {serverError && <p className="auth-server-error">{serverError}</p>}

        <button className="auth-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
