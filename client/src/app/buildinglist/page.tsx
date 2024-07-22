// components/BuildingList.tsx
"use client";
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBuildings } from '../../lib/features/auth/buildingSlice';
import { Card, Col, Row } from 'antd';
import { RootState } from '../../lib/store';
import Link from 'next/link';

const BuildingList: React.FC = () => {
  const dispatch = useDispatch();
  const buildings = useSelector((state: RootState) => state.buildings);

  useEffect(() => {
    dispatch(fetchBuildings());
  }, [dispatch]);

  return (
    <Row gutter={[16, 16]}>
      {buildings.map((building: Building) => (
        <Col key={building._id} xs={24} sm={12} md={8} lg={6}>
          <Link href={`/buildings/${building._id}`} passHref>
            <Card
              hoverable
              cover={<img alt={building.name} src={building.ImgUrl} />}
            >
              <Card.Meta title={building.name} description={building.address} />
              <div className="building-price">${building.price}</div>
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
};

export default BuildingList;
