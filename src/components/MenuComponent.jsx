import { Menu, Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


// eslint-disable-next-line react/prop-types
const MenuComponent = ({ menu = [], setIsLoggedIn, setMenus, setUserInfo }) => {
    const navigate = useNavigate();

    const [selectedKey, setSelectedKey] = useState([]);

    const handleMenuChange = ({ key }) => {
        setSelectedKey([key]);
        navigate(`/${key}`)
    };

    const handleClickLogout = () => {
        navigate('/login');
        setIsLoggedIn(false);
    }

    useEffect(() => {
        if (menu.length) {
            const path = location.pathname.split('/')[1];
            setSelectedKey([path])
        }
        return () => {
            setUserInfo();
            setMenus();
            setIsLoggedIn(false);
        }
    }, [menu, setIsLoggedIn, setMenus, setUserInfo]);

    return (
        <div className='menu-container'>
            <Menu
                selectedKeys={selectedKey}
                onClick={handleMenuChange}
                items={menu}
            />
            <div className='logout-btn'>
                <Button
                    className='logout-btn'
                    type='text'
                    icon={<LogoutOutlined />}
                    onClick={handleClickLogout}
                    size='large'
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        height: 'max-content',
                        padding: '10px',
                    }}
                >
                    <span style={{ fontWeight: '500' }}>Logout</span>
                </Button>
            </div>
        </div>
    );
};

export default MenuComponent;
