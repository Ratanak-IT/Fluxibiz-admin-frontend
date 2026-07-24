
import { adminApi } from '@/services/adminApi'
import {configureStore} from '@reduxjs/toolkit'

// set up the store
export const makeStore = () => {
  return configureStore({
    reducer: {
      [adminApi.reducerPath]: adminApi.reducer
    },
    middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware().concat(adminApi.middleware)
    
  }) 
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']