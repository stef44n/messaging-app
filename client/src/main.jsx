import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import App from "./App";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Inbox from "./pages/Inbox";
import Chat from "./pages/Chat";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Loader from "./components/Loader";

function PrivateRoute({ children }) {
    const { token, loading } = useAuth();
    if (loading) return <Loader />;
    return token ? children : <Navigate to="/login" />;
}

function RedirectIfAuth({ children }) {
    const { token, loading } = useAuth();
    if (loading) return <Loader />;
    return token ? <Navigate to="/inbox" /> : children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <Routes>
                    <Route path="/" element={<App />} />

                    {/* Auth routes */}
                    <Route
                        path="/login"
                        element={
                            <RedirectIfAuth>
                                <Login />
                            </RedirectIfAuth>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <RedirectIfAuth>
                                <Signup />
                            </RedirectIfAuth>
                        }
                    />

                    {/* Protected routes */}
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/inbox"
                        element={
                            <PrivateRoute>
                                <Inbox />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/chat/:userId"
                        element={
                            <PrivateRoute>
                                <Chat />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
