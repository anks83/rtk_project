import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNewPost } from './postsSlice';
import { selectAllUsers } from '../users/usersSlice';

function AddPostForm() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [userId, setUserId] = useState('');
    const [addRequestStatus, setAddRequestStatus] = useState('idle');   

    const users = useSelector(selectAllUsers);

    const dispatch = useDispatch();

    const onChangeTitle = e => setTitle(e.target.value);
    const onChangeContent = e => setContent(e.target.value);
    const onChangeUserId = e => setUserId(+e.target.value);

    const canSave = [title, content, userId].every(Boolean) && addRequestStatus === 'idle';

  /*   const onSavePostClicked = () => {
        if (title && content) {
            try {
                dispatch(
                    postAdded({
                        title,
                        content,
                        userId,
                        date: new Date().toISOString(),
                        reactions: { thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0 }, 
                    })
                );
                //unwrapResult(resultAction);
                setTitle('');
                setContent('');
                setUserId('');
            } catch (err) {
                console.error('Failed to save the post: ', err);
            }
        }
    };
 */
    const onSavePostClicked = () => {   
        if (canSave) {
            try {
                setAddRequestStatus('pending');
                dispatch(addNewPost({ title, body:content, userId })).unwrap();
                setTitle('');
                setContent('');
                setUserId('');
            } catch (err) {
                console.error('Failed to save the post: ', err);
            } finally { 
                setAddRequestStatus('idle');
            }
        }
    };

    return (
        <section className='post-form'>
            <h2>Add a New Post</h2>
            <form className='post-form__inputs'>
                <label htmlFor="postTitle">Post Title:</label>
                <input
                    type="text"
                    id="postTitle"
                    name="postTitle"
                    value={title}
                    onChange={onChangeTitle}
                />
                <label htmlFor="postAuthor">Author:</label>
                <select id="postAuthor" value={userId} onChange={onChangeUserId}>
                    <option value=""></option>
                    {users?.map(user => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>
                <label htmlFor="postContent">Content:</label>
                <textarea
                    id="postContent"
                    name="postContent"
                    value={content}
                    onChange={onChangeContent}
                />

                <button className='post-form__button' type="button" onClick={onSavePostClicked} disabled={!canSave}>Save Post</button>
            </form>
        </section>
    )
}

export default AddPostForm