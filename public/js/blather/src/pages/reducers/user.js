import * as constants from "../constants";

const initial = () => ({});

const pageUser = (state = initial(), action) => {
    const payload = action.payload;
    switch (action.type) {
        case constants.GET_ARCHIVED_LINKS:
            const archives =
                payload.pagination.page > 0
                    ? [...state.archives, ...payload.links]
                    : payload.links;
            return {
                ...state,
                archives: archives,
                count: payload.count,
                hasMore: payload.pagination.hasMore,
                loadingMore: false,
                page: payload.pagination.page,
                pages: payload.pagination.pages
            };

        case constants.GET_USER_DATA:
            return {
                ...state,
                loading: false,
                user: {
                    archiveCount: payload.user.archive_count,
                    bio: payload.user.bio,
                    discussionCount: payload.user.discussion_count,
                    emailVerified: payload.user.emailVerified === "1",
                    fallacyCount: payload.user.fallacy_count,
                    fbId: payload.user.fbId,
                    id: parseInt(payload.user.id, 10),
                    img: payload.user.img,
                    linkedFb: payload.user.linkedFb === "1",
                    linkedTwitter: payload.user.linkedTwitter === "1",
                    linkedYoutube: payload.user.linkedYoutube === "1",
                    name: payload.user.name,
                    twitterUsername: payload.user.twitterUsername,
                    username: payload.user.username,
                    youtubeId: payload.user.youtubeId
                }
            };

        default:
            return state;
    }
};

export default pageUser;