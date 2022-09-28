import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import "./user.scss";

const User = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getUsers = async () => {
      try {
        const response = await axios.get("/users", {
          signal: controller.signal,
        });
        isMounted && setUsers(response.data);
        console.log(users);
      } catch (error) {
        console.log(error);
      }
    };
    getUsers();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="page">
      <h1>User page </h1>
      {users?.length ? (
        <ul>
          {users.map((user, index) => (
            <li key={index}>
              <span>{index+1}</span><span>{user?.uname}</span><span>{user?.role}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users to display</p>
      )}
    </div>
  );
};

export default User;
