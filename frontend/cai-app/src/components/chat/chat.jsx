import { useCallback, useEffect, useRef, useState } from "react";
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
import { Input } from 'react-chat-elements';
import { MessageBox } from "react-chat-elements";
import Grid from '@mui/material/Grid2';
import SendIcon from '@mui/icons-material/Send';
import IconButton from "@mui/material/IconButton";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import NavigationBar from "../navigationbar/navigationbar";
import AlertDialog from "../alertDialog/alertDialog";

import styles from "./chat.module.css";

function Chat() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [currentGroup, setCurrentGroup] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const [openChat, setOpenChat] = useState(false);
    const [retrievedMessages, setRetrievedMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState({ text: '', sentBy: '', sentAt: null });
    const [activeMessages, setActiveMessages] = useState([]);

    let socket = useRef(null);

    const navigate = useNavigate();
    const logout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        navigate('/');
    }, [navigate]);

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         const token = localStorage.getItem('jwtToken');
    //         if (!token) {
    //             logout();
    //         } else {
    //             const decodedToken = jwtDecode(token);
    //             const currTime = Date.now() / 1000;
    //             if (decodedToken.exp < currTime) {
    //                 localStorage.removeItem('jwtToken');
    //                 logout();
    //             }
    //         }
    //     }, parseInt(process.env.REACT_APP_JWT_INTERVAL));
    //     return () => clearInterval(interval);
    // });

    useEffect(() => {
        // const newSocket = io(process.env.REACT_APP_API_URL);
        // setSocket(newSocket);

        const checkToken = () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                logout();
            } else {
                const decodedToken = jwtDecode(token);
                const currTime = Date.now() / 1000;
                if (decodedToken.exp < currTime) {
                    logout();
                } else {
                    setCurrentUser(decodedToken.username);
                }
            }
        };

        checkToken();
        fetchGroups();

        const interval = setInterval(checkToken, parseInt(process.env.REACT_APP_JWT_INTERVAL));

        return () => clearInterval(interval);
        // return () => {
        //     newSocket.disconnect();
        // };
    }, [logout]);

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
        fetchChatHistory(groupName);
        setActiveMessages([]);

        if (currentGroup !== groupName && currentGroup !== '') {
            socket.current.emit('leaveRoom', currentGroup);
        }

        setCurrentGroup(groupName);
        setOpenChat(true);

        if (!socket.current) {
            socket.current = io(process.env.REACT_APP_API_URL);
        }

        socket.current.emit('joinRoom', groupName);

        socket.current.off('receiveMessage');

        socket.current.on('receiveMessage', (message) => {
            setActiveMessages(previousMessages => [...previousMessages, message]);
        });

        // return () => {
        //     socket.disconnect();
        // }
    }

    function fetchChatHistory(groupName) {
        let group = {
            name: groupName
        };

        const request = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(group)
        };

        fetch(`${process.env.REACT_APP_API_URL}/fetch-messages`, request)
            .then((response) => response.json())
            .then((json) => setRetrievedMessages(json.messages))
            .catch((err) => console.log(err));
    }

    function handleCurrentMessageChange(event) {
        setCurrentMessage({ ...currentMessage, text: event.target.value });
    }

    function sendMessage() {
        if (currentMessage.text.trim() === '') return;

        const newMessage = {
            ...currentMessage,
            sentBy: currentUser,
            sentAt: new Date()
        };

        if (socket.current) {
            setActiveMessages(previousMessages => [...previousMessages, newMessage]);
            socket.current.emit('messageToRoom', { groupName: currentGroup, message: newMessage });

            setCurrentMessage({ text: '', sentBy: '', sentAt: null });
        } else {
            console.log("Socket is not initialized");
        }
    }

    function closeErrorDialog() {
        setErrorDialogOpen(false);
    }

    return (
        <>
            <NavigationBar isLoggedIn={true} />
            <Grid container spacing={2}>
                <Grid size={4}>
                    <Drawer
                        variant="permanent"
                        sx={{
                            width: 240,
                            flexShrink: 0,
                            [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
                        }}
                    >
                        <Toolbar />
                        <Button variant="contained" color="secondary" sx={{width: "10rem"}} onClick={() => openDialog()}>Create Group</Button>
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
                </Grid>
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
                <AlertDialog isOpen={errorDialogOpen} closeDialog={closeErrorDialog} title={"Group could not be created!"} content={"Group name cannot be blank and you MUST add at least one member!"} />
                {openChat ? <><Grid size={6}>
                    {retrievedMessages.map((message, index) => (
                        <MessageBox
                            position={message.sentBy === currentUser ? 'right' : 'left'}
                            type='text'
                            text={message.text}
                            replyButton={true}
                            title={message.sentBy}
                            key={index}
                            date={message.sentAt}
                        />
                    ))}
                    {activeMessages.map((message, index) => (
                        <MessageBox
                            position={message.sentBy === currentUser ? 'right' : 'left'}
                            type='text'
                            text={message.text}
                            replyButton={true}
                            title={message.sentBy}
                            key={index}
                            date={message.sentAt}
                        />
                    ))}
                    <Input
                        placeholder="Start chatting..."
                        multiline={true}
                        onChange={handleCurrentMessageChange}
                    />
                </Grid>
                    <Grid size={2}>
                        <IconButton color="info" size="large" onClick={sendMessage}>
                            <SendIcon />
                        </IconButton>
                    </Grid>
                </> :
                    <Grid size={6}>
                        <DotLottieReact
                            src="https://lottie.host/e8f3b1a6-3a27-44d3-8b60-a763cd02c964/HTgqvvmM7Y.lottie"
                            loop
                            autoplay
                        />
                        <h4 className={styles.nunitoSansBody}>Create a new group or select one to get started!</h4>
                    </Grid>}
            </Grid>
        </>
    );
}

export default Chat;