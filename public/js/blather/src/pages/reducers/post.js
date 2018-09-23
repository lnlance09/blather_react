import * as constants from "../constants";

const initial = () => ({});

const post = (state = initial(), action) => {
    const payload = action.payload;
    switch (action.type) {
        case constants.CREATE_ARCHIVE:
            return {
                ...state,
                archive: action.payload.archive
            };

        case constants.FETCH_VIDEO_COMMENTS:
            if (action.payload.error) {
                return {
                    ...state,
                    comments: {
                        code: action.payload.code,
                        error: action.payload.error
                    }
                };
            }

            const items =
                action.payload.page > 0
                    ? [
                          ...state.comments.items,
                          ...action.payload.comments.items
                      ]
                    : action.payload.comments.items;
            return {
                ...state,
                comments: {
                    code: action.payload.code,
                    count: action.payload.comments.count,
                    error: action.payload.error,
                    items: items,
                    nextPageToken: action.payload.comments.nextPageToken,
                    page: action.payload.page
                }
            };

        case constants.GET_POST_DATA:
            return {
                ...state.post,
                archive: payload.archive,
                error: payload.error,
                errorCode: payload.code,
                info: payload.data,
                type: payload.type
            };

        case constants.INSERT_COMMENT:
            return {
                ...state,
                info: {
                    ...state.info,
                    comment: {
                        dateCreated: payload.data.date_created,
                        id: payload.data.id,
                        likeCount: payload.data.like_count,
                        message: payload.data.message,
                        user: {
                            about: payload.data.commenter.about,
                            id: payload.data.commenter.id,
                            img: payload.data.commenter.img,
                            title: payload.data.commenter.title
                        }
                    }
                },
                pageInfo: {
                    id: payload.data.commenter.id,
                    name: payload.data.commenter.title,
                    type: "youtube",
                    username: ""
                }
            };

        case constants.SET_CURRENT_VIDEO_TIME:
            return {
                ...state,
                info: {
                    ...state.info,
                    currentTime: Math.floor(payload.time)
                }
            };

        case constants.SET_DURATION:
            return {
                ...state,
                info: {
                    ...state.info,
                    endTime: action.payload
                }
            };

        case constants.UNSET_COMMENT:
            return {
                ...state,
                info: {
                    ...state.info,
                    comment: null
                }
            };

        default:
            return state;
    }
};

export default post;