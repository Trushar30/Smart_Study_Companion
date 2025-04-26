import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "Smart Study Companion";

createRoot(document.getElementById("root")!).render(<App />);
