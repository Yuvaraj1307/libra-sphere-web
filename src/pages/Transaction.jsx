import { useEffect, useState } from 'react';
import { Col, Form, Row, Button, Select, Spin, message, Table, Popconfirm, DatePicker, Radio } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'
import { capitalize, isEmpty, startCase } from 'lodash';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createTransaction, deleteTransaction, getAllTransactions, updateTransaction, getAllUsers, getAllMembers, getAllBooks } from '../api/helper';

const { Item, useForm } = Form;

const transactionTypes = [
  'borrow',
  'return',
  'reserve',
  'renew',
  'finePayment',
  'cancellation'
].map((type) => {
  return {
    label: startCase(type),
    value: type,
  }
});

const statusTypes = ['pending', 'completed'].map((type) => {
  return {
    label: startCase(type),
    value: type,
  }
});

const Transaction = () => {
  const { mode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form] = useForm();
  const [transactions, setTransactions] = useState();
  const [loading, setLoading] = useState(!mode);
  const [deleteTransactionUid, setDeleteTransactionUid] = useState();
  const [members, setMembers] = useState();
  const [books, setBooks] = useState();
  const [users, setUsers] = useState();

  const columns = [
    {
      key: 'title',
      dataIndex: 'title',
      title: 'Title',
    },
    {
      key: 'member',
      dataIndex: 'member',
      title: 'Member',
    },
    {
      key: 'librarian',
      dataIndex: 'librarian',
      title: 'Librarian',
    },
    {
      key: 'transaction_type',
      dataIndex: 'transaction_type',
      title: 'Transaction Type',
      render: (transaction_type) => <>{capitalize(transaction_type)}</>
    },
    {
      key: 'transaction_date',
      dataIndex: 'transaction_date',
      title: 'Transaction Date',
      render: (date) => <>{date ? dayjs(date).format('DD-MM-YYYY') : null}</>,
    },
    {
      key: 'due_date',
      dataIndex: 'due_date',
      title: 'Due Date',
      render: (date) => <>{date ? dayjs(date).format('DD-MM-YYYY') : null}</>,
    },
    {
      key: 'return_date',
      dataIndex: 'return_date',
      title: 'Return Date',
      render: (date) => <>{date ? dayjs(date).format('DD-MM-YYYY') : null}</>,
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: 'Status',
      render: (status) => <>{capitalize(status)}</>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (transaction) => (
        <Row style={{ gap: '20px' }}>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => handleClickEditTransaction(transaction)}
          >
            <EditOutlined />
          </span>
          <Popconfirm
            title="Delete the transaction"
            description="Are you sure to delete this transaction?"
            onConfirm={handleDeleteTransaction}
            onCancel={() => setDeleteTransactionUid()}
            okText="Yes"
            cancelText="No"
            open={deleteTransactionUid === transaction.transaction_uid}
          >
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => setDeleteTransactionUid(transaction.transaction_uid)}
            >
              <DeleteOutlined />
            </span>
          </Popconfirm>
        </Row>
      ),
    },
  ]

  const handleClickAdd = () => {
    navigate('/transaction/add');
  }

  const handleClickEditTransaction = (transaction) => {
    navigate('/transaction/edit', { state: transaction })
  }

  const handleDeleteTransaction = async () => {
    try {
      const { success } = await deleteTransaction(deleteTransactionUid);
      if (success) {
        message.success('Transaction deleted successfully');
        fetchAllDatas();
        form.resetFields();
      } else {
        message.error('Failed to delete transaction')
      }
    } catch (error) {
      message.error(error?.data || 'Failed to delete transaction')
    } finally {
      setLoading(false);
    }
  }

  const fetchAllDatas = async () => {
    try {
      const [usersResponse, membersResponse, booksResponse, transactionsResponse] = await Promise.all([getAllUsers({ librarian: true }), getAllMembers(), getAllBooks(), getAllTransactions()]);

      const responses = [usersResponse, membersResponse, booksResponse, transactionsResponse];

      if (responses.every(response => response && response.success)) {
        const usersData = usersResponse.data;
        const membersData = membersResponse.data;
        const booksData = booksResponse.data;
        const transactionsData = transactionsResponse.data;

        const booksOptions = booksData.map((book) => ({
          label: book.title,
          value: book.book_uid,
        }));

        const membersOptions = membersData.map((member) => ({
          label: member.username,
          value: member.member_uid,
        }));

        const usersOptions = usersData.map((user) => ({
          label: user.username,
          value: user.user_uid,
        }));

        const dataSource = transactionsData.map((transaction) => {
          return {
            ...transaction,
            title: booksData.find((book) => book.book_uid === transaction.book_uid)?.title || '',
            member: membersData.find((member) => member.member_uid === transaction.member_uid)?.username || '',
            librarian: usersData.find((user) => user.user_uid === transaction.user_uid)?.username || '',
          };
        });

        setBooks(booksOptions);
        setMembers(membersOptions);
        setUsers(usersOptions);
        setTransactions(dataSource);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      message.error(error?.data || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    let response;
    try {
      if (mode === 'edit') {
        response = await updateTransaction({ ...state, ...values })
      } else {
        response = await createTransaction(values)
      }
      const { success } = response;
      if (success) {
        navigate('/transaction');
        message.success(`Transaction ${mode === 'edit' ? 'updated' : 'created'}  successfully`);
        form.resetFields();
      } else {
        message.error(`Failed to ${mode === 'edit' ? 'update' : 'create'} transaction`);
      }
    } catch (error) {
      message.error(error?.data || `Failed to ${mode === 'edit' ? 'update' : 'create'} transaction`);
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    navigate('/transaction');
    form.resetFields();
  }
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || isEmpty(user)) {
      navigate('/login');
      return;
    }
    if (!mode) {
      fetchAllDatas();
    } else {
      if (mode === 'edit' && state) {
        form.setFieldsValue({
          ...state,
          transaction_date: state.transaction_date ? dayjs(state.transaction_date) : undefined,
          due_date: state.due_date ? dayjs(state.due_date) : undefined,
          return_date: state.return_date ? dayjs(state.return_date) : undefined,
        });
      } else {
        form.setFieldsValue({ status: 'pending' })
      }
    }
  }, [form, mode, navigate, state]);

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
                    name={'book_uid'}
                    rules={[{
                      required: true,
                      message: 'Book is required'
                    }]}
                    label={'Book'}
                  >
                    <Select
                      options={books}
                      placeholder='Select Book'
                      showSearch={true}
                    />
                  </Item>
                  <Item
                    name={'user_uid'}
                    label={'Librarian'}
                    rules={[{
                      required: true,
                      message: 'Librarian is required'
                    }]}
                  >
                    <Select
                      options={users}
                      placeholder='Select Librarian'
                      showSearch={true}
                    />
                  </Item>
                  <Item
                    name={'member_uid'}
                    label={'Member'}
                    rules={[{
                      required: true,
                      message: 'Member is required'
                    }]}
                  >
                    <Select
                      options={members}
                      placeholder='Select Member'
                      showSearch={true}
                    />
                  </Item>
                  <Item
                    name={'transaction_type'}
                    rules={[{
                      required: true,
                      message: 'Transaction Type is required'
                    }]}
                    label={'Transaction Type'}
                  >
                    <Select
                      options={transactionTypes}
                      placeholder='Select Transaction Type'
                      showSearch={true}
                    />
                  </Item>
                  <Item
                    name={'transaction_date'}
                    label={'Transaction Date'}
                    rules={[{
                      required: true,
                      message: 'Transaction Date is required'
                    }]}
                  >
                    <DatePicker format='DD-MM-YYYY' placeholder='Select Transaction Date' />
                  </Item>
                  <Item
                    name={'due_date'}
                    label={'Due Date'}
                    rules={[{
                      required: true,
                      message: 'Due Date is required'
                    }]}
                  >
                    <DatePicker format='DD-MM-YYYY' placeholder='Select Due Date' />
                  </Item>
                  <Item
                    name={'return_date'}
                    label={'Return Date'}
                  >
                    <DatePicker format='DD-MM-YYYY' placeholder='Select Return Date' />
                  </Item>
                  <Item
                    name={'status'}
                    label={'Status'}
                  >
                    <Radio.Group options={statusTypes} />
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
                  Add Transaction
                </Button>
              </Row>
              <Table
                dataSource={transactions}
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

export default Transaction