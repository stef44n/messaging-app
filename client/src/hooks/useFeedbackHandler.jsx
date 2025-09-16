// src/hooks/useFeedbackHandler.js
import { createContext, useContext } from "react";
import toast from "react-hot-toast";

const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
    const handleError = (error, fallbackMessage = "Something went wrong") => {
        console.error(error);
        const message =
            error?.response?.data?.error || error?.message || fallbackMessage;
        toast.error(message);
    };

    const handleSuccess = (message = "Action completed successfully ✅") => {
        toast.success(message);
    };

    return (
        <FeedbackContext.Provider value={{ handleError, handleSuccess }}>
            {children}
        </FeedbackContext.Provider>
    );
};

export const useFeedbackHandler = () => useContext(FeedbackContext);
