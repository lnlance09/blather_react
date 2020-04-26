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

		case constants.VOTE_ON_COMMENT:
			let _comments = state.comments.results
			let _comment = _comments.filter(c => c.id === payload.commentId)
			let finalComment = _comment[0]
			if (payload.upvote) {
				finalComment.likes = parseInt(finalComment.likes, 10) + 1
			} else {
				finalComment.dislikes = parseInt(finalComment.dislikes, 10) + 1
			}

			return {
				...state,
				comments: {
					...state.comments,
					results: _comments
				}
			}

		default:
			return state
	}
}

export default fallacyComments
