import { useEffect, useState } from "react";
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

function Home() {
    const [caption, setCaption] = useState("");
    const [posts, setPosts] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);

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
    }, []);

    function selectImages(event) {
        setSelectedImages(Array.from(event.files));
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
            .then((json) => console.log(json))
            .catch((err) => console.log(err));
    }

    return (<>
        <h3>Home</h3>
        <PrimeReactProvider>
            <FileUpload mode="basic" name="imageupload" customUpload multiple accept="image/*" maxFileSize={1000000} onSelect={selectImages} />
            <FloatLabel>
                <InputTextarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} rows={5} cols={30} />
                <label htmlFor="caption">Caption</label>
            </FloatLabel>
        </PrimeReactProvider>
        <Button variant="contained" color="secondary" onClick={upload}>Upload</Button>
        {posts.length > 0 ?
            <div>
                <h1>Your Posts</h1>
                <ImageList sx={{ width: '80%', height: '50%' }} cols={3} rowHeight={164}>
                    {posts.map((post, index) => (
                        post.paths.length > 1 ?
                            <Carousel variant="dark">
                                {post.paths.map((path, index) => (
                                    <Carousel.Item>
                                        <ImageListItem key={index}>
                                            <img
                                                srcSet={`${process.env.REACT_APP_API_URL}/${path}`}
                                                src={`${process.env.REACT_APP_API_URL}/${path}`}
                                                alt={post.caption}
                                                loading="lazy"
                                            />
                                            <ImageListItemBar
                                                title={post.caption}
                                                subtitle={post.uploadedOn}
                                            />
                                        </ImageListItem>
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                            : <ImageListItem key={index}>
                                <img
                                    srcSet={`${process.env.REACT_APP_API_URL}/${post.paths[0]}`}
                                    src={`${process.env.REACT_APP_API_URL}/${post.paths[0]}`}
                                    alt={posts.caption}
                                    loading="lazy"
                                />
                                <ImageListItemBar
                                    title={post.caption}
                                    subtitle={post.uploadedOn}
                                />
                            </ImageListItem>
                    ))}
                </ImageList>
            </div>
            : <h1>No Posts Yet!</h1>}
    </>);
}

export default Home;