import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { Box, Button } from "@mui/material";
import { FileUpload } from 'primereact/fileupload';
import { InputTextarea } from 'primereact/inputtextarea';
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
import PostModal from "../postModal/postModal";

function Home() {
    const [caption, setCaption] = useState("");
    const [posts, setPosts] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [postDialogOpen, setPostDialogOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isMultiImagePost, setIsMultiImagePost] = useState(false);

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
                }
            }
        };

        checkToken();
        fetchPosts();

        const interval = setInterval(checkToken, parseInt(process.env.REACT_APP_JWT_INTERVAL));

        return () => clearInterval(interval);
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
                setCaption("");
                setSelectedImages([]);
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
                            <InputTextarea className={styles.captionInput} id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} rows={5} cols={30} placeholder="Caption" />
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
                        <Box sx={{ overflowY: 'visible', overflowX: 'hidden', display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <ImageList sx={{ backgroundColor: "#F8F8F8", width: '100%', maxWidth: '1000px' }} cols={3} gap={10} rowHeight={250}>
                                {posts.map((post, index) => (
                                    post.paths.length > 1 ?
                                        <>
                                            <ImageListItem key={index}>
                                                <Carousel key={index} variant="dark" controls={false}>
                                                    {post.paths.map((path, index) => (
                                                        <Carousel.Item key={post._id + "-" + index}>
                                                            <Box sx={{
                                                                width: '100%',
                                                                height: '250px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <img
                                                                    src={`${process.env.REACT_APP_API_URL}/${path}`}
                                                                    alt={post.caption}
                                                                    loading="lazy"
                                                                    style={{
                                                                        maxWidth: '100%',
                                                                        objectFit: 'contain',
                                                                        height: 'auto'
                                                                    }}
                                                                    onClick={() => {
                                                                        setSelectedPost(post);
                                                                        setIsMultiImagePost(true);
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Carousel.Item>
                                                    ))}
                                                </Carousel>
                                                <ImageListItemBar
                                                    title={post.caption}
                                                    subtitle={new Date(Date.parse(post.uploadedOn)).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
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
                                        </>
                                        : <>
                                            <ImageListItem key={post._id}>
                                                <img
                                                    src={`${process.env.REACT_APP_API_URL}/${post.paths[0]}`}
                                                    alt={post.caption}
                                                    loading="lazy"
                                                    style={{
                                                        width: '100%',
                                                        height: '250px',
                                                        objectFit: 'cover'
                                                    }}
                                                    onClick={() => {
                                                        setSelectedPost(post);
                                                        setIsMultiImagePost(false);
                                                    }}
                                                />
                                                <ImageListItemBar
                                                    title={post.caption}
                                                    subtitle={new Date(Date.parse(post.uploadedOn)).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
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
                                        </>
                                ))}
                                <PostModal post={selectedPost} setPost={setSelectedPost} isMultiImagePost={isMultiImagePost} />
                            </ImageList>
                        </Box>
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
            </div >
        </>);
}

export default Home;