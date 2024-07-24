"use client";
import { useState } from "react";
import { useDispatch } from "react-redux"; // Import useDispatch
import { Button, Typography, Form, Input, message } from "antd";
import { Icons } from "../../components/ui/icons";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { googleAuth } from "../../helpers";
import { authThunks } from "../../lib/features/auth/authThunks";
import HomeLayout from "../home/layout";
import "./style.css";

const { Title, Text } = Typography;

export default function SignInPage() {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    email: string;
    password: string;
    role: string;
  }) => {
    setLoading(true);
    try {
      await dispatch(authThunks.signin(values));
      // message.success("Sign in successful!");
    } catch (error) {
      message.error("Sign in failed. Please try again.");
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeLayout>
      <div className="signin-page">
      <div className="signin-page-container">
        <div className="signin-form-container">
          <div className="signin-form">
            <Title level={3} className="signin-title" style={{ fontSize: "24px" ,textTransform: "uppercase",color: "#A1FC00"}}>
              Sign In to Your Account
            </Title>
            <div className="social-login">
              <Button
                type="primary"
                block
                onClick={googleAuth}
                className="google-btn"
              >
                <Icons.google className="mr-2 h-4 w-4" />
                Sign Up with Google
              </Button>
              <div className="or-divider">
                <div className="border-line"></div>
                <div className="or-text">Or continue with</div>
                <div className="border-line"></div>
              </div>
            </div>
            <Form
              name="signin"
              layout="vertical"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please enter your password!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="ant-btn-primary"
                  size="large"
                  loading={loading}
                  block
                >
                  Sign In
                </Button>
              </Form.Item>
              <div className="signin-footer">
                <Text style={{fontSize: "18px"}}>
                  Don't have an account? <Link href="/signup">Sign Up</Link>
                </Text>
              </div>
            </Form>
          </div>
        </div>
      </div>
      </div>
    </HomeLayout>
  );
}
