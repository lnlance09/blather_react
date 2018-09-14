import * as constants from '../constants';

const initial = () => ({

})

const discussion = (state = initial(), action) => {
    const payload = action.payload
    switch(action.type) {
        case constants.GET_DISCUSSION:
            return {
                ...state,
                id: parseInt(payload.discussion.discussion_id,10),
                date_created: payload.discussion.discussion_created_at,
                description: payload.discussion.description,
                extra: payload.discussion.extra,
                tag_ids: payload.discussion.tag_ids,
                tag_names: payload.discussion.tag_names,
                title: payload.discussion.title,
                user: {
                    id: parseInt(payload.discussion.user_id,10),
                    img: payload.discussion.profile_pic,
                    name: payload.discussion.name,
                    username: payload.discussion.username
                }
            }

        case constants.SET_DISCUSSION_TAGS:
            return {
                ...state,
                tags: [payload.tag]
            }

        case constants.SUBMIT_DISCUSSION:
        case constants.UPDATE_DISCUSSION:
            if(payload.error) {
                return {
                    ...state,
                    error: true,
                    errorMsg: payload.errorMsg,
                    errorType: payload.errorType
                }
            }
            return {
                ...state,
                date_created: payload.discussion.discussion_created_at,
                description: payload.discussion.description,
                error: false,
                extra: payload.discussion.extra,
                hasSubmitted: true,
                id: payload.discussion.discussion_id,
                lastUpdated: payload.discussion.last_updated,
                tag_ids: payload.discussion.tag_ids,
                tag_names: payload.discussion.tag_names,
                title: payload.discussion.title,
                user: {
                    id: payload.discussion.user_id,
                    img: payload.discussion.profile_pic,
                    name: payload.discussion.name,
                    username: payload.discussion.username
                }
            }

        default:
            return state;
    }
}

export default discussion