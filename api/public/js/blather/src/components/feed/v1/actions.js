import * as constants from "./constants"
import request from "request"

export const getFeed = ({ page }) => dispatch => {
	request.get(
		`${window.location.origin}/api/fallacies/search`,
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
