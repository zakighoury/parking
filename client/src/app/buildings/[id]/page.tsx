"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  Spin,
  Typography,
  Tag,
  Alert,
  Button,
  Modal,
  Form,
  Input,
  notification,
  DatePicker
} from "antd";
import { HomeOutlined, EnvironmentOutlined, InfoCircleOutlined } from "@ant-design/icons";
import HomeLayout from "../../home/layout";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../lib/store';
import { fetchBuildingDetails, buyBuilding, leaveBuilding, cancelReservation, reserveSlot } from "../../../lib/features/auth/buildingDetailsSlice";
import { socket } from "../../socket";
import Cookies from 'js-cookie';
import dayjs, { Dayjs } from 'dayjs';
import '../BuildingDetails.css'; // Import the CSS file

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
  reservationStartTime?: string;
  reservationEndTime?: string;
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
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
      setPrice(building.price);
    }
  }, [building]);

  useEffect(() => {
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
      socket.off('emailNotification', handleNotification);
    };
  }, [dispatch, id]);

  const handleModalClose = () => {
    setIsBuyBuildingModalVisible(false);
    setIsLeaveBuildingModalVisible(false);
    setIsReserveModalVisible(false);
    setSelectedSlot(null);
    setIsSubmitting(false);
  };

  const handleBuyBuilding = () => {
    setIsBuyBuildingModalVisible(true);
  };

  const handleConfirmBuyBuilding = async (values: { providerName: string; phoneNumber: string; cardDetails: string; }) => {
    setIsSubmitting(true);
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
    setIsSubmitting(true);
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

  const handleConfirmReserveSlot = async (values: { reservationStartDateTime: Dayjs, reservationEndDateTime: Dayjs, vehicleType: string }) => {
    if (selectedSlot) {
      const reservationStartDateTime = values.reservationStartDateTime.format('YYYY-MM-DD HH:mm:ss');
      const reservationEndDateTime = values.reservationEndDateTime.format('YYYY-MM-DD HH:mm:ss');
      setIsSubmitting(true);

      try {
        await dispatch(reserveSlot({
          id,
          floorNumber: selectedSlot.floorNumber,
          slotNumber: selectedSlot.slotNumber,
          reservationStartTime: reservationStartDateTime,
          reservationEndTime: reservationEndDateTime,
          vehicleType: values.vehicleType
        }));

        socket.emit('reserveSlot', {
          id,
          floorNumber: selectedSlot.floorNumber,
          slotNumber: selectedSlot.slotNumber,
          reservationStartTime: reservationStartDateTime,
          reservationEndTime: reservationEndDateTime,
          vehicleType: values.vehicleType,
          price,
        });

        dispatch(fetchBuildingDetails(id));

        notification.success({
          message: 'Reservation Confirmed',
          description: `Your reservation for Floor ${selectedSlot.floorNumber}, Slot ${selectedSlot.slotNumber} is confirmed from ${reservationStartDateTime} to ${reservationEndDateTime}.`,
        });
      } catch (error) {
        notification.error({ message: 'Error', description: 'Failed to reserve slot.' });
      } finally {
        handleModalClose();
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
        {floor.slots.map((slot, slotIndex) => {
          const isAvailable = slot.isAvailable && !slot.isReserved;
          const tagColor = isAvailable ? "#3FF07B" : "red";
          const tagLabel = isAvailable ? `Slot ${slot.number} - Available` : `Slot ${slot.number} - Reserved`;

          return (
            <Tag
              key={slotIndex}
              color={tagColor}
              style={{padding:"5px 19px"}}
              className={`slotTag ${slot.isReserved && role === 'provider' ? 'slotTagReserved' : ''}`}
              onClick={() => {
                if (role === 'customer' && isAvailable) {
                  handleReserveSlot(floor.number, slot.number);
                }
              }}
            >
              {tagLabel}
              {slot.isReserved && (
                <div>
                  <Paragraph><strong>Vehicle Type:</strong> {slot.vehicleType}</Paragraph>
                  <Paragraph><strong>Reservation Start Time:</strong> {slot.reservationStartTime ? dayjs(slot.reservationStartTime).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</Paragraph>
                  <Paragraph><strong>Reservation End Time:</strong> {slot.reservationEndTime ? dayjs(slot.reservationEndTime).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</Paragraph>
                  <Button type="link" onClick={() => handleCancelReservation(floor.number, slot.number)}>Cancel Reservation</Button>
                </div>
              )}
            </Tag>
          );
        })}
      </div>
    ));
  };

  return (
    <HomeLayout>
      <Card className="buildingDetailsCard" cover={<img alt="building" src={building?.ImgUrl} className="buildingImage" />}>
        <Title level={2} className="buildingTitle">{building?.name}</Title>
        <Paragraph className="buildingAddress"><EnvironmentOutlined /> {building?.address}</Paragraph>
        <Paragraph className="buildingDescription"><InfoCircleOutlined /> {building?.description}</Paragraph>
        <Paragraph className="buildingPrice">Price: ${building?.price}</Paragraph>
        <div className="buildingActions">
          {!building?.isBought && (
            <Button type="primary" onClick={handleBuyBuilding} disabled={role !== 'provider'}>
              Buy Building
            </Button>
          )}
          {building?.isBought && role === 'provider' && (
            <Button type="danger" onClick={handleLeaveBuilding}>
              Leave Building
            </Button>
          )}
        </div>
        <div className="buildingSlots">
          {renderSlots()}
        </div>
      </Card>

      <Modal
        title="Buy Building"
        visible={isBuyBuildingModalVisible}
        onCancel={handleModalClose}
        footer={null}
        confirmLoading={isSubmitting}
      >
        <Form
          name="buyBuilding"
          onFinish={handleConfirmBuyBuilding}
          layout="vertical"
        >
          <Form.Item
            name="providerName"
            label="Provider Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="cardDetails"
            label="Card Details"
            rules={[{ required: true, message: 'Please enter your card details' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Buy
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Leave Building"
        visible={isLeaveBuildingModalVisible}
        onCancel={handleModalClose}
        footer={null}
        confirmLoading={isSubmitting}
      >
        <Form
          name="leaveBuilding"
          onFinish={handleConfirmLeaveBuilding}
          layout="vertical"
        >
          <Form.Item
            name="leaveReason"
            label="Reason for Leaving"
            rules={[{ required: true, message: 'Please enter the reason for leaving' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Leave
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Reserve Slot"
        visible={isReserveModalVisible}
        onCancel={handleModalClose}
        footer={null}
        confirmLoading={isSubmitting}
      >
        <Form
          name="reserveSlot"
          onFinish={handleConfirmReserveSlot}
          layout="vertical"
        >
          <Form.Item
            name="reservationStartDateTime"
            label="Start Time"
            rules={[{ required: true, message: 'Please select the reservation start time' }]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            name="reservationEndDateTime"
            label="End Time"
            rules={[{ required: true, message: 'Please select the reservation end time' }]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            name="vehicleType"
            label="Vehicle Type"
            rules={[{ required: true, message: 'Please enter your vehicle type' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Reserve
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </HomeLayout>
  );
};

export default BuildingDetails;
