import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

// EN: Importing i18n here (before <App/>) ensures translations are ready
//     before any component tries to call useTranslation().
// FA: ایمپورت i18n اینجا (قبل از App) تضمین می‌کند ترجمه‌ها قبل از
//     استفاده کامپوننت‌ها از useTranslation آماده باشند.
import "./i18n";

import { store } from "./store/store";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
