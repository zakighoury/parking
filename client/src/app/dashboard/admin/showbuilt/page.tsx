import React, { useEffect, useState } from 'react';
import { Collapse, Modal, Button, Input, Form, Row, Col, Typography, Spin, message } from 'antd';
import axios from 'axios';
import Cookies from "js-cookie";

const { Panel } = Collapse;
const { Title } = Typography;

interface Slot {
  number: number;
  isAvailable: boolean;
}

interface Floor {
  number: number;
  slots: Slot[];
}

interface Building {
  ImgUrl: string;
  name: string;
  address: string;
  floors: Floor[];
  description: string;
  isBought?: boolean;
  buyerName?: string;
  _id: string;
}

const BuildingManagementPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBuildingModalVisible, setIsBuildingModalVisible] = useState(false);
  const [isFloorModalVisible, setIsFloorModalVisible] = useState(false);
  const [isSlotModalVisible, setIsSlotModalVisible] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  const [currentFloor, setCurrentFloor] = useState<Floor | null>(null);
  const [currentSlot, setCurrentSlot] = useState<Slot | null>(null);
  const [form] = Form.useForm();

  const fetchBuildings = async () => {
    try {
      const token = Cookies.get("token");
      const role = Cookies.get("role");
      const response = await axios.get('http://localhost:5000/admin/api/buildings/all', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-Role': role || ""
        }
      });
      setBuildings(response.data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      message.error('Failed to fetch buildings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const getAuthHeaders = () => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");
    return {
      Authorization: `Bearer ${token}`,
      'X-User-Role': role || ""
    };
  };

  const showBuildingModal = (building: Building) => {
    setCurrentBuilding(building);
    setIsBuildingModalVisible(true);
    form.setFieldsValue(building);
  };

  const showFloorModal = (building: Building, floor: Floor) => {
    setCurrentBuilding(building);
    setCurrentFloor(floor);
    setIsFloorModalVisible(true);
    form.setFieldsValue(floor);
  };

  const showSlotModal = (building: Building, floor: Floor, slot: Slot) => {
    setCurrentBuilding(building);
    setCurrentFloor(floor);
    setCurrentSlot(slot);
    setIsSlotModalVisible(true);
    form.setFieldsValue(slot);
  };

  const handleCancel = () => {
    setIsBuildingModalVisible(false);
    setIsFloorModalVisible(false);
    setIsSlotModalVisible(false);
    form.resetFields();
  };

  const handleBuildingOk = async () => {
    try {
      const values = form.getFieldsValue();
      await axios.put(`http://localhost:5000/admin/api/buildings/${currentBuilding?._id}`, values, {
        headers: getAuthHeaders(),
      });
      fetchBuildings(); // Ensure fetchBuildings is in scope
      message.success('Building updated successfully!');
    } catch (error) {
      console.error('Error updating building:', error);
      message.error('Failed to update building.');
    }
    setIsBuildingModalVisible(false);
  };

  const handleFloorOk = async () => {
    try {
      const values = form.getFieldsValue();
      await axios.put(`http://localhost:5000/admin/api/buildings/${currentBuilding?._id}/floors/${currentFloor?.number}`, values, {
        headers: getAuthHeaders(),
      });
      fetchBuildings(); // Ensure fetchBuildings is in scope
      message.success('Floor updated successfully!');
    } catch (error) {
      console.error('Error updating floor:', error);
      message.error('Failed to update floor.');
    }
    setIsFloorModalVisible(false);
  };

  const handleSlotOk = async () => {
    try {
      const values = form.getFieldsValue();
      await axios.put(`http://localhost:5000/admin/api/buildings/${currentBuilding?._id}/floors/${currentFloor?.number}/slots/${currentSlot?.number}`, values, {
        headers: getAuthHeaders(),
      });
      fetchBuildings(); // Ensure fetchBuildings is in scope
      message.success('Slot updated successfully!');
    } catch (error) {
      console.error('Error updating slot:', error);
      message.error('Failed to update slot.');
    }
    setIsSlotModalVisible(false);
  };

  const handleDeleteBuilding = async (buildingId: string) => {
    try {
      await axios.delete(`http://localhost:5000/admin/api/buildings/${buildingId}`, {
        headers: getAuthHeaders(),
      });
      fetchBuildings(); // Ensure fetchBuildings is in scope
      message.success('Building deleted successfully!');
    } catch (error) {
      console.error('Error deleting building:', error);
      message.error('Failed to delete building.');
    }
  };

  const handleDeleteFloor = async (buildingId: string, floorNumber: number) => {
    try {
      await axios.delete(`http://localhost:5000/admin/api/buildings/${buildingId}/floors/${floorNumber}`, {
        headers: getAuthHeaders(),
      });
      fetchBuildings(); // Ensure fetchBuildings is in scope
      message.success('Floor deleted successfully!');
    } catch (error) {
      console.error('Error deleting floor:', error);
      message.error('Failed to delete floor.');
    }
  };

  const handleDeleteSlot = async (buildingId: string, floorNumber: number, slotNumber: number) => {
    try {
      await axios.delete(`http://localhost:5000/admin/api/buildings/${buildingId}/floors/${floorNumber}/slots/${slotNumber}`, {
        headers: getAuthHeaders(),
      });
      fetchBuildings(); // Ensure fetchBuildings is in scope
      message.success('Slot deleted successfully!');
    } catch (error) {
      console.error('Error deleting slot:', error);
      message.error('Failed to delete slot.');
    }
  };

  const userRole = Cookies.get("role");
  if (userRole !== "admin") {
    window.location.href = "/home/403";
    return null;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin tip="Loading..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Building Management</Title>
      <Row gutter={[16, 16]}>
        {buildings.map((building) => (
          <Col span={8} key={building._id}>
            <Collapse>
              <Panel header={building.name} key={building._id}>
                <img src={building.ImgUrl} alt={building.name} style={{ width: '100%' }} />
                <p>{building.address}</p>
                <p>{building.description}</p>
                <p>Buyer: {building.buyerName || 'Not bought yet'}</p>
                <Button type="primary" onClick={() => showBuildingModal(building)}>Edit Building</Button>
                <Button type="danger" onClick={() => handleDeleteBuilding(building._id)} style={{ marginLeft: '10px' }}>Delete Building</Button>
                <Collapse>
                  {building.floors.map((floor) => (
                    <Panel header={`Floor ${floor.number}`} key={floor.number}>
                      <Button type="primary" onClick={() => showFloorModal(building, floor)}>Edit Floor</Button>
                      <Button type="danger" onClick={() => handleDeleteFloor(building._id, floor.number)} style={{ marginLeft: '10px' }}>Delete Floor</Button>
                      {floor.slots.map((slot) => (
                        <div key={slot.number}>
                          <p>
                            Slot {slot.number} - {slot.isAvailable ? 'Available' : 'Reserved'}
                            <Button type="link" onClick={() => showSlotModal(building, floor, slot)}>Edit Slot</Button>
                            <Button type="danger" onClick={() => handleDeleteSlot(building._id, floor.number, slot.number)} style={{ marginLeft: '10px' }}>Delete Slot</Button>
                          </p>
                        </div>
                      ))}
                    </Panel>
                  ))}
                </Collapse>
              </Panel>
            </Collapse>
          </Col>
        ))}
      </Row>

      {/* Building Edit Modal */}
      <Modal
        title="Edit Building"
        visible={isBuildingModalVisible}
        onOk={handleBuildingOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ImgUrl" label="Image URL">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="isBought" label="Is Bought" valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
          {form.getFieldValue('isBought') && (
            <Form.Item name="buyerName" label="Buyer Name">
              <Input />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="Edit Floor"
        visible={isFloorModalVisible}
        onOk={handleFloorOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="number" label="Floor Number" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Slot"
        visible={isSlotModalVisible}
        onOk={handleSlotOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="number" label="Slot Number" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="isAvailable" label="Is Available" valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BuildingManagementPage;
