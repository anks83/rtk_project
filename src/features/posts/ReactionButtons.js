import { useDispatch } from "react-redux";
import { reactionAdded } from "./postsSlice";

const reactionEmoji = {
  thumbsUp: "👍",
  hooray: "🎉",
  heart: "❤️",
  rocket: "🚀",
  eyes: "👀",
};

function ReactionButtons({ post }) {
  const dispatch = useDispatch();
    const reactionButtons = Object.entries(reactionEmoji).map(([name, emoji]) => {
        return (
            <button key={name} type="button"
                className="reaction-button"
                onClick={() => dispatch(reactionAdded({ postId: post.id, reaction: name }))}    
            >
                {emoji} {post.reactions[name]}
            </button>
        );
    }); 
    
    return <div className="reaction-buttons">{reactionButtons}</div>;
}

export default ReactionButtons;
