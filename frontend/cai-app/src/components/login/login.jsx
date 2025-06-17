import { IconButton, InputAdornment, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavigationBar from '../navigationbar/navigationbar';

import './login.css';

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const redirectToHome = () => {
        navigate('/home');
    }

    function togglePasswordVisibility() {
        setShowPassword(!showPassword);
    }

    function handleUsernameChange(event) {
        setUsername(event.target.value);
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value);
    }

    async function login() {
        if (!username || !password) {
            setDialogOpen(true);
        } else {
            let userCredentials = {
                "username": username,
                "password": password
            };

            const request = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userCredentials)
            };

            fetch(`${process.env.REACT_APP_API_URL}/login`, request)
                .then((response) => {
                    if (response.status === 401) {
                        throw new Error("Invalid user credentials!");
                    } else {
                        return response.json();
                    }
                }
                )
                .then((json) => {
                    localStorage.setItem('jwtToken', json.token);
                })
                .then(() => redirectToHome())
                .catch((err) => console.log(err));
        }
    }

    return (
        <>
            <NavigationBar />
            <div className='body'>
                <h2 className='header-text'>Commit AI</h2>
                <Box>
                    <Grid container>
                        <Grid size={6}>
                            <DotLottieReact
                                width="auto"
                                height="auto"
                                src="https://lottie.host/02adb55e-bc5d-41f8-92f0-cba9b87626e8/1qt9QYyjMU.lottie"
                                loop
                                autoplay
                            />
                        </Grid>
                        <Grid size={6} sx={{ marginTop: 10 }}>
                            <Box sx={{ marginLeft: 20 }}>
                                <TextField id="outlined-basic-username" required={true} color="secondary" label="Username" variant="outlined" sx={{ display: 'block', margin: '2rem', width: '15rem' }} onChange={handleUsernameChange} />
                                <TextField id="outlined-basic-password"
                                    required={true}
                                    color="secondary"
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    variant="outlined"
                                    sx={{ display: 'block', margin: '2rem', width: '15 rem' }}
                                    slotProps={{
                                        input: {
                                            endAdornment:
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="password-toggle"
                                                        edge="end"
                                                        onClick={togglePasswordVisibility}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                        }
                                    }
                                    }
                                    onChange={handlePasswordChange} />
                                <Button variant="contained" color="secondary" sx={{ display: 'block', marginLeft: '5rem' }} onClick={login}>Login</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <Dialog
                    open={dialogOpen}
                    onClose={() => { setDialogOpen(false) }}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Username or Password missing!"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            The username AND the password cannot be blank!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)} autoFocus>Got it!</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

export default Login;