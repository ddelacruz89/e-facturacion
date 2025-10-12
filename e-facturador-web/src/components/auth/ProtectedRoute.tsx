import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
    requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, requiredPermission }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Verificando autenticación...
                </Typography>
            </Box>
        );
    }

    // Redirect to login if not authenticated
    if (!user?.isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Add role/permission checks here if needed
    // if (requiredRole && !userHasRole(user, requiredRole)) {
    //   return <Navigate to="/unauthorized" replace />;
    // }

    // if (requiredPermission && !userHasPermission(user, requiredPermission)) {
    //   return <Navigate to="/unauthorized" replace />;
    // }

    return <>{children}</>;
};

export default ProtectedRoute;
