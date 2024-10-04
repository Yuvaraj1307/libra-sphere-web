import { createContext, useState } from "react";

const AppContext = createContext({})

export const AppContextProvider = (props) => {
    const { children } = props || {};
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [menus, setMenus] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);

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
