import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ToastProvider } from "./ui/components/Toast";

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
