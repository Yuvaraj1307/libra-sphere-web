/* eslint-disable no-unused-vars */
import { Form, Input, Button, Col, Row, message, Spin, Typography, Select, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { getLibraries, getUserInfo, handleLogin } from '../api/helper';
import { useCallback, useEffect, useState } from 'react';
import menusJson from '../meta/menus.json';
import { useAppContext } from '../hooks';

const { Title } = Typography;
const { useForm } = Form;

const Login = () => {
    const [form] = useForm();
    const navigate = useNavigate();
    const { setUserInfo, setMenus, setIsLoggedIn, loading, setLoading } = useAppContext();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [libraries, setLibraries] = useState();

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const { success, data } = await handleLogin(values);
            if (success) {
                if (!isEmpty(data)) {
                    const { token } = data;
                    sessionStorage.setItem('token', token);
                    const { library_id } = values;
                    const { data: userInfo, success } = await getUserInfo({ library_id });
                    if (success && !isEmpty(userInfo)) {
                        const { role } = userInfo;
                        if (!role) {
                            navigate('/login');
                            message.error('Invalid Username or Password');
                            return;
                        } else {
                            const menus = menusJson[role];
                            if (!menus) {
                                navigate('/login');
                                message.error('Invalid Username or Password');
                                return;
                            }
                            setMenus(menus);
                            setUserInfo(userInfo);
                            setIsLoggedIn(true);
                            navigate(menus[0].path);
                            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
                            sessionStorage.setItem('menus', JSON.stringify(menus));
                            message.success('Logged in successfully');
                        }
                    } else {
                        message.error('Failed to get user info');
                    }
                } else {
                    message.error('Invalid Username or Password');
                }
            } else {
                message.error('An error occurred while logging in');
            }
        } catch (error) {
            message.error(error?.data || 'An error occurred while logging in');
        } finally {
            setLoading(false);
        }
    }


    const fetchLibrary = useCallback(async () => {
        try {
            setLoading(true)
            const { success, data = [] } = await getLibraries({ super_admin: true });
            if (success) {
                const libraries = data.map((i) => ({
                    label: i.name,
                    value: i.id
                }))
                setLibraries(libraries)
            } else {
                message.error('Failed to load libraries')
            }
        } catch (error) {
            message.error('Failed to load libraries')
        } finally {
            setLoading(false);
        }
    }, [setLoading]);

    useEffect(() => {
        sessionStorage.removeItem('token');
        setIsLoggedIn(false);
    }, [setIsLoggedIn]);

    useEffect(() => {
        if (isSuperAdmin) {
            fetchLibrary()
        }
    }, [fetchLibrary, isSuperAdmin])

    return (
        <Spin spinning={loading}>
            <Col span={24} className='container h-100' style={{
                backgroundColor: '#8ae9b3',
                backgroundImage: 'linear-gradient(315deg, #8ae9b3 0%, #c8d6e5 74%)',
            }}>
                <Row className='h-100' justify='center' align='middle'>
                    <Form
                        name="login"
                        className='form-container login-container'
                        onFinish={onFinish}
                        autoComplete='off'
                        form={form}
                    >
                        <Row>
                            <Col span={24}>
                                <Title level={4} style={{ marginBottom: '0', color: '#00b96b', textAlign: 'center' }}>
                                    Login to LibraSphere
                                </Title>
                                <div style={{ fontSize: '10px', textAlign: 'center', widows: '100%', marginTop: '2px' }}>
                                    <>Where Every Library Shines, Managed with Precision and Care</>
                                </div>
                            </Col>
                            <Row>
                                <Col span={24}>
                                    <Form.Item
                                        name="email"
                                        rules={[{ required: true, message: 'Please input your Email!' }]}
                                    >
                                        <Input
                                            prefix={<UserOutlined className="site-form-item-icon" />}
                                            placeholder="Email"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        name="password"
                                        rules={[{ required: true, message: 'Please input your Password!' }]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined className="site-form-item-icon" />}
                                            type="password"
                                            placeholder="Password"
                                        />
                                    </Form.Item>
                                </Col>
                                {
                                    isSuperAdmin && (
                                        <Col span={24}>
                                            <Form.Item
                                                name="library_id"
                                                rules={[{ required: true, message: 'Please select Library!' }]}
                                            >
                                                <Select
                                                    placeholder="Select Library"
                                                    options={libraries}
                                                />
                                            </Form.Item>
                                        </Col>
                                    )
                                }
                            </Row>
                        </Row>
                        <Col span={24} style={{ alignSelf: 'end' }}>
                            {/* <Form.Item
                                name='login_as_super_admin'
                            >
                                <Col span={24} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <Checkbox onChange={(e) => setIsSuperAdmin(e.target.checked)} />
                                    <span>Login as Super Admin</span>
                                </Col>
                            </Form.Item> */}
                            <Form.Item className='login-btn'>
                                <Button
                                    block
                                    type="primary"
                                    htmlType="submit"
                                    className="login-form-button"
                                    size='large'
                                    loading={loading}
                                    disabled={loading}
                                >
                                    Log in
                                </Button>
                            </Form.Item>
                        </Col>
                    </Form>
                </Row>
            </Col>
        </Spin>
    )
}

export default Login;
