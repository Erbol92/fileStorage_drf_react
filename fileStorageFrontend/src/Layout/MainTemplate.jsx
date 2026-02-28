import { Outlet } from "react-router-dom"
import { Header } from "./Header"

export const MainTemplate = () => {
    return (
        <div>
            <Header/>
            <main>
                <Outlet/>
            </main>
        </div>
    )
}