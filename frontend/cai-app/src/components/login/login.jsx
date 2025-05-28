import { IconButton, InputAdornment, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { useState } from 'react';

import NavigationBar from '../navigationbar/navigationbar';

function Login() {
    const [showPassword, setShowPassword] = useState(false);

    function togglePasswordVisibility() {
        setShowPassword(!showPassword);
    }

    return (
        <>
            <NavigationBar />
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
                        <TextField id="outlined-basic-username" required={true} color="secondary" label="Username" variant="outlined" margin="dense" />
                        <TextField id="outlined-basic-password"
                            required={true}
                            color="secondary"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            variant="outlined"
                            margin="dense"
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
                            } />
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}

export default Login;