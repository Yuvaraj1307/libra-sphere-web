import { Form, Input, Button, Col, Row, message, Spin, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { getDetails } from '../api/helper';
import { useEffect } from 'react';
import menusJson from '../meta/menus.json';
import { useAppContext } from '../hooks';

const { Title } = Typography;

// eslint-disable-next-line react/prop-types
const Login = () => {
    const navigate = useNavigate();
    const { setUserInfo, setMenus, setIsLoggedIn, loading, setLoading } = useAppContext();
    const onFinish = async (values) => {
        try {
            setLoading(true);
            const { success, data } = await getDetails(values);
            if (success) {
                if (!isEmpty(data)) {
                    const { role } = data;
                    if (!role) {
                        navigate('/login');
                        return;
                    } else {
                        const menus = menusJson[role];
                        localStorage.setItem('token', data.token);
                        if (!menus) {
                            navigate('/login');
                            return;
                        }
                        setMenus(menus);
                        setUserInfo(data);
                        setIsLoggedIn(true);
                        navigate(menus[0].path);
                        message.success('Logged in successfully');
                    }
                } else {
                    message.error('Invalid Username or Password')
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

    useEffect(() => {
        localStorage.removeItem('token');
        setIsLoggedIn(false)
    }, [setIsLoggedIn])

    return (
        <Spin spinning={loading} size='large'>
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
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please input your Email!',
                                            },
                                        ]}
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
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please input your Password!',
                                            },
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined className="site-form-item-icon" />}
                                            type="password"
                                            placeholder="Password"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Row>
                        <Col span={24} style={{ alignSelf: 'end' }}>
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

export default Login