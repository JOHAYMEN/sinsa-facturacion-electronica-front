import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const login = async (username, password) => {
    try {
        console.log('El llego aqui', username)
        const { data  } = await axios.post('/api/login', { username, password }, { withCredentials: true });
        //const response = await axios.get('/api/user-info', { withCredentials: true });
        setUser(response.data);
        return data;
    } catch (err) {
        throw new Error('Error de autenticación');
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('/user-info', { withCredentials: true });
                setUser(response.data);
            } catch (err) {
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    const login = async (username, password) => {
        try {
            console.log('El llego aqui', username)
            await axios.post('/api/login', { username, password }, { withCredentials: true });
            //const response = await axios.get('/api/user-info', { withCredentials: true });
            setUser(response.data);
        } catch (err) {
            throw new Error('Error de autenticación');
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout', {}, { withCredentials: true });
            setUser(null);
        } catch (err) {
            console.error('Error al cerrar sesión');
        }
    };
    

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

