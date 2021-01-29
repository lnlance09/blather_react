import * as constants from "./constants"
import request from "request"

export const fetchListPosts = ({ lastId = null }) => dispatch => {
	request.get(
		`${window.location.origin}/api/home/getTweetsForAssignment`,
		{
			json: true,
			qs: {
				lastId
			}
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.GET_LIST_POSTS
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
