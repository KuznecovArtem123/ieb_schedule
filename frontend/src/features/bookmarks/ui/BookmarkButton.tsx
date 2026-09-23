import { Star, StarFill } from "@gravity-ui/icons";
import { toggleBookmark, type BookmarkKind } from "../model/store";
import { useIsBookmarked } from "../model/useBookmarks";

interface BookmarkButtonProps {
    kind: BookmarkKind;
    id: number;
};

function BookmarkButton(props: BookmarkButtonProps) {
    const { kind, id } = props;
    const isBookmarked = useIsBookmarked(kind, id);
    const handleBookmarkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleBookmark(kind, id);
    };
    return (
        <button type="button" onClick={handleBookmarkClick} className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform">
            {isBookmarked ? <StarFill className="w-full h-full text-yellow-400" /> : <Star className="w-full h-full text-current opacity-70 hover:opacity-100 transition-opacity" />}
        </button>
    );
}

export default BookmarkButton;