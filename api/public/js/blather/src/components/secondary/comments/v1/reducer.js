import * as constants from "./constants"

const initial = () => ({
	comments: {
		count: 0,
		results: [{}, {}, {}, {}, {}, {}, {}]
	}
})

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

		case constants.LIKE_COMMENT:
			const { commentId, responseId } = payload
			const comment = state.comments.results.find(comment => comment.id === commentId)

			if (typeof responseId !== "undefined") {
				const response = comment.responses.find(response => response.id === responseId)
				response.likeCount++
				response.likedByMe = "1"
			} else {
				comment.likeCount++
				comment.likedByMe = "1"
			}

			return {
				...state,
				comments: {
					...state.comments,
					results: state.comments.results
				}
			}

		case constants.POST_COMMENT:
			let results = state.comments.results
				? [payload.comment, ...state.comments.results]
				: payload.comment

			if (
				typeof payload.comment.response_to !== "undefined" &&
				payload.comment.response_to !== null
			) {
				const _comment = state.comments.results.find(
					comment =>
						parseInt(comment.id, 10) === parseInt(payload.comment.response_to, 10)
				)
				_comment.responses.push(payload.comment)
				results = state.comments.results
			}

			return {
				...state,
				comments: {
					count: state.comments.count + 1,
					results
				}
			}

		case constants.UNLIKE_COMMENT:
			const _commentId = payload.commentId
			const _responseId = payload.responseId
			const _comment = state.comments.results.find(comment => comment.id === _commentId)

			if (typeof _responseId !== "undefined") {
				const _response = _comment.responses.find(response => response.id === _responseId)
				_response.likeCount--
				_response.likedByMe = 0
			} else {
				_comment.likeCount--
				_comment.likedByMe = 0
			}

			return {
				...state,
				comments: {
					...state.comments,
					results: state.comments.results
				}
			}

		default:
			return state
	}
}

export default fallacyComments
