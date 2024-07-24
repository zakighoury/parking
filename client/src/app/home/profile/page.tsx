"use client";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card, Avatar, Typography, Button } from 'antd';
import Cookies from 'js-cookie';
import { signout } from '../../../lib/features/auth/authSlice'; // Adjust the import path
import './style.css'; // External CSS for styling

const { Title, Paragraph } = Typography;

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);
  const [role, setRole] = useState('');

  useEffect(() => {
    const userRole = Cookies.get("role");
    setRole(userRole || '');
    if (!userRole || !user || (userRole !== "provider" && userRole !== "customer")) {
      router.push("/login");
    }
  }, [user, router]);

  const handleSignout = () => {
    dispatch(signout());
    Cookies.remove('role');
    Cookies.remove('token');
    router.push('/login');
  };

  if (!user) {
    return null; 
  }

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <Avatar
          size={100}
          src={user.avatar}
          alt="User Avatar"
          className="profile-avatar"
        />
        <Title level={2}>{user.name}</Title>
        <Paragraph>Email: {user.email}</Paragraph>
        <Paragraph>Role: {role}</Paragraph>
        <Paragraph>Provider: {user.provider}</Paragraph>
        <Button type="primary" shape="round" onClick={handleSignout} className="signout-button">
          Sign Out
        </Button>
      </Card>
    </div>
  );
};

export default Profile;
