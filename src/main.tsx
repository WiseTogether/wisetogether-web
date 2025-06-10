import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from './App.tsx'
import { AuthContextProvider } from "./auth/AuthContext.tsx";
import ErrorBoundary from './components/error/ErrorBoundary.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <AuthContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthContextProvider>
  </ErrorBoundary>
)