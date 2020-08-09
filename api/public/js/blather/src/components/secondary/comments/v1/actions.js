import * as constants from "./constants"
import request from "request"
import { toast } from "react-toastify"
import { getConfig } from "options/toast"

toast.configure(getConfig())

export const fetchComments = ({ bearer, id, page }) => dispatch => {
	request.get(
		`${window.location.origin}/api/fallacies/getComments`,
		{
			headers: {
				Authorization: bearer
			},
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

export const likeComment = ({ bearer, commentId, responseId }) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/likeComment`,
		{
			form: {
				commentId,
				responseId
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				dispatch({
					payload: {
						commentId,
						responseId
					},
					type: constants.LIKE_COMMENT
				})
			}
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
			if (body.error) {
				toast.error(body.error)
			}

			if (!body.error) {
				callback()

				dispatch({
					payload: body,
					type: constants.POST_COMMENT
				})
			}
		}
	)
}

export const unlikeComment = ({ bearer, commentId, responseId }) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/unlikeComment`,
		{
			form: {
				commentId,
				responseId
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				dispatch({
					payload: {
						commentId,
						responseId
					},
					type: constants.UNLIKE_COMMENT
				})
			}
		}
	)
}
