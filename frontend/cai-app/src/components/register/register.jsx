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

import NavigationBar from '../navigationbar/navigationbar';

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

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
                        if(response.status === 500) {
                            throw new Error("New user could not be created!");
                        } else {
                            return response.json();
                        }
                    })
                    .then((json) => localStorage.setItem('jwtToken', json.token))
                    .catch((err) => console.log(err));
            } else {
                setPasswordDialogOpen(true);
            }
        }

        // const request = {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(userCredentials)
        // };

        // fetch(`${process.env.REACT_APP_API_URL}/login`, request)
        //     .then((response) => response.json())
        //     .then((json) => console.log(json))
        //     .catch((err) => console.log(err));
    }

    return (
        <>
            <NavigationBar />
            <h3>Register</h3>
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
                    <Grid size={6}>
                        <TextField id="outlined-basic-username" required={true} color="secondary" label="Username" variant="outlined" margin="normal" onChange={handleUsernameChange} />
                        <TextField id="outlined-basic-password"
                            required={true}
                            color="secondary"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            variant="outlined"
                            margin="normal"
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
                            margin="normal"
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
                        <Button variant="contained" color="secondary" onClick={register}>Register</Button>
                    </Grid>
                </Grid>
            </Box>
            <Dialog
                open={credentialsDialogOpen}
                onClose={() => { setCredentialsDialogOpen(false) }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Username or Password(s) missing!"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        The username AND the password(s) cannot be blank!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCredentialsDialogOpen(false)} autoFocus>Got it!</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={passwordDialogOpen}
                onClose={() => { setPasswordDialogOpen(false) }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Passwords do not match!"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        The two passwords entered do not match!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordDialogOpen(false)} autoFocus>Got it!</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Register;