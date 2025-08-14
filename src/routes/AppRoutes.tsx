import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import HostPage from "../pages/HostPage";
import ParticipantPage from "../pages/ParticipantPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/host" element={<HostPage />} />
                <Route path="/participant" element={<ParticipantPage />} />
            </Routes>
        </BrowserRouter>
    );
}
