// react component to fetch and display user list from the backend
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

const UserList = forwardRef((props, ref) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>User List</h2>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', margin: '0 auto' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>UserName</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default UserList;