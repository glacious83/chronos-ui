import { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userName, setUserName] = useState('');
    const [roles, setRoles]     = useState([]);   // <-- new

    return (
        <UserContext.Provider value={{ userName, setUserName, roles, setRoles }}>
            {children}
        </UserContext.Provider>
    );
};
