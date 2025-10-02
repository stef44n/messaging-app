import { useAuth } from "../context/AuthContext";
import { useAuthInterceptor } from "../hooks/useAuthInterceptor";

export default function InterceptorProvider({ children }) {
    const { accessToken, refreshToken, setAccessToken, logout } = useAuth();

    // Mount interceptors globally
    useAuthInterceptor({ accessToken, refreshToken, setAccessToken, logout });

    return children;
}
