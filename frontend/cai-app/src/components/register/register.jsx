import { IconButton, InputAdornment, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NavigationBar from '../navigationbar/navigationbar';
import AlertDialog from '../alertDialog/alertDialog';

import './register.css';

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    const navigate = useNavigate();

    const redirectToHome = () => {
        navigate('/home');
    }

    function togglePasswordVisibility() {
        setShowPassword(!showPassword);
    }

    function toggleConfirmPasswordVisibility() {
        setShowConfirmPassword(!showConfirmPassword);
    }

    function handleUsernameChange(event) {
        setUsername(event.target.value);
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value);
    }

    function handleConfirmPasswordChange(event) {
        setConfirmPassword(event.target.value);
    }

    function closeCredentialsDialog() {
        setCredentialsDialogOpen(false);
    }

    function closePasswordDialog() {
        setPasswordDialogOpen(false);
    }

    function register() {
        if (!username || !password || !confirmPassword) {
            setCredentialsDialogOpen(true);
        } else {
            if (password === confirmPassword) {
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

                fetch(`${process.env.REACT_APP_API_URL}/register`, request)
                    .then((response) => {
                        if (response.status === 500) {
                            throw new Error("New user could not be created!");
                        } else {
                            return response.json();
                        }
                    })
                    .then((json) => localStorage.setItem('jwtToken', json.token))
                    .then(() => redirectToHome())
                    .catch((err) => console.log(err));
            } else {
                setPasswordDialogOpen(true);
            }
        }
    }

    return (
        <>
            <NavigationBar isLoggedIn={false} />
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
                                    sx={{ display: 'block', margin: '2rem', width: '15rem' }}
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
                                <TextField id="outlined-basic-confirm-password"
                                    required={true}
                                    color="secondary"
                                    label="Confirm Password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    variant="outlined"
                                    sx={{ display: 'block', margin: '2rem', width: '15rem' }}
                                    slotProps={{
                                        input: {
                                            endAdornment:
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="password-toggle"
                                                        edge="end"
                                                        onClick={toggleConfirmPasswordVisibility}
                                                    >
                                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                        }
                                    }
                                    }
                                    onChange={handleConfirmPasswordChange} />
                                <Button variant="contained" color="secondary" sx={{ display: 'block', marginLeft: '5rem' }} onClick={register}>Register</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <AlertDialog isOpen={credentialsDialogOpen} closeDialog={closeCredentialsDialog} title={"Username or Password(s) missing!"} content={"The username AND the password(s) cannot be blank!"} />
                <AlertDialog isOpen={passwordDialogOpen} closeDialog={closePasswordDialog} title={"Passwords do not match!"} content={"The two passwords entered do not match!"} />
            </div>
        </>
    );
}

export default Register;