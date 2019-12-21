import * as constants from "../constants"
import request from "request"
import { showLoading, hideLoading } from "react-redux-loading-bar"

export const fetchFallacyCount = ({ id }) => dispatch => {
	request.get(
		`${window.location.origin}/api/pages/getFallacyCount`,
		{
			json: true,
			qs: {
				id
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.SET_FALLACY_COUNT,
				payload: body
			})
		}
	)
}

export const fetchPageData = ({ bearer, id, type }) => dispatch => {
	dispatch(showLoading())

	request.get(
		`${window.location.origin}/api/pages`,
		{
			headers: {
				Authorization: bearer
			},
			json: true,
			qs: {
				id,
				type
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.GET_PAGE_DATA,
				payload: body
			})

			if (!body.error) {
				dispatch(fetchFallacyCount({ id: body.data.social_media_id }))
			}
			dispatch(hideLoading())
		}
	)
}

export const reset = () => dispatch => {
	dispatch({
		type: constants.RESET_PAGE_TO_INITIAL
	})
}
