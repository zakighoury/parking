// pages/403.tsx
import React from "react";
import { Result, Button } from "antd";
import Link from "next/link";

const ForbiddenPage: React.FC = () => {
  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Link href="/">
          <Button type="primary">Back Home</Button>
        </Link>
      }
    />
  );
};

export default ForbiddenPage;
