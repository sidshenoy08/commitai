import { useEffect, useRef, useState } from "react";
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
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PeopleAltTwoToneIcon from '@mui/icons-material/PeopleAltTwoTone';

function Chat() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    // const [socket, setSocket] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [currentGroup, setCurrentGroup] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    // const [retrievedMessages, setRetrievedMessages] = useState([]);
    // const [sentMessages, setSentMessages] = useState([]);

    let socket = useRef(null);

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
        // const newSocket = io(process.env.REACT_APP_API_URL);
        // setSocket(newSocket);

        fetchGroups();

        // return () => {
        //     newSocket.disconnect();
        // };
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
            .then((json) => setAllUsers(json.users))
            .then(() => setDialogOpen(true))
            .catch((err) => console.log(err));
    }

    function handleNewGroupNameChange(event) {
        setNewGroupName(event.target.value);
    }

    function handleMemberSelection(event, newValue) {
        setSelectedMembers(newValue);
    }

    function createGroup() {
        if (!newGroupName || !selectedMembers) {
            setErrorDialogOpen(true);
        } else {
            let group = {
                name: newGroupName,
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
                    if (response.status === 200) {
                        response.json();
                        setAllGroups([...allGroups, newGroupName]);
                    } else {
                        throw new Error("Something went wrong!");
                    }
                })
                .then((json) => cancelCreate())
                .catch((err) => console.log(err));
        }
    }

    function cancelCreate() {
        setNewGroupName('');
        setSelectedMembers([]);
        setDialogOpen(false);
    }

    function fetchGroups() {
        const request = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        };

        fetch(`${process.env.REACT_APP_API_URL}/fetch-groups`, request)
            .then((response) => response.json())
            .then((json) => setAllGroups(json.groups))
            .catch((err) => console.log(err));
    }

    function initializeChat(groupName) {
        setCurrentGroup(groupName);

        if (!socket.current) {
            socket.current = io(process.env.REACT_APP_API_URL);
        }

        socket.current.emit('joinRoom', groupName);

        socket.current.off('receiveMessage');

        socket.current.on('receiveMessage', (message) => {
            console.log(message);
        });

        // return () => {
        //     socket.disconnect();
        // }
    }

    function sendMessage() {
        if (socket.current) {
            socket.current.emit('messageToRoom', { groupName: currentGroup, message: 'Testing!' });
        } else {
            console.error("Socket is not initialized");
        }
    }

    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Button variant="contained" color="secondary" onClick={() => openDialog()}>Create Group</Button>
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {allGroups.map((groupName, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton onClick={() => initializeChat(groupName)}>
                                    <ListItemIcon>
                                        <PeopleAltTwoToneIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={groupName} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
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
                        id="newGroupName"
                        name="newGroupName"
                        label="Group Name"
                        fullWidth
                        variant="standard"
                        onChange={handleNewGroupNameChange}
                    />
                    <Autocomplete
                        multiple={true}
                        required
                        placeholder="Add Members"
                        options={allUsers}
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
                        startDecorator={<GroupAddIcon />}
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
            <Button style={{ marginLeft: "20rem" }} variant="contained" color="secondary" onClick={sendMessage}>Send message!</Button>
        </>
    );
}

export default Chat;