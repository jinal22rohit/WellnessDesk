import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./ui/layouts/AppLayout";
import { ProtectedRoute } from "./ui/routing/ProtectedRoute";

import { HomePage } from "./ui/pages/HomePage";
import { TherapiesPage } from "./ui/pages/TherapiesPage";
import { TherapyDetailsPage } from "./ui/pages/TherapyDetailsPage";
import { ContactPage } from "./ui/pages/ContactPage";
import { LoginPage } from "./ui/pages/LoginPage";
import { RegisterPage } from "./ui/pages/RegisterPage";
import { BookingPage } from "./ui/pages/BookingPage";
import { ForgotPasswordPage } from "./ui/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./ui/pages/ResetPasswordPage";

import { UserDashboard } from "./ui/dashboards/UserDashboard";
import { EmployeeDashboard } from "./ui/dashboards/EmployeeDashboard";
import { AdminDashboard } from "./ui/dashboards/AdminDashboard";

import { AdminRevenueDashboard } from "./ui/pages/Adminrevenue";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/therapies", element: <TherapiesPage /> },
      { path: "/therapies/:id", element: <TherapyDetailsPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      {
        path: "/booking",
        element: (
          <ProtectedRoute roles={["customer", "user"]}>
            <BookingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/customer",
        element: (
          <ProtectedRoute roles={["customer", "user", "admin"]}>
            <UserDashboard />
          </ProtectedRoute>
        ),
      },
      // Backward-compatible alias
      {
        path: "/dashboard/user",
        element: (
          <ProtectedRoute roles={["customer", "user", "admin"]}>
            <UserDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/employee",
        element: (
          <ProtectedRoute roles={["employee", "admin"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/admin",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
    
      {
  path: "/dashboard/admin/revenue",
  element: (
    <ProtectedRoute roles={["admin"]}>
      <AdminRevenueDashboard />
    </ProtectedRoute>
  ),
},

    ],
  },
]);

