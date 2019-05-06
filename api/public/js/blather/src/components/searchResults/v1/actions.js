import * as constants from "./constants"
import request from "request"
import { showLoading, hideLoading } from "react-redux-loading-bar"

export const fetchSearchResults = ({
	bearer,
	fallacies,
	network,
	nextPageToken,
	page,
	q,
	type
}) => dispatch => {
	dispatch(showLoading())

	request.get(
		`${window.location.origin}/api/search/advanced`,
		{
			headers: {
				Authorization: bearer
			},
			json: true,
			qs: {
				fallacies,
				network,
				nextPageToken,
				page,
				q,
				type
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.GET_SEARCH_RESULTS,
				payload: body
			})

			dispatch(hideLoading())
		}
	)
}
