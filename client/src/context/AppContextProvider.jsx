import { useState, useEffect, useCallback } from "react";
import { AppContext } from "./AppContext";
import axios from "axios";

export const AppContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);
    const [user, setUser] = useState(null);

    const checkLogin = useCallback(async () => {
            try {
                const { data } = await axios.get(
                    `${backendUrl}/api/auth/isLoggedIn`,
                    { withCredentials: true }
                );
                console.log(data);
                setIsLoggedIn(data.success);
                setRole(data.role);
                setUser(data.user);
            } catch (error) {
                console.error(error);
            }
    }, [backendUrl]);

    useEffect(() => {
        const initLogin = async () => {
            await checkLogin();
        };
        initLogin();
    }, [checkLogin]);

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