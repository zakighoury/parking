"use client";
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBuildings } from '../../lib/features/auth/buildingSlice';
import { Card, Col, Row } from 'antd';
import { RootState } from '../../lib/store';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import './BuildingList.css'; // Import the CSS file
import { HomeOutlined } from '@ant-design/icons'; // Import icon
import HomeLayout from '../home/layout';

interface Building {
  _id: string;
  ImgUrl: string;
  name: string;
  address: string;
  price: number;
  status: string;
}

const BuildingList: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter(); // Initialize useRouter
  const buildings = useSelector((state: RootState) => state.buildings);

  useEffect(() => {
    dispatch(fetchBuildings());
  }, [dispatch]);

  const handleCardClick = (buildingId: string) => {
    router.push(`/buildings/${buildingId}`);
  };

  const getStatusStyle = (status: string) => {
    return status === 'reserved'
      ? {
          color: 'red',
          // padding: '5px 19px',
          fontWeight: 'bold',
        }
      : {
          color: '#3FF07B',
          // padding: '5px 19px',
          fontWeight: 'bold',
        };
  };

  return (
    <HomeLayout>
      <div className='building-list'>
        <h1>Buildings</h1>
        <Row gutter={[16, 16]} justify="center">
          {buildings.map((building: Building) => (
            <Col key={building._id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={<img alt={building.name} src={building.ImgUrl} />}
                className="building-card"
                onClick={() => handleCardClick(building._id)} // Use onClick for navigation
              >
                <div className="card-icon">
                  <HomeOutlined />
                </div>
                <Card.Meta title={building.name} description={building.address} />
                <div className="building-price">${building.price}</div>
                <div className='building-status' style={getStatusStyle(building.status)}>{building.status}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </HomeLayout>
  );
};

export default BuildingList;
