import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../lib/features/auth/authSlice";
// import buildingsReducer from "./reducer/buildingreducer";
import buildingsReducer from "./features/auth/buildingSlice";
import buildingDetailsReducer from './features/auth/buildingDetailsSlice';
export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      buildings: buildingsReducer,
      buildingDetails: buildingDetailsReducer,
      // building: buildingSlice,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
