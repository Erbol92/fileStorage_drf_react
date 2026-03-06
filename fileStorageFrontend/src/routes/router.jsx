import { createBrowserRouter } from 'react-router'
import { ROUTES } from './routes'
import { MainTemplate} from '../Layout/MainTemplate'
import { AuthPage } from '../pages/AuthPage/AuthPage'
import { DashboardPage } from '../pages/DashboardPage'
import { AuthInfo } from '../pages/AuthPage/AuthInfo'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { AdminPage } from '../pages/AdminPage'

export const router = createBrowserRouter([
    {
        path: ROUTES.HOME,
        element: <MainTemplate/>,
        children: [
            {
                path: ROUTES.HOME,
                exact: true,
                element: <AuthPage />
            },
            {
                path: ROUTES.DASHBOARD,
                element: <DashboardPage />
            },
            {
                path: ROUTES.AUTH_INFO,
                element: <AuthInfo />
            },
            {
                path: ROUTES.USER_ADMIN,
                element: <ProtectedRoute children={<AdminPage/>} />
            },
        ]
    }
])


        //     {
        //         path: R.SERVICE_DETAIL(':id'),
        //         exact: true,
        //         element: <ServiceDetail/>
        //     },AuthInfo