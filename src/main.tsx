import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Watch Dogs ctOS theme — always dark
document.documentElement.classList.add('dark');

createRoot(document.getElementById("root")!).render(<App />);
