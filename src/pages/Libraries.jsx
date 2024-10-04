import { useCallback, useEffect, useState } from "react"
import { Button, Col, Form, Input, message, Popconfirm, Row, Spin, Table } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from 'dayjs'
import { createLibrary, deleteLibrary, getLibraries } from "../api/helper"
import { useAppContext } from "../hooks";

const { Item, useForm } = Form;

const Libraries = () => {
    const [form] = useForm();
    const [libraries, setLibraries] = useState([]);
    const [deleteLibraryId, setDeleteLibraryId] = useState();
    const { loading, setLoading } = useAppContext();
    const { mode } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    const columns = [
        {
            key: 'name',
            dataIndex: 'name',
            title: 'Name',
        },
        {
            key: 'address',
            dataIndex: 'address',
            title: 'Address',
        },
        {
            key: 'created_at',
            dataIndex: 'created_at',
            title: 'Created At',
            render: (val) => (
                <>{dayjs(val).format('MMM DD YYYY')}</>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            dataIndex: 'id',
            render: (val, record) => (
                <Row style={{ gap: '20px' }}>
                    <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleClickEdit(record)}
                    >
                        <EditOutlined />
                    </span>
                    <Popconfirm
                        title="Delete the user"
                        description="Are you sure to delete this user?"
                        onConfirm={() => deleteLibrary(deleteLibraryId)}
                        onCancel={() => setDeleteLibraryId(null)}
                        okText="Yes"
                        cancelText="No"
                        open={deleteLibraryId === val}
                    >
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => setDeleteLibraryId(val)}
                        >
                            <DeleteOutlined />
                        </span>
                    </Popconfirm>
                </Row>
            ),
        },
    ]

    const handleCancel = () => {
        form.resetFields();
        navigate('/libraries');
    }

    const handleClickAdd = () => {
        navigate('/libraries/add');
    }

    const handleClickEdit = (library) => {
        navigate('/libraries/edit', { state: library })
    }


    const onFinish = async (value) => {
        try {
            setLoading(true);
            const { success } = await createLibrary(value);
            if (success) {
                message.success(mode === 'create' ? 'Library created successfully' : 'Library updated successfully');
            } else {
                message.error(mode === 'create' ? 'Failed to create' : 'Failed to update')
            }
        } catch (error) {
            message.error(mode === 'create' ? 'Failed to create' : 'Failed to update')
        } finally {
            setLoading(false)
        }
    }

    const fetchLibrary = useCallback(async () => {
        try {
            setLoading(true)
            const { success, data = [] } = await getLibraries();
            if (success) {
                setLibraries(data)
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
        if (!mode && !state) {
            fetchLibrary();
        } else {
            form.setFieldsValue(state)
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
                                        name={'name'}
                                        rules={[{
                                            required: true,
                                            message: 'Library Name is required'
                                        }]}
                                        label={'Library Name'}
                                    >
                                        <Input placeholder='Enter Library Name' />
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
                                    Add Library
                                </Button>
                            </Row>
                            <Table
                                columns={columns}
                                dataSource={libraries}
                                scroll={{ x: 'auto' }}
                            />
                        </>
                    )
                }
            </Col>
        </Spin>
    )
}

export default Libraries