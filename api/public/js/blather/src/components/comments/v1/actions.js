import * as constants from "./constants"
import request from "request"

export const fetchComments = ({ id, page }) => dispatch => {
	request.get(
		`${window.location.origin}/api/fallacies/getComments`,
		{
			json: true,
			qs: {
				id,
				page
			}
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.GET_COMMENTS
			})
		}
	)
}

export const postComment = ({ bearer, callback, id, message }) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/postComment`,
		{
			form: {
				id,
				message
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				callback()
			}

			dispatch({
				payload: body,
				type: constants.POST_COMMENT
			})
		}
	)
}

export const voteOnComment = ({ bearer, commentId, upvote = 0 }) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/voteOnComment`,
		{
			form: {
				commentId,
				upvote
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				payload: {
					commentId,
					upvote
				},
				type: constants.VOTE_ON_COMMENT
			})
		}
	)
}
