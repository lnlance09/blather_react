import * as constants from "./constants"
import request from "request"

export const getFallacies = ({
	assignedBy,
	assignedTo,
	commentId,
	exclude,
	fallacies,
	fallacyId,
	network,
	objectId,
	page,
	q,
	shuffle,
	sort,
	tagId,
	type
}) => dispatch => {
	request.get(
		`${window.location.origin}/api/fallacies/search`,
		{
			json: true,
			qs: {
				assignedBy,
				assignedTo,
				commentId,
				exclude,
				fallacies,
				fallacyId,
				network,
				objectId,
				page,
				q,
				shuffle: shuffle === true ? 1 : 0,
				sort,
				tagId,
				type
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.GET_FALLACIES,
				payload: body
			})
		}
	)
}

export const getTargets = ({ id }) => dispatch => {
	request.get(
		`${window.location.origin}/api/fallacies/getTargets`,
		{
			json: true,
			qs: {
				id
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.GET_TARGETS,
				payload: body
			})
		}
	)
}

export const toggleLoading = () => dispatch => {
	dispatch({
		type: constants.TOGGLE_LOADING
	})
}

export const updateSearchTerm = ({ q }) => dispatch => {
	dispatch({
		type: constants.UPDATE_SEARCH_TERM,
		payload: {
			q
		}
	})
}
