import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import BrandLogo from '../../assets/brandlogo.png';

function NavigationBar({ isLoggedIn, onLogout }) {
    return (
        <>
            <Navbar style={{ backgroundColor: "#F6F8FF" }}>
                <Container>
                    <Navbar.Brand href="/" className="mr-auto">
                        <img
                            alt="Brand Logo"
                            src={BrandLogo}
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                        />
                    </Navbar.Brand>
                    {isLoggedIn ? <Nav className="mr-auto">
                        <Nav.Link href="/home">Home</Nav.Link>
                        <Nav.Link href="/chat">Chat</Nav.Link>
                        <Nav.Link onClick={onLogout}>Logout</Nav.Link>
                    </Nav> : <Nav className="mr-auto">
                        <Nav.Link href="/">Login</Nav.Link>
                        <Nav.Link href="/register">Register</Nav.Link>
                    </Nav>}
                </Container>
            </Navbar>
        </>
    );
}

export default NavigationBar;