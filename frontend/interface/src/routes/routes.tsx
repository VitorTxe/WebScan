import { createBrowserRouter } from "react-router-dom"
import App from "../App"
import Vulnerabilidades from "../pages/vulnerabilides"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/vulnerabilidades/:jobId",
    element: <Vulnerabilidades />
  }
])