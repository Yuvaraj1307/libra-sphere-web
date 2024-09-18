import { useCallback, useEffect, useState } from 'react';
import { Col, Form, Input, Row, Button, Select, Spin, message, Table, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createUser, deleteUser, getAllUsers, updateUser } from '../api/helper';
import { startCase } from 'lodash';
import { useAppContext } from '../hooks';

const { Item, useForm } = Form;

const userRoles = ['admin', 'librarian', 'member', 'guest'];

const Users = () => {
  const { mode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form] = useForm();
  const [users, setUsers] = useState([]);
  const [deleteUserId, setDeleteUserId] = useState();
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
            onCancel={() => setDeleteUserId()}
            okText="Yes"
            cancelText="No"
            open={deleteUserId === id}
          >
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => setDeleteUserId(id)}
            >
              <DeleteOutlined />
            </span>
          </Popconfirm>
        </Row>
      ),
    },
  ]

  const handleClickAdd = () => {
    navigate('/users/add');
  }

  const handleClickEditUser = (user) => {
    navigate('/users/edit', { state: user })
  }

  const handleDeleteUser = async () => {
    try {
      const { success } = await deleteUser(deleteUserId);
      if (success) {
        message.success('User deleted successfully')
        await fetchUsers();
      } else {
        message.error('Failed to delete user')
      }
    } catch (error) {
      message.error(error?.data || 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = useCallback(async () => {
    if (userInfo && userInfo?.library_id) {
      const { library_id, role } = userInfo;
      try {
        const params = { library_id };
        if (role === 'librarian') {
          params.role = 'member';
        }
        const { success, data = [] } = await getAllUsers(params);
        if (success) {
          setUsers(data);
        } else {
          message.error('Failed to fetch users')
        }
      } catch (error) {
        message.error(error?.data || 'Failed to fetch users')
      } finally {
        setLoading(false);
      }
    }
  }, [setLoading, userInfo])

  const onFinish = async (values) => {
    const payload = { ...values, status: values.status ? 'active' : 'inactive', library_id: userInfo?.library_id };
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
        navigate('/users');
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
    navigate('/users');
    form.resetFields();
  }

  useEffect(() => {
    if (!mode && !state && userInfo?.library_id) {
      fetchUsers();
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
                    name={'role'}
                    rules={[{
                      required: true,
                      message: 'Role is required'
                    }]}
                    label={'Role'}
                  >
                    <Select
                      options={userRoles.map((value) => ({ label: startCase(value), value }))}
                      placeholder='Role'
                      showSearch={true}
                    />
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
                  Add User
                </Button>
              </Row>
              <Table
                dataSource={users}
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

export default Users;
