import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
interface Slot {
  number: number;
  isAvailable: boolean;
  isReserved: boolean;
  reservationStartTime?: string;
  reservationEndTime?: string;
  vehicleType?: string;
}

interface Floor {
  number: number;
  slots: Slot[];
}

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

interface BuildingState {
  building: Building | null;
  loading: boolean;
  error: string | null;
}

const initialState: BuildingState = {
  building: null,
  loading: false,
  error: null,
};
const getHeaderToken = () => {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchBuildingDetails = createAsyncThunk(
  'buildingDetails/fetchBuildingDetails',
  async (id: string) => {
    const response = await axios.get(`http://localhost:5000/api/buildings/${id}`,{ headers: getHeaderToken() });
    return response.data;
  }
);

export const buyBuilding = createAsyncThunk(
  'buildingDetails/buyBuilding',
  async ({ id, providerName, phoneNumber, cardDetails, price }: { id: string; providerName: string; phoneNumber: string; cardDetails: string; price: number }) => {
    const response = await axios.post(`http://localhost:5000/api/building/${id}/buy`, { providerName, phoneNumber, cardDetails, price }, { headers: getHeaderToken() });
    return response.data;
  }
);

export const leaveBuilding = createAsyncThunk(
  'buildingDetails/leaveBuilding',
  async ({ id, leaveReason }: { id: string; leaveReason: string }) => {
    const response = await axios.post(`http://localhost:5000/api/building/${id}/leave`, { leaveReason }, { headers: getHeaderToken() });
    return response.data;
  }
);

export const reserveSlot = createAsyncThunk(
  'buildingDetails/reserveSlot',
  async ({ id, floorNumber, slotNumber, reservationStartTime, reservationEndTime, vehicleType }: {
    id: string;
    floorNumber: number;
    slotNumber: number;
    reservationStartTime: string;
    reservationEndTime: string;
    vehicleType: string;
  }) => {
    const response = await axios.post(`http://localhost:5000/api/building/${id}/reserve`, {
      floorNumber,
      slotNumber,
      reservationStartTime,
      reservationEndTime,
      vehicleType
    }, { headers: getHeaderToken() });
    return response.data;
  }
);

export const cancelReservation = createAsyncThunk(
  'buildingDetails/cancelReservation',
  async ({ id, floorNumber, slotNumber }: { id: string; floorNumber: number; slotNumber: number }) => {
    const response = await axios.post(`http://localhost:5000/api/building/${id}/cancel`, { floorNumber, slotNumber }, { headers: getHeaderToken() });
    return response.data;
  }
);

const buildingDetailsSlice = createSlice({
  name: 'buildingDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuildingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuildingDetails.fulfilled, (state, action) => {
        state.building = action.payload;
        state.loading = false;
      })
      .addCase(fetchBuildingDetails.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch building details';
        state.loading = false;
      })
      .addCase(buyBuilding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyBuilding.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(buyBuilding.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to buy building';
        state.loading = false;
      })
      .addCase(leaveBuilding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveBuilding.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(leaveBuilding.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to leave building';
        state.loading = false;
      })
      .addCase(reserveSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reserveSlot.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(reserveSlot.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to reserve slot';
        state.loading = false;
      })
      .addCase(cancelReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to cancel reservation';
        state.loading = false;
      });
  }
});

export default buildingDetailsSlice.reducer;
