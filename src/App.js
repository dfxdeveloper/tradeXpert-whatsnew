import react from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./component/LandingPage"
import AddData from "./component/AddData";
import ManageData from "./component/ManageData";


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/add" element={<AddData />} />
      <Route path="/manage" element={<ManageData />} />
    </Routes>
     
    </BrowserRouter>
  );
}

export default App;
