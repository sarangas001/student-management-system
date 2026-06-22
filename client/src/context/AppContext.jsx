import axios from 'axios'
import { createContext, useEffect, useState } from 'react'


export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState();
    const [user, setUser] = useState();

    const isLoggedInCheck = async () => {
        try {
            
            const {data} = await axios.get(`${backendUrl}/api/auth/isLoggedIn`, { withCredentials: true });
            setIsLoggedIn(data.success);
            setRole(data.role);
            setUser(data.user_id);
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    };

    useEffect(() => {
        isLoggedInCheck();
    }, []);

    const value = {
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        role, setRole,
        isLoggedInCheck
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
    
}