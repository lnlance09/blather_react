import * as constants from "../constants"

const initial = () => ({})

const pageUser = (state = initial(), action) => {
	const payload = action.payload
	switch (action.type) {
		case constants.GET_ARCHIVED_LINKS:
			const archives =
				payload.pagination.page > 0 ? [...state.archives, ...payload.links] : payload.links
			return {
				...state,
				archives,
				count: payload.count,
				hasMore: payload.pagination.hasMore,
				loadingMore: false,
				page: payload.pagination.page
			}

		case constants.GET_USER_DATA:
			if (payload.error) {
				return {
					...state,
					error: true
				}
			}
			return {
				...state,
				error: false,
				loading: false,
				user: {
					archiveCount: payload.user.archive_count,
					bio: payload.user.bio,
					discussionCount: payload.user.discussion_count,
					emailVerified: payload.user.emailVerified === "1",
					fallacyCount: payload.user.fallacy_count,
					id: parseInt(payload.user.id, 10),
					img: payload.user.img,
					linkedTwitter: payload.user.linkedTwitter === "1",
					linkedYoutube: payload.user.linkedYoutube === "1",
					name: payload.user.name,
					username: payload.user.username
				}
			}

		case constants.TOGGLE_LOADING:
			return {
				...state,
				loading: !action.loading
			}

		default:
			return state
	}
}

export default pageUser
