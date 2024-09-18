import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Popconfirm, Row, Spin, Table } from 'antd';
import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../hooks';
import { createUser, deleteUser, getAllUsers, updateUser } from '../api/helper';

const { Item, useForm } = Form;

const Members = () => {
    const { mode } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [form] = useForm();
    const [members, setMembers] = useState([]);
    const [deleteMemberId, setDeleteMemberId] = useState();
    const { userInfo = {}, loading, setLoading } = useAppContext();

    const columns = [
        {
            key: 'name',
            dataIndex: 'name',
            title: 'Name',
        },
        {
            key: 'email',
            dataIndex: 'email',
            title: 'E-mail',
        },
        {
            key: 'role',
            dataIndex: 'role',
            title: 'Role',
        },
        {
            key: 'phone_number',
            dataIndex: 'phone_number',
            title: 'Phone Number',
        },
        {
            key: 'address',
            dataIndex: 'address',
            title: 'Address',
        },
        {
            title: 'Actions',
            dataIndex: 'id',
            key: 'actions',
            render: (id, member) => (
                <Row style={{ gap: '20px' }}>
                    <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleClickEditMember(member)}
                    >
                        <EditOutlined />
                    </span>
                    <Popconfirm
                        title="Delete the member"
                        description="Are you sure to delete this member?"
                        onConfirm={handleDeleteMember}
                        onCancel={() => setDeleteMemberId()}
                        okText="Yes"
                        cancelText="No"
                        open={deleteMemberId === id}
                    >
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => setDeleteMemberId(id)}
                        >
                            <DeleteOutlined />
                        </span>
                    </Popconfirm>
                </Row>
            ),
        },
    ]

    const handleClickAdd = () => {
        navigate('/members/add');
    }

    const handleClickEditMember = (member) => {
        navigate('/members/edit', { state: member })
    }

    const handleDeleteMember = async () => {
        try {
            const { success } = await deleteUser(deleteMemberId);
            if (success) {
                message.success('Member deleted successfully')
                await fetchMembers();
            } else {
                message.error('Failed to delete member')
            }
        } catch (error) {
            message.error(error?.data || 'Failed to delete member')
        } finally {
            setLoading(false)
        }
    }

    const fetchMembers = useCallback(async () => {
        if (userInfo && userInfo?.library_id) {
            const { library_id } = userInfo;
            try {
                const { success, data = [] } = await getAllUsers({ library_id, role: 'member' });
                if (success) {
                    setMembers(data);
                } else {
                    message.error('Failed to fetch members')
                }
            } catch (error) {
                message.error(error?.data || 'Failed to fetch members')
            } finally {
                setLoading(false);
            }
        }
    }, [setLoading, userInfo])

    const onFinish = async (values) => {
        const payload = { ...values, status: values.status ? 'active' : 'inactive', library_id: userInfo?.library_id, role: 'member' };
        setLoading(true);
        let response;
        try {
            if (mode === 'edit') {
                response = await updateUser({ ...state, ...payload })
            } else {
                response = await createUser(payload)
            }
            const { success } = response;
            if (success) {
                navigate('/members');
                message.success(`Member ${mode === 'edit' ? 'updated' : 'created'}  successfully`);
                form.resetFields();
            } else {
                message.error(`Failed to ${mode === 'edit' ? 'update' : 'create'} member`);
            }
        } catch (error) {
            message.error(error?.data || `Failed to ${mode === 'edit' ? 'update' : 'create'} member`);
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = () => {
        navigate('/members');
        form.resetFields();
    }

    useEffect(() => {
        if (!mode && !state && userInfo?.library_id) {
            fetchMembers();
        } else {
            form.setFieldsValue(state)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, mode, userInfo?.library_id, form]);

    return (
        <Spin
            spinning={loading}
            className='h-100'
            size='large'
        >
            <Col span={24} className='container h-100'>
                {
                    (mode && (mode === 'add' || mode === 'edit')) ? (
                        <Row className='h-100' justify='center' align='middle'>
                            <Col xl={10} lg={12} md={14} sm={20} xs={24}>
                                <Form
                                    form={form}
                                    layout='vertical'
                                    autoComplete='off'
                                    onFinish={onFinish}
                                    className='form-container'
                                >
                                    <Item
                                        name={'name'}
                                        rules={[{
                                            required: true,
                                            message: 'Name is required'
                                        }]}
                                        label={'Name'}
                                    >
                                        <Input placeholder='Enter Name' />
                                    </Item>
                                    <Item
                                        name={'email'}
                                        label={'E-mail'}
                                        rules={[{
                                            required: true,
                                            message: 'E-mail is required'
                                        }]}
                                    >
                                        <Input placeholder='Enter E-mail' />
                                    </Item>
                                    <Item
                                        name={'password'}
                                        label={'Password'}
                                        rules={[{
                                            required: true,
                                            message: 'Password is required'
                                        }]}
                                    >
                                        <Input.Password placeholder='Enter Password' />
                                    </Item>
                                    <Item
                                        name={'phone_number'}
                                        label={'Phone Number'}
                                        rules={[{
                                            required: true,
                                            message: 'Phone Number is required'
                                        }]}
                                    >
                                        <Input placeholder='Enter Phone Number' />
                                    </Item>
                                    <Item
                                        name={'address'}
                                        label={'Address'}
                                        rules={[{
                                            required: true,
                                            message: 'Address is required'
                                        }]}
                                    >
                                        <Input.TextArea placeholder='Enter Address' />
                                    </Item>
                                    <Item>
                                        <Row justify='end' style={{ gap: '15px', marginTop: '20px' }}>
                                            <Button
                                                htmlType='reset'
                                                size='large'
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type='primary'
                                                size='large'
                                                htmlType='submit'
                                                loading={loading}
                                                disabled={loading}
                                            >
                                                {
                                                    mode === 'edit' ? 'Update' : 'Create'
                                                }
                                            </Button>
                                        </Row>
                                    </Item>
                                </Form>
                            </Col>
                        </Row>
                    ) : (
                        <>
                            <Row justify='end' style={{ marginBottom: '10px' }}>
                                <Button
                                    type='primary'
                                    size='large'
                                    onClick={handleClickAdd}
                                    icon={<PlusOutlined />}
                                >
                                    Add Member
                                </Button>
                            </Row>
                            <Table
                                dataSource={members}
                                columns={columns}
                                scroll={{ x: 'auto' }}
                            />
                        </>
                    )
                }
            </Col>
        </Spin>
    )
}

export default Members