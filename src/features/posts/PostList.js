import React, {useEffect} from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { selectAllPosts, getPostsStatus, getPostsError, fetchPosts } from './postsSlice';
import PostExcerpt from './PostExcerpt';

function PostList() {
    const dispatch = useDispatch(); 

    const posts = useSelector(selectAllPosts);
    const postsError = useSelector(getPostsError);
    const postsStatus = useSelector(getPostsStatus);
    
    useEffect(() => {
        if (postsStatus === 'idle') {
            dispatch(fetchPosts());
        }
    }, [postsStatus, dispatch]);

    let content;    
    if (postsStatus === 'loading') {
        content = <p>Loading...</p>;
    }else if(postsStatus === 'succeeded') {
        const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date));
         content = orderedPosts.map((post) => <PostExcerpt key={post.id} post={post} />); 
    }   else if (postsStatus === 'failed') {
        content = <p>{postsError}</p>;
    }


    return (
        <section className="post-list">
            <h2>Posts</h2>
            {content}
        </section>
    )
}

export default PostList