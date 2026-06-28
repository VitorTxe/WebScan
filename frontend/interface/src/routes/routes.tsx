import { createBrowserRouter } from "react-router-dom"
import Home from "../pages/Home"
import Vulnerabilidades from "../pages/vulnerabilides"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/vulnerabilidades/:jobId",
    element: <Vulnerabilidades />
  }
])