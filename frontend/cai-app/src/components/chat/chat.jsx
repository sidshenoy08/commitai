import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import Autocomplete from '@mui/joy/Autocomplete';

function Chat() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [socket, setSocket] = useState(null);
    const [users, setUsers] = useState([]);

    const top100Films = [
        { label: 'The Shawshank Redemption', year: 1994 },
        { label: 'The Godfather', year: 1972 },
        { label: 'The Godfather: Part II', year: 1974 },
        { label: 'The Dark Knight', year: 2008 },
        { label: '12 Angry Men', year: 1957 },
        { label: "Schindler's List", year: 1993 }
    ];

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

    function openDialog() {
        const request = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        };

        fetch(`${process.env.REACT_APP_API_URL}/fetch-users`, request)
            .then((response) => response.json())
            .then((json) => setUsers(json.users))
            .then(() => setDialogOpen(true))
            .catch((err) => console.log(err));
    }

    return (
        <>
            <Button variant="contained" color="secondary" onClick={() => openDialog()}>Create Group</Button>
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            >
                <DialogTitle>Create a Group!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Create a group with your friends to start chatting!
                    </DialogContentText>
                    <TextField
                        required
                        id="groupName"
                        name="groupName"
                        label="Group Name"
                        fullWidth
                        variant="standard"
                    />
                    <Autocomplete
                        placeholder="Add Members"
                        options={users}
                        sx={{ width: 300 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="error" startIcon={< CancelIcon />} onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="success" endIcon={<AddIcon />}>Create</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Chat;