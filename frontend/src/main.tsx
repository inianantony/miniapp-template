import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles/index.css";

const basePath = import.meta.env.VITE_BASE_PATH || "/defaultbasepath/defaultapp/";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename={basePath}>
    <App />
    <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: "#363636", color: "#fff" } }} />
  </BrowserRouter>
);
