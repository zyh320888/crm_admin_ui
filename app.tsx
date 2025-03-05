import React, { useState, useEffect } from 'https://esm.sh/react@19.0.0';
import { createRoot } from 'https://esm.sh/react-dom@19.0.0/client';
import { 
  Layout, Menu, Button, Table, Form, Input, Select, 
  DatePicker, Card, Statistic, Divider, Typography, 
  Space, Tag, Modal, message, Spin, Row, Col, Breadcrumb,
  Empty, Tabs, Avatar, List, Switch, Radio, ConfigProvider, theme
} from 'https://esm.sh/antd@5.24.3?external=@ant-design/colors,@ant-design/fast-color';
import {
  UserOutlined, PhoneOutlined, MailOutlined, 
  EditOutlined, PlusOutlined, DashboardOutlined,
  TeamOutlined, SettingOutlined, AppstoreOutlined,
  BarChartOutlined, FileTextOutlined, BellOutlined,
  BgColorsOutlined, SkinOutlined
} from 'https://esm.sh/@ant-design/icons@5.5.2';
import { 
  QueryClient, 
  QueryClientProvider, 
  useQuery, 
  useMutation 
} from 'https://esm.sh/@tanstack/react-query@5.67.1';
import axios from 'https://esm.sh/axios@1.6.2';
import dayjs from 'https://esm.sh/dayjs@1.11.10';
import 'https://esm.sh/dayjs@1.11.10/locale/zh-cn';
import weekday from 'https://esm.sh/dayjs@1.11.10/plugin/weekday';
import localeData from 'https://esm.sh/dayjs@1.11.10/plugin/localeData';
import { APIClient } from 'https://esm.sh/@d8d-appcontainer/api@3.0.39';


// 设置 dayjs 语言和插件
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('zh-cn');

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// 创建QueryClient实例
const queryClient = new QueryClient();
let apiClient: APIClient | null = null;

const getApiClient = async () => {
  if (!apiClient) {
    apiClient = await APIClient.getInstance({
      scope: 'user',
      config: {
        serverUrl: 'https://app-server.d8d.fun',
        workspaceKey: 'ws_mphxpy6prf9',
        type: 'http'
      }
    });
  }
  return apiClient;
};

// 初始化数据库表
const initDatabase = async () => {
  const apiClient = await getApiClient();
  
  try {
    // 创建customers表
    await apiClient.database.schema.createTable('customers', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable();
      table.string('phone').notNullable();
      table.string('status').notNullable();
      table.date('lastContact').notNullable();
      table.timestamps(true, true);
    });

    // 插入初始数据
    await apiClient.database.insert('customers', [
      { 
        name: '张三', 
        email: 'zhangsan@example.com', 
        phone: '13800138001', 
        status: '活跃',
        lastContact: '2023-05-15'
      },
      { 
        name: '李四', 
        email: 'lisi@example.com', 
        phone: '13800138002', 
        status: '潜在',
        lastContact: '2023-05-10'
      },
      { 
        name: '王五', 
        email: 'wangwu@example.com', 
        phone: '13800138003', 
        status: '不活跃',
        lastContact: '2023-04-20'
      },
      { 
        name: '赵六', 
        email: 'zhaoliu@example.com', 
        phone: '13800138004', 
        status: '活跃',
        lastContact: '2023-05-18'
      }
    ]);
  } catch (error) {
    console.log('表已存在或其他错误:', error);
  }
};

// 获取Unsplash背景图片
const fetchBackgroundImage = async () => {
  try {
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        query: 'office',
        orientation: 'landscape',
      },
      headers: {
        Authorization: 'Client-ID 您的Unsplash_API_密钥' // 注意：实际使用时需替换为您的Unsplash API密钥
      }
    });
    return response.data.urls.regular;
  } catch (error) {
    console.error('获取背景图片失败:', error);
    return 'https://images.unsplash.com/photo-1497215842964-222b430dc094';
  }
};


// 客户列表组件
const CustomerList = ({ onEdit }) => {
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const apiClient = await getApiClient();
      const customers = await apiClient.database.table('customers')
        .select([
          'id',
          'name',
          'email',
          'phone',
          'status',
          apiClient.database.raw('DATE_FORMAT(lastContact, "%Y-%m-%d") as lastContact')
        ])
        .orderBy('id', 'desc')
        .execute();
      return customers;
    }
  });

  console.log("customers",customers);
  // 获取当前主题模式 - 使用ConfigProvider的context而不是直接调用useToken
  const isDarkMode = React.useContext(ConfigProvider.ConfigContext)?.theme?.isDark || false;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a className={isDarkMode ? 'text-blue-400' : ''}><UserOutlined /> {text}</a>,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <span className={isDarkMode ? 'text-gray-300' : ''}><MailOutlined /> {text}</span>,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => <span className={isDarkMode ? 'text-gray-300' : ''}><PhoneOutlined /> {text}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === '活跃' ? 'success' :
          status === '潜在' ? 'processing' : 'error'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: '最后联系',
      dataIndex: 'lastContact',
      key: 'lastContact',
      render: (text) => <span className={isDarkMode ? 'text-gray-300' : ''}>{text}</span>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          size="small"
          onClick={() => onEdit(record)}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <Spin spinning={isLoading}>
      <Table 
        dataSource={customers} 
        columns={columns} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
        className={isDarkMode ? 'ant-table-dark' : ''}
      />
    </Spin>
  );
};

// 客户表单组件
const CustomerForm = ({ customer, onSave, onCancel }) => {
  const [form] = Form.useForm();
  
  // 获取当前主题模式 - 使用ConfigProvider的context而不是直接调用useToken
  const isDarkMode = React.useContext(ConfigProvider.ConfigContext)?.theme?.isDark || false;
  
  useEffect(() => {
    if (customer) {
      // 处理日期格式
      const formattedCustomer = {
        ...customer,
        lastContact: customer.lastContact ? dayjs(customer.lastContact) : null
      };
      form.setFieldsValue(formattedCustomer);
    } else {
      form.setFieldsValue({ 
        name: '', 
        email: '', 
        phone: '', 
        status: '潜在', 
        lastContact: null 
      });
    }
  }, [customer, form]);

  const onFinish = (values) => {
    onSave({
      id: customer ? customer.id : Date.now(),
      ...values,
      lastContact: values.lastContact ? values.lastContact.format('YYYY-MM-DD') : ''
    });
  };

  return (
    <Card 
      title={<span className={isDarkMode ? 'text-white' : ''}>{customer ? '编辑客户' : '添加客户'}</span>} 
      bordered={false} 
      className={`shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
    >
      <Form
        form={form}
        name="customerForm"
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: '潜在',
          lastContact: null
        }}
        className={isDarkMode ? 'text-white' : ''}
      >
        <Form.Item
          name="name"
          label={<span className={isDarkMode ? 'text-gray-300' : ''}>姓名</span>}
          rules={[{ required: true, message: '请输入客户姓名!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
        </Form.Item>
        
        <Form.Item
          name="email"
          label={<span className={isDarkMode ? 'text-gray-300' : ''}>邮箱</span>}
          rules={[
            { required: true, message: '请输入邮箱地址!' },
            { type: 'email', message: '请输入有效的邮箱地址!' }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
        </Form.Item>
        
        <Form.Item
          name="phone"
          label={<span className={isDarkMode ? 'text-gray-300' : ''}>电话</span>}
          rules={[{ required: true, message: '请输入电话号码!' }]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="请输入电话" />
        </Form.Item>
        
        <Form.Item
          name="status"
          label={<span className={isDarkMode ? 'text-gray-300' : ''}>状态</span>}
          rules={[{ required: true, message: '请选择客户状态!' }]}
        >
          <Select placeholder="请选择状态">
            <Option value="活跃">活跃</Option>
            <Option value="潜在">潜在</Option>
            <Option value="不活跃">不活跃</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="lastContact"
          label={<span className={isDarkMode ? 'text-gray-300' : ''}>最后联系日期</span>}
          rules={[{ required: true, message: '请选择最后联系日期!' }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
            <Button onClick={onCancel}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

// 仪表盘组件
const Dashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['customers-stats'],
    queryFn: async () => {
      const apiClient = await getApiClient();
      
      // 获取客户状态统计
      const statusStats = await apiClient.database.table('customers')
        .select('status')
        .select(apiClient.database.raw('COUNT(*) as count'))
        .groupBy('status')
        .execute();
      
      // 获取最近活动
      const recentActivities = await apiClient.database.table('customers')
        .select([
          'id',
          'name',
          'status',
          apiClient.database.raw('DATE_FORMAT(updated_at, "%Y-%m-%d %H:%i") as update_time')
        ])
        .orderBy('updated_at', 'desc')
        .limit(4)
        .execute();
      
      return {
        statusStats,
        recentActivities
      };
    }
  });

  if (isLoading) return <Spin />;

  const { statusStats = [], recentActivities = [] } = dashboardData || {};
  
  // 转换状态统计数据
  const activeCustomers = statusStats.find(s => s.status === '活跃')?.count || 0;
  const potentialCustomers = statusStats.find(s => s.status === '潜在')?.count || 0;
  const inactiveCustomers = statusStats.find(s => s.status === '不活跃')?.count || 0;

  // 转换最近活动数据
  const formattedActivities = recentActivities.map(activity => ({
    id: activity.id,
    title: '客户更新',
    description: `${activity.name}的状态已更新为${activity.status}`,
    time: activity.update_time
  }));

  // 获取当前主题模式 - 使用ConfigProvider的context而不是直接调用useToken
  const isDarkMode = React.useContext(ConfigProvider.ConfigContext)?.theme?.isDark || false;
  const primaryColor = React.useContext(ConfigProvider.ConfigContext)?.theme?.token?.colorPrimary || '#1677ff';

  return (
    <div>
      <div className="mb-6">
        <Row gutter={16}>
          <Col span={8}>
            <Card className={`hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <Statistic
                title={<span className={isDarkMode ? 'text-gray-300' : ''}>活跃客户</span>}
                value={activeCustomers}
                valueStyle={{ color: '#3f8600' }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className={`hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <Statistic
                title={<span className={isDarkMode ? 'text-gray-300' : ''}>潜在客户</span>}
                value={potentialCustomers}
                valueStyle={{ color: '#1677ff' }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className={`hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <Statistic
                title={<span className={isDarkMode ? 'text-gray-300' : ''}>不活跃客户</span>}
                value={inactiveCustomers}
                valueStyle={{ color: '#cf1322' }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>
      
      <Row gutter={16}>
        <Col span={16}>
          <Card 
            title={<span className={isDarkMode ? 'text-white' : ''}>客户状态分布</span>} 
            className={`mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
          >
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChartOutlined style={{ fontSize: '48px', color: primaryColor }} />
                <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>这里将显示客户状态分布图表</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            title={<span className={isDarkMode ? 'text-white' : ''}>最近活动</span>} 
            className={`mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
          >
            <List
              itemLayout="horizontal"
              dataSource={formattedActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<BellOutlined />} style={{ backgroundColor: primaryColor }} />}
                    title={<span className={isDarkMode ? 'text-white' : ''}>{item.title}</span>}
                    description={<span className={isDarkMode ? 'text-gray-400' : ''}>{item.description}</span>}
                  />
                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{item.time}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// 设置页面组件
const Settings = ({ currentTheme, onThemeChange }) => {
  // 获取当前主题模式 - 使用ConfigProvider的context而不是直接调用useToken
  const isDarkMode = React.useContext(ConfigProvider.ConfigContext)?.theme?.isDark || false;
  
  return (
    <div>
      <Card 
        title={<span className={isDarkMode ? 'text-white' : ''}>系统设置</span>} 
        className={`mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: '个人信息',
              children: (
                <Form layout="vertical" className={`max-w-lg ${isDarkMode ? 'text-white' : ''}`}>
                  <Form.Item 
                    label={<span className={isDarkMode ? 'text-gray-300' : ''}>用户名</span>} 
                    name="username" 
                    initialValue="admin"
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item 
                    label={<span className={isDarkMode ? 'text-gray-300' : ''}>邮箱</span>} 
                    name="email" 
                    initialValue="admin@example.com"
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item 
                    label={<span className={isDarkMode ? 'text-gray-300' : ''}>密码</span>} 
                    name="password"
                  >
                    <Input.Password placeholder="输入新密码以修改" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary">保存设置</Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: '2',
              label: '通知设置',
              children: (
                <div className="p-4">
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : ''}`}>配置您希望接收的通知类型</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={isDarkMode ? 'text-gray-300' : ''}>新客户通知</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDarkMode ? 'text-gray-300' : ''}>客户状态变更通知</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDarkMode ? 'text-gray-300' : ''}>任务提醒</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={isDarkMode ? 'text-gray-300' : ''}>系统更新通知</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: '4',
              label: '主题设置',
              icon: <SkinOutlined />,
              children: (
                <div className="p-4">
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : ''}`}>自定义系统外观和主题</p>
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : ''}`}>主题模式</h3>
                      <Radio.Group 
                        value={currentTheme.mode} 
                        onChange={(e) => onThemeChange({ ...currentTheme, mode: e.target.value })}
                      >
                        <Radio.Button value="light">浅色模式</Radio.Button>
                        <Radio.Button value="dark">深色模式</Radio.Button>
                      </Radio.Group>
                    </div>
                    
                    <div>
                      <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : ''}`}>主题颜色</h3>
                      <Radio.Group 
                        value={currentTheme.primaryColor} 
                        onChange={(e) => onThemeChange({ ...currentTheme, primaryColor: e.target.value })}
                      >
                        <Radio.Button value="#1677ff" style={{ color: '#1677ff' }}>
                          <BgColorsOutlined /> 蓝色
                        </Radio.Button>
                        <Radio.Button value="#52c41a" style={{ color: '#52c41a' }}>
                          <BgColorsOutlined /> 绿色
                        </Radio.Button>
                        <Radio.Button value="#fa541c" style={{ color: '#fa541c' }}>
                          <BgColorsOutlined /> 橙色
                        </Radio.Button>
                        <Radio.Button value="#722ed1" style={{ color: '#722ed1' }}>
                          <BgColorsOutlined /> 紫色
                        </Radio.Button>
                        <Radio.Button value="#eb2f96" style={{ color: '#eb2f96' }}>
                          <BgColorsOutlined /> 粉色
                        </Radio.Button>
                      </Radio.Group>
                    </div>
                    
                    <div>
                      <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : ''}`}>紧凑模式</h3>
                      <Switch 
                        checked={currentTheme.compact} 
                        onChange={(checked) => onThemeChange({ ...currentTheme, compact: checked })}
                      />
                      <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : ''}`}>启用紧凑界面</span>
                    </div>
                    
                    <div>
                      <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : ''}`}>圆角风格</h3>
                      <Radio.Group 
                        value={currentTheme.borderRadius} 
                        onChange={(e) => onThemeChange({ ...currentTheme, borderRadius: e.target.value })}
                      >
                        <Radio.Button value={2}>小圆角</Radio.Button>
                        <Radio.Button value={6}>中圆角</Radio.Button>
                        <Radio.Button value={12}>大圆角</Radio.Button>
                      </Radio.Group>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: '3',
              label: '系统信息',
              children: (
                <div className="p-4">
                  <p className={isDarkMode ? 'text-gray-300' : ''}>系统版本: 1.0.0</p>
                  <p className={isDarkMode ? 'text-gray-300' : ''}>最后更新: 2023-12-20</p>
                  <p className={isDarkMode ? 'text-gray-300' : ''}>技术栈: React, Ant Design, Tailwind CSS, React Query</p>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

// 主应用组件
const App = () => {
  // 页面视图状态: 'dashboard', 'customers', 'settings'
  const [currentView, setCurrentView] = useState('dashboard');
  // 客户管理子视图: 'list', 'form'
  const [customerView, setCustomerView] = useState('list');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  
  // 从本地存储加载主题设置或使用默认值
  const defaultTheme = {
    mode: 'light',
    primaryColor: '#1677ff',
    compact: false,
    borderRadius: 6
  };
  
  // 主题设置
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('crm-theme');
    return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
  });
  
  // 当主题变化时保存到本地存储
  useEffect(() => {
    localStorage.setItem('crm-theme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  // 获取背景图片
  useEffect(() => {
    fetchBackgroundImage().then(setBackgroundImage);
  }, []);

  // 初始化数据库
  useEffect(() => {
    initDatabase();
  }, []);

  // 保存客户信息的mutation
  const saveMutation = useMutation({
    mutationFn: async (customer) => {
      const apiClient = await getApiClient();
      if (selectedCustomer) {
        // 更新现有客户
        await apiClient.database.table('customers')
          .where('id', customer.id)
          .update({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            status: customer.status,
            lastContact: customer.lastContact,
            updated_at: apiClient.database.raw('CURRENT_TIMESTAMP')
          });
        return customer;
      } else {
        // 新增客户
        const [id] = await apiClient.database.table('customers')
          .insert({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            status: customer.status,
            lastContact: customer.lastContact
          });
        return { ...customer, id };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setCustomerView('list');
      setSelectedCustomer(null);
      message.success('客户信息保存成功！');
    },
    onError: (error) => {
      message.error('保存失败：' + error.message);
    }
  });

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setCustomerView('form');
  };

  const handleSave = (customer) => {
    saveMutation.mutate(customer);
  };

  const handleCancel = () => {
    setCustomerView('list');
    setSelectedCustomer(null);
  };

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setCustomerView('form');
    setCurrentView('customers');
  };

  // 处理菜单点击
  const handleMenuClick = (e) => {
    setCurrentView(e.key);
    // 如果切换到客户管理，默认显示列表视图
    if (e.key === 'customers') {
      setCustomerView('list');
    }
  };

  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'customers',
      icon: <TeamOutlined />,
      label: '客户管理',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  // 根据当前视图渲染内容
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return customerView === 'list' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>客户列表</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddNew}
              >
                添加客户
              </Button>
            </div>
            <CustomerList onEdit={handleEdit} />
          </>
        ) : (
          <CustomerForm 
            customer={selectedCustomer} 
            onSave={handleSave} 
            onCancel={handleCancel} 
          />
        );
      case 'settings':
        return <Settings currentTheme={currentTheme} onThemeChange={setCurrentTheme} />;
      default:
        return <Empty description="页面不存在" />;
    }
  };

  // 获取面包屑标题
  const getBreadcrumbItems = () => {
    const items = [
      { title: 'CRM' },
    ];

    switch (currentView) {
      case 'dashboard':
        items.push({ title: '仪表盘' });
        break;
      case 'customers':
        items.push({ title: '客户管理' });
        if (customerView === 'form') {
          items.push({ title: selectedCustomer ? '编辑客户' : '添加客户' });
        }
        break;
      case 'settings':
        items.push({ title: '系统设置' });
        break;
    }

    return items;
  };

  // 配置主题
  const { defaultAlgorithm, darkAlgorithm, compactAlgorithm } = theme;
  const themeConfig = {
    token: {
      colorPrimary: currentTheme.primaryColor,
      borderRadius: currentTheme.borderRadius,
    },
    // 使用单独的暗色算法或组合使用暗色算法与紧凑算法
    algorithm: currentTheme.mode === 'dark' 
      ? (currentTheme.compact ? [darkAlgorithm, compactAlgorithm] : darkAlgorithm)
      : (currentTheme.compact ? compactAlgorithm : defaultAlgorithm),
    isDark: currentTheme.mode === 'dark'
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout className="min-h-screen">
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          theme={currentTheme.mode === 'dark' ? 'dark' : 'light'}
          style={{ 
            transition: 'background 0.3s ease'
          }}
        >
          <div className="p-4">
            <Title level={4} className="text-white m-0">
              {collapsed ? 'CRM' : '简易CRM系统'}
            </Title>
          </div>
          <Menu
            theme={currentTheme.mode}
            selectedKeys={[currentView]}
            mode="inline"
            items={items}
            onClick={handleMenuClick}
            style={{ 
              background: currentTheme.mode === 'dark' ? '#111827' : '',
              borderRight: currentTheme.mode === 'dark' ? '1px solid #1f2937' : ''
            }}
          />
        </Sider>
        <Layout>
          <Header className={`p-0 ${currentTheme.mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-end pr-5 h-full">
              {currentView !== 'customers' && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddNew}
                >
                  添加客户
                </Button>
              )}
            </div>
          </Header>
          <Content className="mx-4">
            <Breadcrumb className="my-4">
              {getBreadcrumbItems().map((item, index) => (
                <Breadcrumb.Item key={index}>{item.title}</Breadcrumb.Item>
              ))}
            </Breadcrumb>
            <div className={`p-6 min-h-[360px] rounded-md shadow-sm ${currentTheme.mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              {renderContent()}
            </div>
          </Content>
          <Footer className={`text-center ${currentTheme.mode === 'dark' ? 'bg-gray-900 text-white' : ''}`}>
            简易CRM系统 ©2023 使用React、Ant Design、Tailwind CSS和React Query构建
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

// 渲染应用
const root = document.getElementById('root') as HTMLElement;
createRoot(root).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);