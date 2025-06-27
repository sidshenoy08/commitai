import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { Button } from "@mui/material";
import { FileUpload } from 'primereact/fileupload';
import { InputTextarea } from 'primereact/inputtextarea';
import { FloatLabel } from 'primereact/floatlabel';
import { PrimeReactProvider } from 'primereact/api';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Carousel from 'react-bootstrap/Carousel';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Paper from '@mui/material/Paper';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

import NavigationBar from "../navigationbar/navigationbar";

import styles from './home.module.css';

function Home() {
    const [caption, setCaption] = useState("");
    const [posts, setPosts] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [postDialogOpen, setPostDialogOpen] = useState(false);

    const navigate = useNavigate();
    const logout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        navigate('/');
    }, [navigate]);

    useEffect(() => {
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
                    fetchPosts();
                }
            }
        };

        checkToken();
    }, [logout]);

    function fetchPosts() {
        const request = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        };

        fetch(`${process.env.REACT_APP_API_URL}/fetch-posts`, request)
            .then((response) => response.json())
            .then((json) => setPosts(json.posts))
            .catch((err) => console.log(err));
    }

    function selectImages(event) {
        setSelectedImages(Array.from(event.files));
    }

    function cancelPost() {
        setCaption("");
        setSelectedImages([]);
        setPostDialogOpen(false);
    }

    function upload() {
        const formData = new FormData();

        selectedImages.forEach((selectedImage) => {
            formData.append('images', selectedImage);
        });

        formData.append('caption', caption);

        const request = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            },
            body: formData
        };

        fetch(`${process.env.REACT_APP_API_URL}/upload`, request)
            .then((response) => response.json())
            .then(() => {
                refreshFeed();
                setPostDialogOpen(false);
            })
            .catch((err) => console.log(err));
    }

    function refreshFeed() {
        const request = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        };

        fetch(`${process.env.REACT_APP_API_URL}/fetch-posts`, request)
            .then((response) => response.json())
            .then((json) => setPosts(json.posts))
            .catch((err) => console.log(err));
    }

    function deletePost(postId, username) {
        let queryParameters = {
            "postId": postId,
            "username": username
        };

        const request = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(queryParameters)
        };

        fetch(`${process.env.REACT_APP_API_URL}/delete-post`, request)
            .then((response) => response.json())
            .then(() => refreshFeed())
            .catch((err) => console.log(err));
    }

    return (
        <>
            <NavigationBar isLoggedIn={true} onLogout={logout} />
            <div className={styles.body}>
                <h2 className={`${styles.headerText} ${styles.interHeader}`}>Home</h2>
                <Dialog
                    open={postDialogOpen}
                    onClose={() => setPostDialogOpen(false)}
                >
                    <DialogTitle>Create a new post!</DialogTitle>
                    <DialogContent>
                        <PrimeReactProvider>
                            <FileUpload mode="basic" name="imageupload" customUpload multiple accept="image/*" maxFileSize={1000000} onSelect={selectImages} />
                            <FloatLabel>
                                <InputTextarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} rows={5} cols={30} />
                                <label htmlFor="caption">Caption</label>
                            </FloatLabel>
                        </PrimeReactProvider>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cancelPost}>Cancel</Button>
                        <Button variant="contained" color="secondary" onClick={upload}>Upload</Button>
                    </DialogActions>
                </Dialog>
                {posts.length > 0 ?
                    <div>
                        <h4 className={styles.nunitoSansBody}>Your Feed</h4>
                        <ImageList sx={{ width: '80%', height: '50%' }} cols={3}>
                            {posts.map((post, index) => (
                                post.paths.length > 1 ?
                                    <Carousel key={index} variant="dark" controls={false}>
                                        {post.paths.map((path, index) => (
                                            <Carousel.Item key={post._id + "-" + index}>
                                                <ImageListItem key={index}>
                                                    <img
                                                        src={`${process.env.REACT_APP_API_URL}/${path}`}
                                                        alt={post.caption}
                                                        loading="lazy"
                                                    />
                                                    <ImageListItemBar
                                                        title={post.caption}
                                                        subtitle={new Date(Date.parse(post.uploadedOn)).toString()}
                                                        actionIcon={
                                                            <IconButton
                                                                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                                                aria-label={`Delete Post`}
                                                                onClick={() => deletePost(post._id, post.uploadedBy)}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        }
                                                    />
                                                </ImageListItem>
                                            </Carousel.Item>
                                        ))}
                                    </Carousel>
                                    : <ImageListItem key={post._id}>
                                        <img
                                            src={`${process.env.REACT_APP_API_URL}/${post.paths[0]}`}
                                            alt={posts.caption}
                                            loading="lazy"
                                        />
                                        <ImageListItemBar
                                            title={post.caption}
                                            subtitle={new Date(Date.parse(post.uploadedOn)).toString()}
                                            actionIcon={
                                                <IconButton
                                                    sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                                    aria-label={`Delete Post`}
                                                    onClick={() => deletePost(post._id, post.uploadedBy)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        />
                                    </ImageListItem>
                            ))}
                        </ImageList>
                    </div>
                    : <div>
                        <h4>No Posts Yet!</h4>
                        <p>Start posting to show off to your friends and rack up likes!</p>
                        <Paper elevation={10}>
                            <DotLottieReact
                                src="https://lottie.host/7e8575da-acf4-4aec-b914-f32fa30378e0/pxY9QCiyjY.lottie"
                                loop
                                autoplay
                                style={{ width: "700px", height: "350px" }}
                            />
                        </Paper>
                    </div>}
                <Button onClick={() => setPostDialogOpen(true)} style={{ margin: "2rem" }} variant="contained" endIcon={<AddPhotoAlternateIcon />}>
                    Create Post
                </Button>
            </div>
        </>);
}

export default Home;