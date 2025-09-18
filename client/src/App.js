// @file client/src/App.js

import React, { useRef } from 'react';
import './App.css';
import UserList from './UserList';
import AddUserForm from './AddUserForm';


function App() {
  // Tạo ref để gọi hàm reload user list từ UserList
  const userListRef = useRef();

  // Hàm gọi reload user list
  const handleUserAdded = () => {
    if (userListRef.current) {
      userListRef.current.reloadUsers();
    }
  };

  return (
    <div className="App">
      <h1>Express + React Demo</h1>
      <AddUserForm onUserAdded={handleUserAdded} />
      <UserList ref={userListRef} />
    </div>
  );
}

export default App;
