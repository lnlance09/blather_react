import * as constants from '../constants';

const initial = () => ({

})

const post = (state = initial(), action) => {
    const payload = action.payload
    switch(action.type) {
        case constants.CREATE_ARCHIVE:
            return {
                ...state,
                archive: action.payload.archive 
            }

        case constants.FETCH_VIDEO_COMMENTS:
            if(action.payload.error) {
                return {
                    ...state,
                    comments: {
                        code: action.payload.code,
                        error: action.payload.error
                    }
                }
            }

            const items = action.payload.page > 0 ? [...state.comments.items, ...action.payload.comments.items] : action.payload.comments.items
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
            }

        case constants.GET_POST_DATA:
            return {
                ...state.post,
                archive: payload.archive,
                error: payload.error,
                errorCode: payload.code,
                info: payload.data,
                type: payload.type
            }

        case constants.SET_CURRENT_VIDEO_TIME:
            return {
                ...state,
                info: {
                    ...state.info,
                    currentTime: Math.floor(payload.time)
                }
            }

        case constants.SET_DURATION:
            return {
                ...state,
                info: {
                    ...state.info,
                    endTime: action.payload
                }
            }

        default:
            return state
    }
}

export default post