import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import '@ant-design/v5-patch-for-react-19';
import './index.css';
import '@mantine/core/styles.css';
import App from "./App";


const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
