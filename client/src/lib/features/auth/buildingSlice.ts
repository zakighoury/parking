// features/buildingsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from "js-cookie";

// Helper function to get auth token and role from cookies
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");
  return {
    Authorization: `Bearer ${token}`,
    'X-User-Role': role || "" // Add role to headers with a custom header name
  };
};

export const fetchBuildings = createAsyncThunk('buildings/fetchBuildings', async () => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/buildings`, {
    headers: getAuthHeaders(),
  });
  console.log(response, "data");
  return response.data;
});

const buildingsSlice = createSlice({
  name: 'buildings',
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBuildings.fulfilled, (state, action) => action.payload);
  },
});

export default buildingsSlice.reducer;
