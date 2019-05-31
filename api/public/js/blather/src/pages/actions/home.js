import * as constants from "../constants"
import request from "request"

export const getPostFromUrl = ({ bearer, url }) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/parseUrl`,
		{
			form: {
				url
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.GET_POST_FROM_URL,
				payload: body
			})
		}
	)
}
