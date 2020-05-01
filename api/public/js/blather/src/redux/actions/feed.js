import * as constants from "../constants"
import request from "request"

export const mostFallacious = () => dispatch => {
	request.get(
		`${window.location.origin}/api/fallacies/mostFallacious`,
		{
			json: true
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.MOST_FALLACIOUS
			})
		}
	)
}
