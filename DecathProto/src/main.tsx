
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import "./styles/variables.css";
  import "./styles/layout.css";

  createRoot(document.getElementById("root")!).render(<App />);
  