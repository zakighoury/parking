"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Button, Drawer, message } from 'antd';
import { MenuOutlined, UserOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import './navbar.css'; // Import your CSS for styling

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userToken = Cookies.get('auth');
    setIsLoggedIn(!!userToken);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleProtectedLinkClick = (e: React.MouseEvent, href: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      message.warning('Please log in first!');
    } else {
      // Navigate to the clicked link if logged in
      window.location.href = href;
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <span className="appName">Car Park</span>
      </div>

      <div className="desktop-menu">
        <Menu mode="horizontal" className="menu">
          <Menu.Item key="home">
            <Link href="/main" onClick={(e) => handleProtectedLinkClick(e, '/main')}>
              Home
            </Link>
          </Menu.Item>
          <Menu.Item key="services">
            <Link href="/services" onClick={(e) => handleProtectedLinkClick(e, '/services')}>
              Services
            </Link>
          </Menu.Item>
          <Menu.Item key="about">
            <Link href="/about">About</Link>
          </Menu.Item>
          <Menu.Item key="contact">
            <Link href="/contact">Contact</Link>
          </Menu.Item>
        </Menu>
      </div>

      <div className="icons">
        {!isLoggedIn ? (
          <Link href="/login">
            Sign In
          </Link>
        ) : (
          <></>
        )}
        <Link href="/home/profile">
          <UserOutlined className="iconSvg" onClick={(e) => handleProtectedLinkClick(e, '/home/profile')} />
        </Link>
      </div>

      <Button className="toggleButton" onClick={toggleMenu} icon={<MenuOutlined />} />

      <Drawer
        title="Menu"
        placement="right"
        onClose={toggleMenu}
        open={isOpen}
        bodyStyle={{ padding: 0 }}
      >
        <Menu mode="vertical" className="drawer-menu">
          <Menu.Item key="home">
            <Link href="/main" onClick={(e) => handleProtectedLinkClick(e, '/main')}>
              Home
            </Link>
          </Menu.Item>
          <Menu.Item key="services">
            <Link href="/services" onClick={(e) => handleProtectedLinkClick(e, '/services')}>
              Services
            </Link>
          </Menu.Item>
          <Menu.Item key="about">
            <Link href="/about">About</Link>
          </Menu.Item>
          <Menu.Item key="contact">
            <Link href="/contact">Contact</Link>
          </Menu.Item>
          <Menu.Item key="profile">
            <Link href="/home/profile" onClick={(e) => handleProtectedLinkClick(e, '/home/profile')}>
              Profile
            </Link>
          </Menu.Item>
        </Menu>
      </Drawer>
    </nav>
  );
};

export default Header;
