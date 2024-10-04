import { useCallback, useEffect, useState } from 'react';
import { Col, Form, Input, InputNumber, Row, Button, Select, Spin, message, Table, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createBook, deleteBook, getAllBooks, updateBook } from '../api/helper';
import { useAppContext } from '../hooks';
import genreJson from '../meta/genre.json';

const { Item, useForm } = Form;

const Books = () => {
  const { mode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form] = useForm();
  const [books, setBooks] = useState([]);
  const [deleteBookId, setDeleteBookId] = useState();
  const { userInfo = {}, loading, setLoading } = useAppContext();

  const columns = [
    {
      key: 'title',
      dataIndex: 'title',
      title: 'Title',
    },
    {
      key: 'author',
      dataIndex: 'author',
      title: 'Author',
    },
    {
      key: 'genre',
      dataIndex: 'genre',
      title: 'Genre',
    },
    {
      key: 'quantity_available',
      dataIndex: 'quantity_available',
      title: 'Quantity Available',
    },
    {
      key: 'quantity_total',
      dataIndex: 'quantity_total',
      title: 'Quantity Total',
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: 'Status',
      render: (status) => <>{status ? 'Available' : 'Not Available'}</>
    },
    {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'id',
      render: (val, record) => (
        <Row style={{ gap: '20px' }}>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => handleClickEditBook(record)}
          >
            <EditOutlined />
          </span>
          <Popconfirm
            title="Delete the book"
            description="Are you sure to delete this book?"
            onConfirm={handleDeleteBook}
            onCancel={() => setDeleteBookId()}
            okText="Yes"
            cancelText="No"
            open={deleteBookId === val}
          >
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => setDeleteBookId(val)}
            >
              <DeleteOutlined />
            </span>
          </Popconfirm>
        </Row>
      ),
    },
  ]

  const handleClickAdd = () => {
    navigate('/books/add');
  }

  const handleClickEditBook = (book) => {
    navigate('/books/edit', { state: book })
  }

  const handleDeleteBook = async () => {
    try {
      const { success } = await deleteBook(deleteBookId);
      if (success) {
        message.success('Book deleted successfully')
        await fetchBooks();
      } else {
        message.error('Failed to delete book')
      }
    } catch (error) {
      message.error(error?.data || 'Failed to delete book')
    } finally {
      setLoading(false)
    }
  }

  const fetchBooks = useCallback(async () => {
    try {
      const { library_id } = userInfo;
      const { success, data = [] } = await getAllBooks({ library_id });
      if (success) {
        setBooks(data);
      } else {
        message.error('Failed to fetch books')
      }
    } catch (error) {
      if (error.message === 'Invalid token') {
        message.info('Session expired');
        window.location.href = 'http://localhost:3000/login'
      } else {
        message.error(error?.data || 'Failed to fetch books')
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading, userInfo])

  const onFinish = async (values) => {
    const payload = { ...values, status: values.status, library_id: userInfo?.library_id };
    let response;
    try {
      setLoading(true);
      if (mode === 'edit') {
        response = await updateBook({ ...state, ...payload })
      } else {
        response = await createBook(payload)
      }
      const { success } = response;
      if (success) {
        navigate('/books');
        message.success(`Book ${mode === 'edit' ? 'updated' : 'created'}  successfully`);
        form.resetFields();
      } else {
        message.error(`Failed to ${mode === 'edit' ? 'update' : 'create'} book`);
      }
    } catch (error) {
      if (error.message === 'Invalid token') {
        message.info('Session expired');
        window.location.href = 'http://localhost:3000/login'
      } else {
        message.error(error?.data || `Failed to ${mode === 'edit' ? 'update' : 'create'} book`);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    navigate('/books');
    form.resetFields();
  }

  useEffect(() => {
    if (!mode && !state && userInfo?.library_id) {
      fetchBooks();
    } else {
      form.setFieldsValue(state)
    }

    return () => {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, mode, form, userInfo?.library_id]);

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
                    name={'title'}
                    rules={[{
                      required: true,
                      message: 'Title is required'
                    }]}
                    label={'Title'}
                  >
                    <Input placeholder='Enter Title' />
                  </Item>
                  <Item
                    name={'author'}
                    label={'Author'}
                    rules={[{
                      required: true,
                      message: 'Author is required'
                    }]}
                  >
                    <Input placeholder='Enter Author' />
                  </Item>
                  <Item
                    name={'isbn'}
                    label={'ISBN (International Standard Book Number)'}
                    rules={[{
                      required: true,
                      message: 'ISBN is required'
                    }]}
                  >
                    <Input placeholder='Enter ISGN' />
                  </Item>
                  <Item
                    name={'genre'}
                    rules={[{
                      required: true,
                      message: 'Genre is required'
                    }]}
                    label={'Genre'}
                  >
                    <Select
                      options={genreJson}
                      placeholder='Select Genre'
                      showSearch={true}
                    />
                  </Item>
                  <Item
                    name={'quantity_available'}
                    label={'Quantity Available'}
                    rules={[{
                      required: true,
                      message: 'Quantity Available is required'
                    }]}
                  >
                    <InputNumber placeholder='Enter Quantity Available' />
                  </Item>
                  <Item
                    name={'quantity_total'}
                    label={'Quantity Total'}
                    rules={[{
                      required: true,
                      message: 'Quantity Total is required'
                    }]}
                  >
                    <InputNumber placeholder='Enter Quantity Total' />
                  </Item>
                  <Item
                    name={'status'}
                    label={'Active Status'}
                  >
                    <Switch />
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
              {
                userInfo.role !== 'member' && (
                  <Row justify='end' style={{ marginBottom: '10px' }}>
                    <Button
                      type='primary'
                      size='large'
                      onClick={handleClickAdd}
                      icon={<PlusOutlined />}
                    >
                      Add Book
                    </Button>
                  </Row>
                )
              }
              <Table
                dataSource={books}
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

export default Books;