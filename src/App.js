import React from "react";
import Routes from "./Routes";
import { BrowserRouter } from "react-router-dom";
import 'bootstrap-4-grid/css/grid.min.css'
import './index.css';

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </div>
  );
};

export default App;
