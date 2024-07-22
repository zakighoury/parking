import { message } from "antd";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { signin as signinAction } from "./authSlice"; 
import Cookies from "js-cookie";
export const authThunks = {
  signup: createAsyncThunk(
    "auth/signup",
    async (
      values: { name: string; email: string; role: string; password: string },
      { rejectWithValue }
    ) => {
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up`,
          values
        );
        if (data.success) {
          message.success(data.message); // Display success message
          window.location.href = "/login";
          return true;
        }
      } catch (error: any) {
        console.error("Error signing up:", error.response.data.message);
        return rejectWithValue("Error signing up, please try again");
      }
    }
  ),

  signin: createAsyncThunk(
    "auth/signin",
    async (
      values: { email: string; password: string , role: string},
      { rejectWithValue, dispatch }
    ) => {
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in`,
          values
        );
        if (data.success) {
          dispatch(signinAction({ user: data.user}));
          message.success(data.message); // Display success message
          const { token } = data;
          Cookies.set("auth" ,JSON.stringify(data.user), { path: "/" });
          Cookies.set("token",token,{path:"/"});
         Cookies.set("role", data.user.role, { path: "/" });
          Cookies.set("userId", data.user._id, { path: "/" });
          Cookies.set("isLoggedIn",data.user.isLoggedIn,{path:"/"});

          window.location.href = "/buildinglist";
          // console.log(data.user ,"datauser")
          return data.user;
        }
      } catch (error: any) {
        console.error("Error signing in:", error.response.data.message);
        return rejectWithValue("Error signing in, please try again!");
      }
    }
  ),

  signout: createAsyncThunk(
    "auth/signout",
    async (_, { rejectWithValue, dispatch }) => {
      try {
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-out`);
        if (data.success) {
          Cookies.remove("auth", { path: "/" });
          Cookies.remove("role", { path: "/" });
          Cookies.remove("userId", { path: "/" });
          Cookies.remove("token", { path: "/" });          
          Cookies.remove("isLoggedIn",{path:"/"});
          Cookies.remove("role",{path:"/"});

          return true;
        }
      } catch (error: any) {
        console.error("Error logging out:", error.response.data.message);
        return rejectWithValue("Error logging out, please try again!");
      }
    }
  ),
};
