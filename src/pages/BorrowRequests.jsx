import { useCallback, useEffect, useState } from 'react';
import { Col, Form, Row, Button, Select, Spin, message, Table, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { startCase } from 'lodash';
import dayjs from 'dayjs'
import { createBarrowRequests, deleteBarrowRequests, getAllBooks, getBarrowRequests, updateBarrowRequests } from '../api/helper';
import { useAppContext } from '../hooks';

const { Item, useForm } = Form;

const status = ['pending', 'approved', 'rejected']

const BorrowRequests = () => {
    const { mode } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [form] = useForm();
    const [borrowRequests, setBorrowRequests] = useState([]);
    const [books, setBooks] = useState([]);
    const [deleteBorrowRequestId, setDeleteBorrowRequestId] = useState();
    const { userInfo = {}, loading, setLoading } = useAppContext();

    const columns = [
        {
            key: 'name',
            dataIndex: 'name',
            title: 'Name',
        },
        {
            key: 'request_date',
            dataIndex: 'request_date',
            title: 'Request Date',
            render: (val) => (
                <>{dayjs(val).format('MMM DD YYYY')}</>
            )
        },{
            key: 'status',
            dataIndex: 'status',
            title: 'Status',
            render: (val) => (
                <>{startCase(val)}</>
            )
        },
        {
            title: 'Actions',
            dataIndex: 'id',
            key: 'actions',
            render: (id, user) => (
                <Row style={{ gap: '20px' }}>
                    <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleClickEditUser(user)}
                    >
                        <EditOutlined />
                    </span>
                    <Popconfirm
                        title="Delete the user"
                        description="Are you sure to delete this user?"
                        onConfirm={handleDeleteUser}
                        onCancel={() => setDeleteBorrowRequestId()}
                        okText="Yes"
                        cancelText="No"
                        open={deleteBorrowRequestId === id}
                    >
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => setDeleteBorrowRequestId(id)}
                        >
                            <DeleteOutlined />
                        </span>
                    </Popconfirm>
                </Row>
            ),
        },
    ]

    const handleClickAdd = () => {
        navigate('/borrow-requests/add');
    }

    const handleClickEditUser = (user) => {
        navigate('/borrow-requests/edit', { state: user })
    }

    const handleDeleteUser = async () => {
        try {
            setLoading(true);
            const { success } = await deleteBarrowRequests(deleteBorrowRequestId);
            if (success) {
                message.success('User deleted successfully')
                await fetchBorrowRequests();
            } else {
                message.error('Failed to delete user')
            }
        } catch (error) {
            message.error(error?.data || 'Failed to delete user')
        } finally {
            setLoading(false)
        }
    }

    const fetchBorrowRequests = useCallback(async () => {
        if (userInfo && userInfo?.library_id) {
            const { library_id } = userInfo;
            try {
                setLoading(true);
                const { success, data = [] } = await getBarrowRequests({ library_id });
                if (success) {
                    setBorrowRequests(data);
                } else {
                    message.error('Failed to fetch borrow requests')
                }
            } catch (error) {
                message.error(error?.data || 'Failed to fetch borrow requests')
            } finally {
                setLoading(false);
            }
        }
    }, [setLoading, userInfo]);

    const fetchBooks = useCallback(async () => {
        if (userInfo && userInfo?.library_id) {
            const { library_id } = userInfo;
            try {
                setLoading(true);
                const { success, data = [] } = await getAllBooks({ library_id });
                if (success) {
                    const books = data.map(book => ({ value: book.id, label: book.title }))
                    setBooks(books);
                } else {
                    message.error('Failed to fetch books')
                }
            } catch (error) {
                message.error(error?.data || 'Failed to fetch books')
            } finally {
                setLoading(false);
            }
        }
    }, [setLoading, userInfo]);

    const onFinish = async (values) => {
        const { library_id, id } = userInfo;
        const payload = { ...values, library_id, user_id: id };
        setLoading(true);
        let response;
        try {
            if (mode === 'edit') {
                response = await updateBarrowRequests({ ...state, ...payload })
            } else {
                response = await createBarrowRequests(payload)
            }
            const { success } = response;
            if (success) {
                navigate('/borrow-requests');
                message.success(`User ${mode === 'edit' ? 'updated' : 'created'}  successfully`);
                form.resetFields();
            } else {
                message.error(`Failed to ${mode === 'edit' ? 'update' : 'create'} user`);
            }
        } catch (error) {
            message.error(error?.data || `Failed to ${mode === 'edit' ? 'update' : 'create'} user`);
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = () => {
        navigate('/borrow-requests');
        form.resetFields();
    }

    useEffect(() => {
        console.log('Loading')
        if (!mode && !state) {
            fetchBorrowRequests();
        } else {
            console.log('Loading 2')
            form.setFieldsValue(state)
            if (mode === 'add') {
                form.setFieldValue('status', 'pending')
            }
            fetchBooks();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, mode]);


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
                                        name={'book_id'}
                                        rules={[{
                                            required: true,
                                            message: 'Book is required'
                                        }]}
                                        label={'Book'}
                                    >
                                        <Select options={books} placeholder='Select Book' />
                                    </Item>
                                    <Item
                                        name={'status'}
                                        rules={[{
                                            required: true,
                                            message: 'Status is required'
                                        }]}
                                        label={'Status'}
                                    >
                                        <Select options={status.map((i) => ({ label: startCase(i), value: i }))} placeholder='Select Status' />
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
                                    Add Borrow Request
                                </Button>
                            </Row>
                            <Table
                                dataSource={borrowRequests}
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

export default BorrowRequests;
