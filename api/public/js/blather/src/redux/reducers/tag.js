import * as constants from "../constants"

const initial = () => ({
	images: [],
	loading: false,
	rawImages: []
})

const tag = (state = initial(), action) => {
	const payload = action.payload

	switch (action.type) {
		case constants.ADD_TAG_PIC:
			if (!payload.error) {
				const images =
					state.images.length > 0 ? [...state.images, payload.img] : [payload.img]
				const rawImages =
					state.rawImages.length > 0
						? [...state.rawImages, payload.img.src]
						: [payload.img.src]
				return {
					...state,
					error: false,
					images,
					rawImages
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
				description: payload.tag.description,
				id: parseInt(payload.tag.tag_id, 10),
				images: payload.tag.images,
				img: payload.tag.tag_img === null ? "" : payload.tag.tag_img,
				loading: false,
				name: payload.tag.tag_name,
				rawImages: payload.tag.rawImages,
				relatedTags: payload.tag.related === false ? [] : payload.tag.related
			}

		case constants.FETCH_TAGGED_USERS:
			return {
				...state,
				users: payload.users
			}

		case constants.FETCH_TAG_HISTORY:
			return {
				...state,
				editHistory: payload.history
			}

		case constants.GET_RELATED_TAGS:
			return {
				...state,
				relatedTags: payload.related === false ? [] : payload.related
			}

		case constants.RESET_TAG_TO_INITIAL:
			return {
				state
			}

		case constants.TOGGLE_TAG_LOADING:
			return {
				...state,
				loading: !state.loading
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
