import { useCallback, useEffect, useState } from 'react';
import { Col, Form, Row, Button, Select, Spin, message, Table, DatePicker, Input, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { startCase } from 'lodash';
import dayjs from 'dayjs'
import { createBarrowedBooks, deleteBarrowRequests, getBarrowRequests } from '../api/helper';
import { useAppContext } from '../hooks';

const { Item, useForm } = Form;

const status = ['borrowed']

const CheckoutBooks = () => {
    const { mode } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [form] = useForm();
    const [borrowedRequests, setBorrowedRequests] = useState([]);
    const { loading, setLoading } = useAppContext();
    const [deleteBorrowRequestId, setDeleteBorrowRequestId] = useState();

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

                        record.status === 'approved' && (
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

    const handleClickEditBorrowRequest = (borrowRequest) => {
        navigate('/checkout-books/edit', { state: borrowRequest })
    }

    const handleDeleteBorrwoRequest = async () => {
        try {
            setLoading(true);
            const { success } = await deleteBarrowRequests(deleteBorrowRequestId);
            if (success) {
                message.success('Borrow Request deleted successfully')
                await fetchBorrowedRequests();
            } else {
                message.error('Failed to delete borrow request')
            }
        } catch (error) {
            message.error(error?.data || 'Failed to delete borrow request')
        } finally {
            setLoading(false)
        }
    }

    const fetchBorrowedRequests = useCallback(async () => {
        try {
            setLoading(true);
            const { success, data = [] } = await getBarrowRequests({ status: 'approved', checkout: true });
            if (success) {
                setBorrowedRequests(data);
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
    }, [setLoading]);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await createBarrowedBooks({ ...state, ...values })
            const { success } = response;
            if (success) {
                navigate('/checkout-books');
                message.success('Checkout completed successfully');
                form.resetFields();
            } else {
                message.error(`Failed to checkou`);
            }
        } catch (error) {
            message.error(`Failed to checkout`);
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = () => {
        navigate('/checkout-books');
        form.resetFields();
    }

    useEffect(() => {
        if (!mode && !state) {
            fetchBorrowedRequests();
        } else {
            const { borrow_date, due_date, return_date } = state;
            const data = {
                ...state,
                borrow_date: borrow_date ? dayjs(borrow_date) : undefined,
                due_date: due_date ? dayjs(due_date) : undefined,
                return_date: return_date ? dayjs(return_date) : undefined,
            }
            form.setFieldsValue(data)
            if (mode) {
                form.setFieldValue('status', 'borrowed')
            }
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
                    (mode && (mode === 'edit')) ? (
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
                                        name={'title'}
                                        label={'Book'}
                                    >
                                        <Input placeholder='Enter Book' disabled={true} />
                                    </Item>
                                    <Item
                                        name='due_date'
                                        rules={[{
                                            required: true,
                                            message: 'Due date is required'
                                        }]}
                                        label={'Due date'}
                                    >
                                        <DatePicker placeholder='Select Due date' />
                                    </Item>
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
                            <Table
                                dataSource={borrowedRequests}
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

export default CheckoutBooks;
