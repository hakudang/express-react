// @file client/src/UserList.js
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { API, apiFetch } from './api';

const UserList = forwardRef((props, ref) => {
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API.users); // Fetch user list from API
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setUsers(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ reloadUsers }));

  useEffect(() => { reloadUsers(); /* eslint-disable-next-line */ }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleEdit = (user) => {
    setEditId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditName('');
    setEditEmail('');
  };

  const handleSaveEdit = async (id) => {
    if (!editName || !editEmail) {
      alert('Vui lòng nhập đầy đủ tên và email!');
      return;
    }
    try {
      await apiFetch(`${API.users}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName, email: editEmail })
      });
      setEditId(null);
      setEditName('');
      setEditEmail('');
      reloadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa user này?')) return;
    try {
      await apiFetch(`${API.users}/${id}`, { method: 'DELETE' });
      reloadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>User List</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', margin: '0 auto' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>UserName</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                {editId === user.id ? (
                  <input value={editName} onChange={e => setEditName(e.target.value)} />
                ) : (
                  user.name
                )}
              </td>
              <td>
                {editId === user.id ? (
                  <input value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editId === user.id ? (
                  <>
                    <button onClick={() => handleSaveEdit(user.id)} style={{ marginRight: 8, color: 'green' }}>Lưu</button>
                    <button onClick={handleCancelEdit}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button style={{ marginRight: 8 }} onClick={() => handleEdit(user)}>Sửa</button>
                    <button onClick={() => handleDelete(user.id)} style={{ color: 'red' }}>Xóa</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default UserList;
