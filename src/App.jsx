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

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const { userInfo, setIsLoggedIn, menus, isLoggedIn } = useAppContext();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
        },
      }}
    >
      <Layout>
        {(isLoggedIn && menus) ? (
          <Sider>
            <div className="demo-logo-vertical">
              <Title level={4} style={{ marginBottom: '0' }}>
                {startCase(userInfo?.username)} <span style={{ fontSize: '11px', fontWeight: '500' }}>({startCase(userInfo?.role)})</span>
              </Title>
            </div>
            <MenuComponent menu={menus} setIsLoggedIn={setIsLoggedIn} />
          </Sider>
        ) : null}
        <Layout>
          {(isLoggedIn && menus && userInfo && userInfo?.library_id) ? (
            <Header style={{ display: 'flex', alignItems: 'center' }}>
              <Title level={4} style={{ marginBottom: '0', color: '#00b96b' }}>
                Librasphere
              </Title>
            </Header>
          ) : null}
          <Content>
            <Routes>
              <Route path='/*' element={<Navigate to="/login" replace />} />
              <Route path='/login' element={<Login />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/libraries/:mode?' element={<Libraries />} />
              <Route path='/books/:mode?' element={<Books />} />
              <Route path='/users/:mode?' element={<Users />} />
              <Route path='/members/:mode?' element={<Members />} />
              <Route path='/borrow-requests/:mode?' element={<BorrowRequests />} />
              <Route path='/borrowed-books/:mode?' element={<BorrowedBooks />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App;
