import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';

function Chat() {
    const [socket, setSocket] = useState(null);

    const navigate = useNavigate();
    const logout = () => {
        navigate('/');
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                logout();
            } else {
                const decodedToken = jwtDecode(token);
                const currTime = Date.now() / 1000;
                if (decodedToken.exp < currTime) {
                    localStorage.removeItem('jwtToken');
                    logout();
                }
            }
        }, parseInt(process.env.REACT_APP_JWT_INTERVAL));
        return () => clearInterval(interval);
    });

    useEffect(() => {
        const newSocket = io(process.env.REACT_APP_API_URL);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <>
            <h1>Hello</h1>
        </>
    );
}

export default Chat;