import './App.css';
import { Routes, Route } from "react-router-dom";
import Signup from './pages/signup/signup';
import Landing from './pages/landing/landing';
import Login from './pages/login/login';
import Home from './pages/home/home';
import BusinessDetails from './pages/business_details/business_details';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/business_details" element={<BusinessDetails />} />
      </Routes>
    </div>
  );
}

export default App;
