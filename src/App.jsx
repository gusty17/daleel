import './App.css';
import { Routes, Route } from "react-router-dom";
import Signup from './pages/signup/signup';
import Landing from './pages/landing/landing';
import Login from './pages/login/login';
import Home from './pages/home/home';
import BusinessDetail from './pages/businessDetail/businessDetail';
import Checkout from './pages/checkout/checkout';
import Membership from './pages/membership/membership';
import TaxRegistrationGuide from './pages/taxRegistrationGuide/taxRegistrationGuide';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/businessDetail" element={<BusinessDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/tax-registration-guide" element={<TaxRegistrationGuide />} />
      </Routes>
    </div>
  );
}

export default App;
