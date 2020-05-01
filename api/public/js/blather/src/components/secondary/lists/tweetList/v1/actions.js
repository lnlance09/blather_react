import * as constants from "./constants"
import request from "request"

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
