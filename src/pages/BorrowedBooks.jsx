import { useCallback, useEffect, useState } from 'react';
import { Col, Spin, message, Table, Row, Form, Input, DatePicker, Button, Select } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { startCase } from 'lodash';
import dayjs from 'dayjs'
import { getBarrowedBooks, updateBarrowedBooks } from '../api/helper';
import { useAppContext } from '../hooks';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const status = ['borrowed', 'returned'];
const { Item, useForm } = Form;

const BorrowedBooks = () => {
    const { mode } = useParams();
    const { state } = useLocation();
    const [form] = useForm();
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const { loading, setLoading, userInfo } = useAppContext();
    const [borrowedRequestStatus, setBorrowedRequestStatus] = useState('borrowed');
    const navigate = useNavigate();

    const columns = [
        {
            key: 'title',
            dataIndex: 'title',
            title: 'Title',
        },
        {
            key: 'borrow_date',
            dataIndex: 'borrow_date',
            title: 'Borrowed Date',
            render: (val) => (
                <>{val ? dayjs(val).format('MMM DD YYYY') : '-'}</>
            )
        },
        {
            key: 'due_date',
            dataIndex: 'due_date',
            title: 'Due Date',
            render: (val) => (
                <>{val ? dayjs(val).format('MMM DD YYYY') : '-'}</>
            )
        },
        {
            key: 'return_date',
            dataIndex: 'return_date',
            title: 'Return Date',
            render: (val) => (
                <>{val ? dayjs(val).format('MMM DD YYYY') : '-'}</>
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
            key: 'fine_amount',
            dataIndex: 'fine_amount',
            title: 'Fine Amount',
        },
        {
            title: 'Actions',
            dataIndex: 'id',
            key: 'actions',
            render: (id, record) => (
                <Row style={{ gap: '20px' }}>
                    {
                        record.status !== 'approved' && (
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleClickEditBorrowRequest(record)}
                            >
                                <EditOutlined />
                            </span>
                        )
                    }
                </Row>
            ),
        },
    ];


    const handleClickEditBorrowRequest = (borrowRequest) => {
        navigate('/borrowed-books/edit', { state: borrowRequest })
    }

    const fetchBorrowedBooks = useCallback(async () => {
        try {
            setLoading(true);
            const { success, data = [] } = await getBarrowedBooks();
            if (success) {
                setBorrowedBooks(data);
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

    const handleCancel = () => {
        navigate('/borrowed-books');
        form.resetFields();
    }

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await updateBarrowedBooks({ ...state, ...values })
            const { success } = response;
            if (success) {
                navigate('/borrowed-books');
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

    useEffect(() => {
        if (!mode && !state) {
            fetchBorrowedBooks();
        } else {
            const { borrow_date, due_date, return_date } = state;
            console.log('state ==> ', state)
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
                                    {
                                        borrowedRequestStatus === 'returned' && (

                                            <Item
                                                name='return_date'
                                                rules={[{
                                                    required: true,
                                                    message: 'Due date is required'
                                                }]}
                                                label={'Return date'}
                                            >
                                                <DatePicker placeholder='Select Return date' />
                                            </Item>
                                        )
                                    }
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
                                            onChange={(value) => setBorrowedRequestStatus(value)}
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
                                dataSource={borrowedBooks}
                                columns={userInfo.role === 'member' ? columns.filter((i) => i.key !== 'actions') : columns}
                                scroll={{ x: 'auto' }}
                            />
                        </>
                    )
                }
            </Col>
        </Spin>
    )
}

export default BorrowedBooks;
