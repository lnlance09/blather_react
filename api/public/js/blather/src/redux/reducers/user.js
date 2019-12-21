import * as constants from "../constants"

const initial = () => ({
	user: {}
})

const pageUser = (state = initial(), action) => {
	const payload = action.payload
	switch (action.type) {
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
					dateCreated: payload.user.date_created,
					discussionCount: payload.user.discussion_count,
					emailVerified: payload.user.emailVerified === "1",
					fallacyCount: payload.user.fallacy_count,
					id: parseInt(payload.user.id, 10),
					img: payload.user.img,
					linkedTwitter: payload.user.linkedTwitter === "1",
					linkedYoutube: payload.user.linkedYoutube === "1",
					name: payload.user.name,
					patreonUsername: payload.user.patreonUsername,
					username: payload.user.username
				}
			}

		case constants.RESET_USER_TO_INITIAL:
			return {
				state
			}

		default:
			return state
	}
}

export default pageUser
