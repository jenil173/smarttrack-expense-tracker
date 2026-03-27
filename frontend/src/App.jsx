import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import IncomePage from './pages/Income';
import Reports from './pages/Reports';
import AdminPanel from './pages/AdminPanel';

import Landing from './pages/Landing';
import Challenges from './pages/Challenges';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const AdminRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function App() {
    const { user } = useContext(AuthContext);

    const router = createBrowserRouter([
        {
            path: "/",
            element: user ? <Navigate to="/dashboard" /> : <Landing />
        },
        {
            path: "/login",
            element: !user ? <Login /> : <Navigate to="/dashboard" />
        },
        {
            path: "/register",
            element: !user ? <Register /> : <Navigate to="/dashboard" />
        },
        {
            path: "/dashboard",
            element: <ProtectedRoute><Dashboard /></ProtectedRoute>
        },
        {
            path: "/expenses",
            element: <ProtectedRoute><Expenses /></ProtectedRoute>
        },
        {
            path: "/income",
            element: <ProtectedRoute><IncomePage /></ProtectedRoute>
        },
        {
            path: "/reports",
            element: <ProtectedRoute><Reports /></ProtectedRoute>
        },
        {
            path: "/challenges",
            element: <ProtectedRoute><Challenges /></ProtectedRoute>
        },
        {
            path: "/admin",
            element: <AdminRoute><AdminPanel /></AdminRoute>
        },
        {
            path: "*",
            element: <Navigate to="/dashboard" replace />
        }
    ], {
        future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true,
        },
    });

    return <RouterProvider router={router} />;
}

export default App;
