import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/lib/baseApi";

import "@/features/businessManagement/businessAdminApi";
import "@/features/adminAuth/adminAuthApi";
import "@/features/catalog/unitApi";
import "@/features/platformUsers/platformUserApi";
import "@/features/business/businessApi";
import "@/features/shopStaff/shopStaffApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
