// Import necessary modules and components
import { useEffect, useState } from 'react';
import { Card, List, Typography, Spin, Alert } from 'antd';
import { Building } from '../types'; // Adjust import based on your project structure

const { Title } = Typography;

const Page = () => {
    // Define state for buildings and loading/error status
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch building data from API
    const fetchBuildingData = async () => {
        try {
            const response = await fetch('http://localhost:5000/admin/api/buildings/all/reserve');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('API Response:', data);
            setBuildings(data);
        } catch (error) {
            console.error('Error fetching building data:', error);
            setError('Failed to fetch building data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchBuildingData();
    }, []);

    // Handle loading and error states
    if (loading) {
        return <Spin size="large" />;
    }

    if (error) {
        return <Alert message={error} type="error" showIcon />;
    }

    return (
        <div style={{ padding: '20px' }}>
            <Title level={2}>Building List</Title>
            <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={buildings}
                renderItem={building => (
                    <List.Item>
                        <Card
                            title={building.name}
                            cover={<img alt={building.name} src={building.ImgUrl} />}
                        >
                            <p><strong>Address:</strong> {building.address}</p>
                            <p><strong>Description:</strong> {building.description}</p>
                            <p><strong>Provider:</strong> {building.providerName}</p>
                            <p><strong>Price:</strong> ${building.price}</p>
                            <p><strong>Status:</strong> {building.status}</p>
                            <p><strong>Phone Number:</strong> {building.phoneNumber}</p>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Page;
