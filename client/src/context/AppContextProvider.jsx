import { useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import axios from "axios";

export const AppContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);
    const [user, setUser] = useState(null);

    const checkLogin = async () => {
            try {
                const { data } = await axios.get(
                    `${backendUrl}/api/auth/isLoggedIn`,
                    { withCredentials: true }
                );
                console.log(data);
                setIsLoggedIn(data.success);
                setRole(data.role);
                setUser(data.user_id);
            } catch (error) {
                console.error(error);
            }
    };

    useEffect(() => {
        

        checkLogin();
    }, [backendUrl]);

    return (
        <AppContext.Provider
            value={{
                backendUrl,
                isLoggedIn,
                setIsLoggedIn,
                role,
                setRole,
                user,
                checkLogin
            }}
        >
            {children}
        </AppContext.Provider>
    );
};