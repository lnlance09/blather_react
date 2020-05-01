import * as constants from "./constants"
import request from "request"
import { showLoading, hideLoading } from "react-redux-loading-bar"

export const getFeed = ({ page }) => dispatch => {
	if (page === 0) {
		dispatch(showLoading())
	}

	request.get(
		`${window.location.origin}/api/home/feed`,
		{
			json: true,
			qs: {
				page
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.GET_FEED,
				payload: body
			})

			if (page === 0) {
				dispatch(hideLoading())
			}
		}
	)
}
