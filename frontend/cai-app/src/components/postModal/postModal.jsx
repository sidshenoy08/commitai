import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import { ModalDialog } from "@mui/joy";
import Carousel from 'react-bootstrap/Carousel';
import { Box } from '@mui/material';

function PostModal({ post, setPost, isMultiImagePost }) {
    return (
        <>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={Boolean(post)}
                onClose={() => {
                    setPost(null);
                }}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <ModalDialog layout="center" sx={{
                    borderRadius: 'lg',
                    boxShadow: 'lg',
                    maxWidth: 600,
                    width: '100%',
                    overflow: 'hidden'
                }}>
                    <ModalClose variant="plain" sx={{ m: 1 }} />
                    {post && <>

                        {isMultiImagePost ? <>
                            <Carousel key={post._id} variant="dark" controls={false}>
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
                                            />
                                        </Box>
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        </>
                            : <>
                                <img
                                    src={`${process.env.REACT_APP_API_URL}/${post.paths[0]}`}
                                    alt={post.caption}
                                    loading="lazy"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block',
                                        borderRadius: 'sm',
                                        marginBottom: '1rem'
                                    }}
                                /></>}
                        {/* <img
                            src={`${process.env.REACT_APP_API_URL}/${post.paths[0]}`}
                            alt={post.caption}
                            loading="lazy"
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                borderRadius: 'sm',
                                marginBottom: '1rem'
                            }}
                        /> */}
                        <Typography
                            component="h4"
                            id="modal-title"
                            level="h4"
                            textColor="inherit"
                            sx={{ fontWeight: 'lg', mb: 1, textAlign: 'center' }}
                        >
                            {post.caption}
                        </Typography>
                        <Typography id="modal-desc" textColor="text.tertiary">
                            Uploaded on: {new Date(Date.parse(post.uploadedOn)).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
                        </Typography>
                    </>}
                </ModalDialog>
            </Modal>
        </>
    );
}

export default PostModal;