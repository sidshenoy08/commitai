import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

import BrandLogo from '../../assets/brandlogo.png';

function NavigationBar() {
    return (
        <>
            <Navbar style={{backgroundColor: "#F6F8FF"}}>
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
                </Container>
            </Navbar>
        </>
    );
}

export default NavigationBar;