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
import PeopleIcon from '@mui/icons-material/People';

function Chat() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [socket, setSocket] = useState(null);
    const [users, setUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

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

    function handleGroupNameChange(event) {
        setGroupName(event.target.value);
    }

    function handleMemberSelection(event, newValue) {
        setSelectedMembers(newValue);
    }

    function createGroup() {
        if (!groupName || !selectedMembers) {
            setErrorDialogOpen(true);
        } else {
            let group = {
                name: groupName,
                members: selectedMembers
            };

            const request = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(group)
            };

            fetch(`${process.env.REACT_APP_API_URL}/create-group`, request)
                .then((response) => {
                    if(response.status === 200) {
                        response.json();
                    } else {
                        throw new Error("SOmething went wrong!");
                    }
                })
                .then((json) => cancelCreate())
                .catch((err) => console.log(err));
        }
    }

    function cancelCreate() {
        setGroupName('');
        setSelectedMembers([]);
        setDialogOpen(false);
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
                        onChange={handleGroupNameChange}
                    />
                    <Autocomplete
                        multiple={true}
                        required
                        placeholder="Add Members"
                        options={users}
                        onChange={handleMemberSelection}
                        sx={{ width: 300 }}
                        slotProps={{
                            listbox: {
                                sx: (theme) => ({
                                    zIndex: theme.vars.zIndex.modal
                                })
                            }
                        }}
                        noOptionsText="No users found!"
                        startDecorator={<PeopleIcon />}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="error" startIcon={< CancelIcon />} onClick={() => cancelCreate()}>Cancel</Button>
                    <Button variant="contained" color="success" endIcon={<AddIcon />} onClick={() => createGroup()}>Create</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={errorDialogOpen}
                onClose={() => { setErrorDialogOpen(false) }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Group could not be created!"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Group name cannot be blank and you MUST add at least one member!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setErrorDialogOpen(false)} autoFocus>Got it!</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Chat;