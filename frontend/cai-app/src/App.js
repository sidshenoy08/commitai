import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './components/login/login';
import Register from './components/register/register';

function App() {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
        </BrowserRouter>
    );
}

export default App;