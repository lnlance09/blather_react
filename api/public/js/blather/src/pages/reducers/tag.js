import * as constants from "../constants"

const initial = () => ({})

const tag = (state = initial(), action) => {
	const payload = action.payload

	switch (action.type) {
		case constants.CHANGE_TAG_PIC:
			if (!payload.error) {
				return {
					...state,
					error: false,
					img: payload.img
				}
			}

			return {
				...state,
				error: true
			}

		case constants.FETCH_TAG_INFO:
			if (payload.error) {
				return {
					...state,
					error: true,
					errorMsg: payload.error
				}
			}

			return {
				...state,
				createdBy: {
					id: parseInt(payload.tag.user_id, 10),
					img: payload.tag.user_img,
					name: payload.tag.user_name,
					username: payload.tag.username
				},
				dateCreated: payload.tag.date_created,
				description:
					payload.tag.description === null
						? "There is no article for this tag yet..."
						: payload.tag.description,
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

		case constants.UPDATE_TAG_DESCRIPTION:
			return {
				...state,
				description: payload === null ? "" : payload
			}

		default:
			return state
	}
}

export default tag
