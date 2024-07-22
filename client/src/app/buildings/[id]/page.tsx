"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, Spin, Typography, Tag, Alert, Button, Modal, Form, Input, notification } from "antd";
import { HomeOutlined, EnvironmentOutlined, InfoCircleOutlined } from "@ant-design/icons";
import HomeLayout from "./../../home/layout";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../lib/store';
import { fetchBuildingDetails, buyBuilding, leaveBuilding, cancelReservation, reserveSlot } from "../../../lib/features/auth/buildingDetailsSlice";
import { socket } from "../../socket"; // Import the socket instance
import "../BuildingDetails.css";
import Cookies from 'js-cookie'; // Import js-cookie

const { Title, Paragraph } = Typography;

interface Building {
  _id: string;
  name: string;
  address: string;
  description: string;
  ImgUrl: string;
  price: number;
  isBought: boolean;
  floors: Floor[];
}

interface Floor {
  number: number;
  slots: Slot[];
}

interface Slot {
  number: number;
  isAvailable: boolean;
  isReserved: boolean;
  reservationTime?: string;
  vehicleType?: string;
}

const BuildingDetails: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const building = useSelector((state: RootState) => state.buildingDetails.building) as Building | null;
  const loading = useSelector((state: RootState) => state.buildingDetails.loading);
  const error = useSelector((state: RootState) => state.buildingDetails.error);
  const [isBuyBuildingModalVisible, setIsBuyBuildingModalVisible] = useState<boolean>(false);
  const [isLeaveBuildingModalVisible, setIsLeaveBuildingModalVisible] = useState<boolean>(false);
  const [isReserveModalVisible, setIsReserveModalVisible] = useState<boolean>(false);
  const [price, setPrice] = useState<number>(0);
  const [role, setRole] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<{ floorNumber: number, slotNumber: number } | null>(null);

  useEffect(() => {
    // Retrieve the role from cookies
    const userRole = Cookies.get('role');
    setRole(userRole || '');
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(fetchBuildingDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (building) {
      setPrice(building.price); // Set price from the fetched building details
    }
  }, [building]);

  useEffect(() => {
    // Handle socket connection events
    const handleNotification = (data: any) => {
      if (data.type === 'reserveSlot') {
        dispatch(fetchBuildingDetails(id));
      }
      const message = `Type: ${data.type}, Details: ${JSON.stringify(data)}`;
      notification.info({
        message: 'Notification',
        description: message,
      });
    };

    socket.on('emailNotification', handleNotification);

    return () => {
      socket.off('emailNotification', handleNotification); // Clean up the listener
    };
  }, [dispatch, id]);

  const handleModalClose = () => {
    setIsBuyBuildingModalVisible(false);
    setIsLeaveBuildingModalVisible(false);
    setIsReserveModalVisible(false);
    setSelectedSlot(null);
  };

  const handleBuyBuilding = () => {
    setIsBuyBuildingModalVisible(true);
  };

  const handleConfirmBuyBuilding = async (values: { providerName: string; phoneNumber: string; cardDetails: string; }) => {
    const { providerName, phoneNumber, cardDetails } = values;
    try {
      await dispatch(buyBuilding({ id, providerName, phoneNumber, cardDetails, price }));
      dispatch(fetchBuildingDetails(id));
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to buy building.' });
    } finally {
      handleModalClose();
    }
  };

  const handleLeaveBuilding = () => {
    setIsLeaveBuildingModalVisible(true);
  };

  const handleConfirmLeaveBuilding = async (values: { leaveReason: string; }) => {
    const { leaveReason } = values;
    try {
      await dispatch(leaveBuilding({ id, leaveReason }));
      dispatch(fetchBuildingDetails(id));
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to leave building.' });
    } finally {
      handleModalClose();
    }
  };

  const handleReserveSlot = (floorNumber: number, slotNumber: number) => {
    setSelectedSlot({ floorNumber, slotNumber });
    setIsReserveModalVisible(true);
  };

  const handleConfirmReserveSlot = async (values: { reservationTime: string, vehicleType: string }) => {
    if (selectedSlot) {
      try {
        await dispatch(reserveSlot({ id, floorNumber: selectedSlot.floorNumber, slotNumber: selectedSlot.slotNumber, ...values }));
        dispatch(fetchBuildingDetails(id));
        notification.success({ message: 'Reservation Confirmed', description: `Your reservation for Floor ${selectedSlot.floorNumber}, Slot ${selectedSlot.slotNumber} is confirmed.` });
      } catch (error) {
        notification.error({ message: 'Error', description: 'Failed to reserve slot.' });
      } finally {
        setIsReserveModalVisible(false);
        setSelectedSlot(null);
      }
    }
  };

  const handleCancelReservation = async (floorNumber: number, slotNumber: number) => {
    try {
      await dispatch(cancelReservation({ id, floorNumber, slotNumber }));
      dispatch(fetchBuildingDetails(id));
      notification.info({
        message: 'Reservation Cancelled',
        description: `Floor ${floorNumber}, Slot ${slotNumber} has been cancelled.`,
      });
    } catch (error) {
      notification.error({ message: 'Error', description: 'Failed to cancel reservation.' });
    }
  };

  const renderSlots = () => {
    if (!building || !building.floors) return null;

    return building.floors.map((floor, floorIndex) => (
      <div key={floorIndex}>
        <Title level={4}>Floor {floor.number}</Title>
        {floor.slots
          .map((slot, slotIndex) => {
            // Determine availability and reservation status
            const isAvailable = slot.isAvailable && !slot.isReserved;
            const tagColor = isAvailable ? "green" : "red";
            const tagLabel = isAvailable ? `Slot ${slot.number} - Available` : `Slot ${slot.number} - Reserved`;

            return (
              <Tag
                key={slotIndex}
                color={tagColor}
                className={`slotTag ${slot.isReserved && role === 'provider' ? 'slotTagReserved' : ''}`}
                onClick={() => {
                  if (role === 'customer' && isAvailable) {
                    handleReserveSlot(floor.number, slot.number);
                  }
                }}
              >
                {tagLabel}
                {slot.isReserved  && (
                  <div>
                    {/* <Paragraph><strong>Reservation Time:</strong> {slot.reservationTime}</Paragraph> */}
                    <Paragraph><strong>Vehicle Type:</strong> {slot.vehicleType}</Paragraph>
                    <Button
                      type="link"
                      onClick={() => handleCancelReservation(floor.number, slot.number)}
                    >
                      Cancel Reservation
                    </Button>
                  </div>
                )}
              </Tag>
            );
          })}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="loadingContainer">
        <Spin tip="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="errorContainer">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!building) {
    return null;
  }

  return (
    <HomeLayout>
      <Card
        className="buildingDetailsCard"
        cover={<img src={building.ImgUrl} alt={building.name} className="buildingImage" />}
      >
        <Title level={2} className="buildingTitle">{building.name}</Title>
        <Paragraph><HomeOutlined className="icon" /> {building.address}</Paragraph>
        <Paragraph><EnvironmentOutlined className="icon" /> {building.description}</Paragraph>
        <Paragraph><InfoCircleOutlined className="icon" /> Price: ${building.price}</Paragraph>
        {role === 'provider' && !building.isBought && (
          <Button type="primary" onClick={handleBuyBuilding}>
            Buy Building
          </Button>
        )}
        {role === 'provider' && building.isBought && (
          <Button type="primary" danger onClick={handleLeaveBuilding}>
            Leave Building
          </Button>
        )}
        {renderSlots()}
      </Card>

      <Modal
        title="Buy Building"
        visible={isBuyBuildingModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <Form onFinish={handleConfirmBuyBuilding}>
          <Form.Item name="providerName" label="Provider Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="cardDetails" label="Card Details" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Confirm Purchase
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Leave Building"
        visible={isLeaveBuildingModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <Form onFinish={handleConfirmLeaveBuilding}>
          <Form.Item name="leaveReason" label="Reason for Leaving" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Confirm Leave
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Reserve Slot"
        visible={isReserveModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <Form onFinish={handleConfirmReserveSlot}>
          <Form.Item name="reservationTime" label="Reservation Time" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="vehicleType" label="Vehicle Type" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Confirm Reservation
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </HomeLayout>
  );
};

export default BuildingDetails;
