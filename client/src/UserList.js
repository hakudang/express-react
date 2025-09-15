// react component to fetch and display user list from the backend
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

const UserList = forwardRef((props, ref) => {
    const [users, setUsers] = useState([]);
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hàm tải lại danh sách user
    const reloadUsers = () => {
        setLoading(true);
        fetch('http://localhost:3001/users')
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };
    // Expose reloadUsers method to parent via ref
    useImperativeHandle(ref, () => ({ reloadUsers }));

    useEffect(() => {
        reloadUsers();
        // eslint-disable-next-line
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    // Hàm bắt đầu sửa user
    const handleEdit = (user) => {
        setEditId(user.id);
        setEditName(user.name);
        setEditEmail(user.email);
    };

    // Hàm hủy sửa
    const handleCancelEdit = () => {
        setEditId(null);
        setEditName('');
        setEditEmail('');
    };

    // Hàm lưu user đã sửa
    const handleSaveEdit = async (id) => {
        if (!editName || !editEmail) {
            alert('Vui lòng nhập đầy đủ tên và email!');
            return;
        }
        try {
            const res = await fetch(`http://localhost:3001/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, email: editEmail })
            });
            if (!res.ok) throw new Error('Sửa user thất bại!');
            setEditId(null);
            setEditName('');
            setEditEmail('');
            reloadUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    // Hàm xóa user
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa user này?')) return;
        try {
            const res = await fetch(`http://localhost:3001/users/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Xóa user thất bại!');
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