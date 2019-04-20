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
				type: constants.GET_COMMENTS,
				payload: body
			})
		}
	)
}

export const postComment = ({ bearer, id, message }) => dispatch => {
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
			dispatch({
				type: constants.POST_COMMENT,
				payload: body
			})
		}
	)
}
