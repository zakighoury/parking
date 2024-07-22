import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

interface BuildingDetailsState {
  building: any | null;
  loading: boolean;
  error: string | null;
}

// Helper function to get auth token and role from cookies
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");
  return {
    Authorization: `Bearer ${token}`,
    Role: role || "" // Add role to headers
  };
};

const initialState: BuildingDetailsState = {
  building: null,
  loading: false,
  error: null,
};

// Thunks for API calls
export const fetchBuildingDetails = createAsyncThunk(
  "buildingDetails/fetchBuildingDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/buildings/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const reserveSlot = createAsyncThunk(
  'buildingDetails/reserveSlot',
  async ({ id, floorNumber, slotNumber, reservationTime, vehicleType }: { id: string; floorNumber: number; slotNumber: number; reservationTime: string; vehicleType: string; }) => {
    const response = await axios.post(
      `http://localhost:5000/api/building/${id}/reserve`, 
      { floorNumber, slotNumber, reservationTime, vehicleType }, // Request body
      { headers: getAuthHeaders() } // Request configuration
    );
    return response.data;
  }
);

export const cancelReservation = createAsyncThunk(
  "buildingDetails/cancelReservation",
  async (reservationData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/building/${reservationData.id}/cancel`, reservationData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const buyBuilding = createAsyncThunk(
  "buildingDetails/buyBuilding",
  async (buyData: { id: string; providerName: string; phoneNumber: string; cardDetails: string }, { rejectWithValue }) => {
    try {
      const { id, ...rest } = buyData;
      console.log(buyData ,"but")
      const response = await axios.post(`http://localhost:5000/api/building/${id}/buy`, rest, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const buyFloor = createAsyncThunk(
  "buildingDetails/buyFloor",
  async (floorData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/building/${floorData.id}/buyFloor`, floorData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

export const leaveBuilding = createAsyncThunk(
  "buildingDetails/leaveBuilding",
  async (leaveData: { id: string; leaveReason: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/building/${leaveData.id}/leave`, leaveData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);

const buildingDetailsSlice = createSlice({
  name: "buildingDetails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuildingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuildingDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.building = action.payload;
      })
      .addCase(fetchBuildingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(reserveSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reserveSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.building = action.payload;
      })
      .addCase(reserveSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.building = action.payload;
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(buyBuilding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyBuilding.fulfilled, (state, action) => {
        state.loading = false;
        state.building = action.payload;
      })
      .addCase(buyBuilding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(buyFloor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyFloor.fulfilled, (state, action) => {
        state.loading = false;
        state.building = action.payload;
      })
      .addCase(buyFloor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(leaveBuilding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveBuilding.fulfilled, (state, action) => {
        state.loading = false;
        state.building = action.payload;
      })
      .addCase(leaveBuilding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default buildingDetailsSlice.reducer;
