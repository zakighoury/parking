// components/AdminLayout.tsx

"use client";

import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  AppstoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import ShowBuildings from '../showbuilt/page'; // Import your components
import AddBuilding from '../addbuilt/page'; // Import your components

const { Header, Content, Sider } = Layout;

const AdminLayout: React.FC = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('/dashboard/admin/showbuilt');

  const handleMenuClick = (e: any) => {
    setSelectedMenuItem(e.key);
  };

  const renderContent = () => {
    switch (selectedMenuItem) {
      case '/dashboard/admin/showbuilt':
        return <ShowBuildings />;
      case '/dashboard/admin/addbuilt':
        return <AddBuilding />;
      default:
        return <ShowBuildings />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header">
        <div className="logo" />
        <h1 style={{ color: '#fff' }}>Admin Dashboard</h1>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultSelectedKeys={[selectedMenuItem]}
            style={{ height: '100%', borderRight: 0 }}
            onClick={handleMenuClick}
          >
            <Menu.Item key="/dashboard/admin/showbuilt" icon={<AppstoreOutlined />}>
              Show Buildings
            </Menu.Item>
            <Menu.Item key="/dashboard/admin/addbuilt" icon={<PlusOutlined />}>
              Add Building
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
