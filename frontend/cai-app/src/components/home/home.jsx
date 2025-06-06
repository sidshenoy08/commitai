import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

function Home() {
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
        }, 1000);

        return () => clearInterval(interval);
    });

    return (<>
        <h3>Home</h3>
    </>);
}

export default Home;