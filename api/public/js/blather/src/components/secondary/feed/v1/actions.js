import * as constants from "./constants"
import request from "request"
import { showLoading, hideLoading } from "react-redux-loading-bar"

export const getFeed = ({ filter, page }) => dispatch => {
	if (page === 0) {
		dispatch(showLoading())
	}

	request.get(
		`${window.location.origin}/api/home/feed`,
		{
			json: true,
			qs: {
				filter,
				page
			}
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.GET_FEED
			})

			if (page === 0) {
				dispatch(hideLoading())
			}
		}
	)
}

export const getFeedUpdates = ({ lastId }) => dispatch => {
	request.get(
		`${window.location.origin}/api/home/feed`,
		{
			json: true,
			qs: {
				lastId
			}
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.GET_FEED_UPDATES
			})
		}
	)
}
