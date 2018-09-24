import * as constants from "../constants"

const initial = () => ({})

const tag = (state = initial(), action) => {
	const payload = action.payload
	switch (action.type) {
		case constants.CHANGE_TAG_PIC:
			if (!payload.error) {
				return {
					...state,
					img: payload.img
				}
			}
		case constants.FETCH_TAG_INFO:
			return {
				...state,
				createdBy: {
					id: parseInt(payload.tag.user_id, 10),
					img: payload.tag.user_img,
					name: payload.tag.user_name,
					username: payload.tag.username
				},
				dateCreated: payload.tag.date_created,
				description: payload.tag.description === null ? "" : payload.tag.description,
				id: parseInt(payload.tag.tag_id, 10),
				img: payload.tag.tag_img,
				loading: false,
				name: payload.tag.tag_name
			}
		case constants.FETCH_TAG_HISTORY:
			return {
				...state,
				editHistory: payload.history
			}
		case constants.UPDATE_TAG:
			return {
				...state,
				description: payload.tag.description
			}
		default:
			return state
	}
}

export default tag
