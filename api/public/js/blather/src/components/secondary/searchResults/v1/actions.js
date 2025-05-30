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
	if (page === 0) {
		dispatch(showLoading())
	}

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

			if (page === 0) {
				dispatch(hideLoading())
			}
		}
	)
}

export const resetSearchData = () => dispatch => {
	dispatch({
		type: constants.RESET_SEARCH_DATA
	})
}

export const toggleSearchLoading = () => dispatch => {
	dispatch({
		type: constants.TOGGLE_SEARCH_LOADING
	})
}
