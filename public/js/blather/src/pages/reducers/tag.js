import * as constants from "../constants";

const initial = () => ({});

const tag = (state = initial(), action) => {
    const payload = action.payload;
    switch (action.type) {
        case constants.FETCH_TAG_INFO:
            return {
                ...state,
                createdBy: {
                    id: payload.tag.user_id,
                    img: payload.tag.user_img,
                    name: payload.tag.user_name,
                    username: payload.tag.username
                },
                dateCreated: payload.tag.date_created,
                description: payload.tag.description,
                id: payload.tag.tag_id,
                img: payload.tag.tag_img,
                loading: false,
                name: payload.tag.tag_name
            };
        case constants.UPDATE_TAG:
            return {
                ...state,
                description: payload.tag.description
            };
        default:
            return state;
    }
};

export default tag;