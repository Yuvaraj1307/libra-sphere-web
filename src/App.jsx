import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, Typography } from 'antd';
import MenuComponent from './components/MenuComponent';
import Login from './pages/Login';
import { startCase } from 'lodash';
import Dashboard from './pages/Dashboard';
import { useAppContext } from './hooks';
import Libraries from './pages/Libraries';
import Books from './pages/Books';
import Users from './pages/User';
import BorrowRequests from './pages/BorrowRequests';
import BorrowedBooks from './pages/BorrowedBooks';
import Members from './pages/Members';
import CheckoutBooks from './pages/CheckoutBooks';
import { useEffect } from 'react';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const { userInfo, setIsLoggedIn, menus, isLoggedIn, setUserInfo, setMenus } = useAppContext();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUserInfo = sessionStorage.getItem('userInfo');
    const storedMenus = sessionStorage.getItem('menus');

    if (token) {
      setIsLoggedIn(true);
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
      if (storedMenus) {
        setMenus(JSON.parse(storedMenus));
      }
    }
  }, [setIsLoggedIn, setUserInfo, setMenus]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
        },
      }}
    >
      <Layout>
        {
          (isLoggedIn && menus && userInfo && userInfo?.library_id) && (
            <Sider>
              <div className="demo-logo-vertical">
                <Title level={4} style={{ marginBottom: '0' }}>
                  {startCase(userInfo?.name)} <span style={{ fontSize: '11px', fontWeight: '500' }}>({startCase(userInfo?.role)})</span>
                </Title>
              </div>
              <MenuComponent menu={menus} setIsLoggedIn={setIsLoggedIn} setUserInfo={setUserInfo} setMenus={setMenus} />
            </Sider>
          )
        }
        <Layout>
          {
            (isLoggedIn && menus && userInfo && userInfo?.library_id) && (
              <Header style={{ display: 'flex', alignItems: 'center' }}>
                <Title level={4} style={{ marginBottom: '0', color: '#00b96b' }}>
                  Librasphere
                </Title>
              </Header>
            )
          }
          <Content>
            <Routes>
              {
                !isLoggedIn ? (
                  <>
                    <Route path='/login' element={<Login />} />
                  </>
                ) : (
                  <>
                    <Route path='/dashboard' element={<Dashboard />} />
                    <Route path='/libraries/:mode?' element={<Libraries />} />
                    <Route path='/books/:mode?' element={<Books />} />
                    <Route path='/users/:mode?' element={<Users />} />
                    <Route path='/members/:mode?' element={<Members />} />
                    <Route path='/borrow-requests/:mode?' element={<BorrowRequests />} />
                    <Route path='/borrowed-books/:mode?' element={<BorrowedBooks />} />
                    <Route path='/checkout-books/:mode?' element={<CheckoutBooks />} />
                    <Route path='/*' element={<Navigate to="/login" replace />} />
                  </>
                )
              }
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider >
  )
}

export default App;
