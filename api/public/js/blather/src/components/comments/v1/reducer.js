import * as constants from "./constants"

const initial = () => ({})

const fallacyComments = (state = initial(), action) => {
	const payload = action.payload

	switch (action.type) {
		case constants.GET_COMMENTS:
			return {
				...state,
				comments: {
					count: payload.count,
					results: payload.comments
				}
			}

		case constants.POST_COMMENT:
			const comments = state.comments.results
				? [payload.comment, ...state.comments.results]
				: payload.comment
			return {
				...state,
				comments: {
					count: state.comments.count + 1,
					results: comments
				}
			}

		default:
			return state
	}
}

export default fallacyComments
