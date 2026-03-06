import { configureStore } from "@reduxjs/toolkit";
import { persistedAuthReducer } from "./slices/authSlice";
import { registerSlice } from "./slices/registerSlice";
import createSagaMiddleware from 'redux-saga'
import { rootSaga } from "./sagas/rootSaga";
import { persistStore } from 'redux-persist';
import { fileSlice } from "./slices/fileSlice";
import { adminSlice } from "./slices/adminSlice"

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        reg: registerSlice.reducer,
        files: fileSlice.reducer,
        admin: adminSlice.reducer
        
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
    }).concat(sagaMiddleware),
})

export const persistor = persistStore(store);
sagaMiddleware.run(rootSaga)