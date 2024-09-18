import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import menusJson from '../meta/menus.json';

const AppContext = createContext({})

export const AppContextProvider = (props) => {
    const { children } = props || {};
    const [menus, setMenus] = useState();
    const [userInfo, setUserInfo] = useState();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const info = JSON.parse(userInfo)
            const menus = menusJson[info.role];
            setUserInfo(info);
            setMenus(menus);
            setIsLoggedIn(true);
        } else {
            navigate('/login');
        }

    }, [navigate])

    const value = {
        menus,
        userInfo,
        isLoggedIn,
        loading,
        setMenus,
        setUserInfo,
        setIsLoggedIn,
        setLoading,
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContext;
