import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from './App.tsx'
import { AuthContextProvider } from "./components/Auth/AuthContext.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthContextProvider>
)