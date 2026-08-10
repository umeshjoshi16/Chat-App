import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API;
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getMe = async () => {
      try {
        const { data } = await axios.get(`${API}/api/auth/me`, {
          withCredentials: true,
        });

         setUser(data.user);
      } catch (error) {
        setUser(null);
      }
    };

    getMe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);