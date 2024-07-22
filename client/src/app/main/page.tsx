// "use client";
// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { Card, Spin, Row, Col } from "antd";
// import Link from "next/link";
// // import HomeLayout from "../home/layout";
// import { fetchBuildings } from "../../lib/features/auth/buildingSlice";
// import { RootState } from "../../lib/store";
// import "./buildingList.css"; // Import your CSS file
// import Cookies from "js-cookie";
// const { Meta } = Card;

// const BuildingList: React.FC = () => {
//   const dispatch = useDispatch();
//   const buildings = useSelector(
//     (state: RootState) => state.buildings.buildings
//   );
//   const loading = useSelector((state: RootState) => state.buildings.loading);

//   useEffect(() => {
//     dispatch(fetchBuildings());
//   }, [dispatch]);

//   // Check user role from cookies
//   const role = Cookies.get("role");

//   // Redirect to login if the role is not "provider" or "customer"
//   useEffect(() => {
//     if (role !== "provider" && role !== "customer") {
//       window.location.href = "/login";
//     }
//   }, [role]);

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <Spin tip="Loading..." />
//       </div>
//     );
//   }

//   return (
//     // <HomeLayout>
//       <div className="building-list-container">
//         <Row gutter={[16, 16]}>
//           {buildings (
//             buildings.map((building) => (
//               <Col key={building._id} xs={24} sm={12} md={8} lg={6}>
//                 <Link href={`/buildings/${building._id}`} passHref>
//                   <Card
//                     hoverable
//                     cover={
//                       <img
//                         className="building-image"
//                         alt={building.name}
//                         src={building.ImgUrl}
//                       />
//                     }
//                   >
//                     <Meta 
//                       title={building.name} 
//                       description={
//                         role === "customer" && building.status === "reserved" 
//                           ? `Buyer: ${building.buyerName}` 
//                           : null
//                       }
//                     />
//                   </Card>
//                 </Link>
//               </Col>
//             ))
//           ) : (
//             <div>No buildings available.</div>
//           )}
//         </Row>
//       </div>
//     // </HomeLayout>
//   );
// };

// export default BuildingList;
export default function Main(){
  return(
    <div>page</div>
  )
}