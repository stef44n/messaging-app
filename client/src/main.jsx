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
import NewChat from "./pages/NewChat";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Loader from "./components/Loader";
import { Toaster } from "react-hot-toast";
import { FeedbackProvider } from "./hooks/useFeedbackHandler";

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
        <AuthProvider>
            <FeedbackProvider>
                <BrowserRouter>
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
                        <Route
                            path="/new-chat"
                            element={
                                <PrivateRoute>
                                    <NewChat />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
                <Toaster position="top-center" reverseOrder={false} />
            </FeedbackProvider>
        </AuthProvider>
    </React.StrictMode>
);
