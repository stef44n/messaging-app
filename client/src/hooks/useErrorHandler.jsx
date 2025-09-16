import { createContext, useContext } from "react";
import toast from "react-hot-toast";

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
    const handleError = (error, fallbackMessage = "Something went wrong") => {
        console.error(error);

        // Use API message if available
        const message =
            error?.response?.data?.error || error?.message || fallbackMessage;

        toast.error(message);
    };

    return (
        <ErrorContext.Provider value={handleError}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useErrorHandler = () => useContext(ErrorContext);
