import * as constants from "./constants"
import request from "request"

export const getFeed = ({ page }) => dispatch => {
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
		}
	)
}
