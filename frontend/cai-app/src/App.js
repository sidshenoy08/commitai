import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './components/login/login';
import Register from './components/register/register';
import Home from './components/home/home';
import Chat from './components/chat/chat';

function App() {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
        </Routes>
        </BrowserRouter>
    );
}

export default App;