import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../hooks";
import { Card, Col, message, Row, Spin, Statistic, Typography } from "antd";
import { getUserDashboard } from "../api/helper";
import { BookOutlined, CheckOutlined, CloseOutlined, ExclamationCircleOutlined, FileDoneOutlined, RedoOutlined, TeamOutlined, WarningOutlined } from "@ant-design/icons";

const { Text } = Typography;

const Dashboard = () => {
  const [data, setData] = useState();
  const { loading, setLoading, userInfo, } = useAppContext();

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const { success, data } = await getUserDashboard();
      if (success) {
        setData(data)
      } else {
        message.error(`Failed to load ${userInfo.name}'s dashboard`)
      }
    } catch (error) {
      if (error.message === 'Invalid token') {
        message.info('Session expired');
        window.location.href = 'http://localhost:3000/login'
      } else {
        message.error(`Failed to load ${userInfo.name}'s dashboard`)
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading, userInfo.name])

  useEffect(() => {
    if (userInfo) {
      fetchDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo])

  const renderStyledTitle = (icon, title) => (
    <Text style={{ fontSize: "16px", fontWeight: "bold", display: "flex", alignItems: "center" }}>
      {icon} <span style={{ marginLeft: 8 }}>{title}</span>
    </Text>
  );

  return (
    <Spin
      spinning={loading}
      className='h-100'
    >
      <Col span={24} className='container h-100'>
        {
          (userInfo?.role && data) && (
            <Row gutter={[16, 16]}>
              {
                (userInfo.role === 'admin' || userInfo.role === 'librarian' || userInfo.role === 'member') && (
                  <>
                    <Col lg={8} md={12} sm={24}>
                      <Card style={{ backgroundColor: "rgba(0, 185, 107, 0.1)" }}>
                        <Statistic
                          title={renderStyledTitle(<BookOutlined />, "Books")}
                          value={data.books}
                          valueStyle={{ color: "rgb(0, 185, 107)" }}
                        />
                      </Card>
                    </Col>
                    <Col lg={8} md={12} sm={24}>
                      <Card style={{ backgroundColor: "rgba(255, 122, 0, 0.1)" }}>
                        <Statistic
                          title={renderStyledTitle(<ExclamationCircleOutlined />, "Pending Requests")}
                          value={data.borrowRequestsPending}
                          valueStyle={{ color: "rgb(255, 122, 0)" }}
                        />
                      </Card>
                    </Col>
                    <Col lg={8} md={12} sm={24}>
                      <Card style={{ backgroundColor: "rgba(115, 209, 61, 0.1)" }}>
                        <Statistic
                          title={renderStyledTitle(<CheckOutlined />, "Approved Requests")}
                          value={data.borrowRequestsApproved}
                          valueStyle={{ color: "#73d13d" }}
                        />
                      </Card>
                    </Col>
                    <Col lg={8} md={12} sm={24}>
                      <Card style={{ backgroundColor: "rgba(255, 77, 148, 0.1)" }}>
                        <Statistic
                          title={renderStyledTitle(<CloseOutlined />, "Rejected Requests")}
                          value={data.borrowRequestsRejected}
                          valueStyle={{ color: "rgb(255, 69, 96)" }}
                        />
                      </Card>
                    </Col>
                    <Col lg={8} md={12} sm={24}>
                      <Card style={{ backgroundColor: "rgba(24, 144, 255, 0.1)" }}>
                        <Statistic
                          title={renderStyledTitle(<FileDoneOutlined />, "Borrowed Books")}
                          value={data.borrowedBooks}
                          valueStyle={{ color: "#1890ff" }}
                        />
                      </Card>
                    </Col>
                    <Col lg={8} md={12} sm={24}>
                      <Card style={{ backgroundColor: "rgba(255, 99, 71, 0.1)" }}>
                        <Statistic
                          title={renderStyledTitle(<WarningOutlined />, "Overdue Books")}
                          value={data.overdueBooks}
                          valueStyle={{ color: "#ff4d4f" }}
                        />
                      </Card>
                    </Col>
                    <Col lg={8} md={12} sm={24}>
                      <Card style={{ backgroundColor: "rgba(142, 68, 173, 0.1)" }}>
                        <Statistic
                          title={renderStyledTitle(<RedoOutlined />, "Returned Books")}
                          value={data.returnedBooks}
                          valueStyle={{ color: "rgb(142, 68, 173)" }}
                        />
                      </Card>
                    </Col>
                    {
                      userInfo.role !== 'member' && (
                        <Col lg={8} md={12} sm={24}>
                          <Card style={{ backgroundColor: "rgba(75, 192, 192, 0.1)" }}>
                            <Statistic
                              title={renderStyledTitle(<TeamOutlined />, `${userInfo.role === 'admin' ? 'Users' : 'Members'}`)}
                              value={userInfo.role === 'admin' ? data.users : data.members}
                              valueStyle={{ color: "rgb(75, 192, 192)" }}
                            />
                          </Card>
                        </Col>
                      )
                    }
                  </>
                )
              }
            </Row>
          )
        }
      </Col>
    </Spin>
  )
};

export default Dashboard;
