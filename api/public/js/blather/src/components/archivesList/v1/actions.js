import * as constants from "./constants"
import request from "request"

export const getArchives = ({ id, page, pageId, q }) => dispatch => {
	request.get(
		`${window.location.origin}/api/users/getArchivedLinks`,
		{
			json: true,
			qs: {
				id,
				page,
				pageId,
				q
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.GET_ARCHIVED_LINKS,
				payload: body
			})
		}
	)
}
