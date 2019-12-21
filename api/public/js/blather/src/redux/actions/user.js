import * as constants from "../constants"
import request from "request"
import { showLoading, hideLoading } from "react-redux-loading-bar"

export const fetchUserData = ({ bearer, username }) => dispatch => {
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
			dispatch({
				type: constants.GET_USER_DATA,
				payload: body
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
