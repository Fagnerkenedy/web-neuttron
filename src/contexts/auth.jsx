import { Alert } from "antd";
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userApiURI from '../Utility/userApiURI';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        const recoveredUser = localStorage.getItem('user');
        if(recoveredUser !== "undefined") {
            setUser(JSON.parse(recoveredUser));
        } 
        setLoading(false);
    }, []);

    const login = async (data) => {
        setLoading(true);
        localStorage.removeItem("user");
        
        const response = await userApiURI.login(data)

        if(response.status === 200 && !response.data.success){
            if(response.data.message === "user_not_found")
                setAlertMessage(<Alert message="OPS! Houve um erro no login!" description="O E-mail informado não está cadastrado" type="error" showIcon />)
            
            if(response.data.message === "invalid_password")
                setAlertMessage(<Alert message="OPS! Houve um erro no login!" description="Senha Incorreta" type="error" showIcon />)
            
            setLoading(false);

            if(response.data.message == "user_not_verified")
                setAlertMessage(<Alert message="E-mail não confirmado!" description="Verifique sua caixa de entrada e clique no link para confirmar seu e-mail." type="info" showIcon />)
        } else {

            const loggedUser = response.data.user;
            const org = response.data.org;
            const token = response.data.token;

            localStorage.setItem("user", JSON.stringify(loggedUser));
            localStorage.setItem("org", org);
            localStorage.setItem("token", token);

            setUser(loggedUser);
            navigate(`/${response.data.org}/home`);
            window.location.reload(true)
            setLoading(false);
        }
        
    };

    const logout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("org");

        // api.defaults.headers.Authorization = null;

        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ authenticated: !!user, user, loading, login, logout, alertMessage }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
