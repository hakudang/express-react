// @file client/src/AddUserForm.js
import React, { useState } from 'react';
import { API, apiFetch } from './api';

function AddUserForm({ onUserAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name || !email) {
      setError('Vui lòng nhập đầy đủ tên và email!');
      return;
    }
    try {
      await apiFetch(API.users, {
        method: 'POST',
        body: JSON.stringify({ name, email })
      });
      setName('');
      setEmail('');
      setSuccess('Thêm user thành công!');
      if (onUserAdded) onUserAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24, textAlign: 'center' }}>
      <h3>Thêm User mới</h3>
      <input
        type="text"
        placeholder="Tên"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ marginRight: 8 }}
      />
      <button type="submit">Thêm</button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
    </form>
  );
}

export default AddUserForm;
