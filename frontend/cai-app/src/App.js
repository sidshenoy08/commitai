import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './components/login/login';
import Register from './components/register/register';
import Home from './components/home/home';

function App() {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
        </Routes>
        </BrowserRouter>
    );
}

export default App;