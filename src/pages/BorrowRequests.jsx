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
            key: 'title',
            dataIndex: 'title',
            title: 'Title',
        },
        {
            key: 'request_date',
            dataIndex: 'request_date',
            title: 'Request Date',
            render: (val) => (
                <>{dayjs(val).format('MMM DD YYYY')}</>
            )
        },
        {
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
            render: (id, record) => (
                <Row style={{ gap: '20px' }}>
                    {
                        record.status === 'pending' && (
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleClickEditBorrowRequest(record)}
                            >
                                <EditOutlined />
                            </span>
                        )
                    }
                    <Popconfirm
                        title="Delete the borrow request"
                        description="Are you sure to delete this borrow request?"
                        onConfirm={handleDeleteBorrwoRequest}
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

    const handleClickEditBorrowRequest = (borrowRequest) => {
        navigate('/borrow-requests/edit', { state: borrowRequest })
    }

    const handleDeleteBorrwoRequest = async () => {
        try {
            setLoading(true);
            const { success } = await deleteBarrowRequests(deleteBorrowRequestId);
            if (success) {
                message.success('Borrow Request deleted successfully')
                await fetchBorrowRequests();
            } else {
                message.error('Failed to delete borrow request')
            }
        } catch (error) {
            message.error(error?.data || 'Failed to delete borrow request')
        } finally {
            setLoading(false)
        }
    }

    const fetchBorrowRequests = useCallback(async () => {
        try {
            setLoading(true);
            const { success, data = [] } = await getBarrowRequests({ status: userInfo.role === 'librarian' ? 'pending' : undefined });
            if (success) {
                setBorrowRequests(data);
            } else {
                message.error('Failed to fetch borrow requests')
            }
        } catch (error) {
            if (error.message === 'Invalid token') {
                message.info('Session expired');
                window.location.href = 'http://localhost:3000/login'
            } else {
                message.error(error?.data || 'Failed to fetch borrow requests')
            }
        } finally {
            setLoading(false);
        }
    }, [setLoading, userInfo.role]);

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
        setLoading(true);
        let response;
        try {
            if (mode === 'edit') {
                response = await updateBarrowRequests({ ...state, ...values })
            } else {
                response = await createBarrowRequests(values)
            }
            const { success } = response;
            if (success) {
                navigate('/borrow-requests');
                message.success(`Borrow Request ${mode === 'edit' ? 'updated' : 'created'}  successfully`);
                form.resetFields();
            } else {
                message.error(`Failed to ${mode === 'edit' ? 'update' : 'create'} borrow request`);
            }
        } catch (error) {
            message.error(error?.data || `Failed to ${mode === 'edit' ? 'update' : 'create'} borrow request`);
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = () => {
        navigate('/borrow-requests');
        form.resetFields();
    }

    useEffect(() => {
        if (!mode && !state) {
            fetchBorrowRequests();
        } else {
            form.setFieldsValue(state)
            if (mode === 'add') {
                form.setFieldValue('status', 'pending')
            }
            fetchBooks();
        }

        return () => {
            form.resetFields();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, mode]);

    return (
        <Spin
            spinning={loading}
            className='h-100'
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
                                    {
                                        userInfo.role !== 'member' && (
                                            <>
                                                <Item
                                                    name={'status'}
                                                    rules={[{
                                                        required: true,
                                                        message: 'Status is required'
                                                    }]}
                                                    label={'Status'}
                                                >
                                                    <Select
                                                        options={status.map((i) => ({ label: startCase(i), value: i }))}
                                                        placeholder='Select Status'
                                                    />
                                                </Item>
                                            </>
                                        )
                                    }
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
                            {
                                userInfo.role === 'member' && (
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
                                )
                            }
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
