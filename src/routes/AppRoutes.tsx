import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Layout } from "../components/layout";
import Home from "../pages/Home";
import HostPage from "../pages/HostPage";
import ParticipantPage from "../pages/ParticipantPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="host" element={<HostPage />} />
                    <Route path="participant" element={<ParticipantPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
