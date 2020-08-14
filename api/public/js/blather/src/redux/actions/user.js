import * as constants from "../constants"
import request from "request"
import { showLoading, hideLoading } from "react-redux-loading-bar"

export const fetchUserData = ({ bearer, callback = () => null, username }) => dispatch => {
	dispatch(showLoading())

	request.get(
		`${window.location.origin}/api/users/getInfo?username=${username}`,
		{
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				callback(body.user.bio)
			}

			dispatch({
				payload: body,
				type: constants.GET_USER_DATA
			})

			dispatch(hideLoading())
		}
	)
}

export const reset = () => dispatch => {
	dispatch({
		type: constants.RESET_USER_TO_INITIAL
	})
}
