import * as constants from "../constants"
import request from "request"

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
		}
	)
}

export const fetchPagePosts = ({ bearer, id, lastId, nextPageToken, page, type }) => dispatch => {
	request.get(
		`${window.location.origin}/api/pages/getPagePosts`,
		{
			headers: {
				Authorization: bearer
			},
			json: true,
			qs: {
				id,
				lastId,
				nextPageToken,
				page,
				type
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.GET_PAGE_POSTS,
				payload: body
			})
		}
	)
}
