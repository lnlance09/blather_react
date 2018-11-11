import * as constants from "./constants"
import request from "request"

export const assignFallacy = ({
	bearer,
	commentId,
	contradiction,
	endTime,
	explanation,
	fallacyId,
	highlightedText,
	network,
	objectId,
	pageId,
	startTime,
	title
}) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/assign`,
		{
			form: {
				commentId,
				contradiction,
				endTime,
				explanation,
				fallacyId,
				highlightedText,
				network,
				pageId,
				objectId,
				startTime,
				title
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.ASSIGN_FALLACY,
				payload: body
			})
		}
	)
}

export const clearContradiction = () => dispatch => {
	dispatch({
		type: constants.CLEAR_CONTRADICTION
	})
}

export const parseContradiction = ({ bearer, url }) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/parseUrl`,
		{
			form: {
				url
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.PARSE_CONTRADICTION,
				payload: body
			})
		}
	)
}

export const selectAssignee = ({ id, name, type, username }) => dispatch => {
	dispatch({
		payload: {
			page: {
				id,
				name,
				type,
				username
			}
		},
		type: constants.SELECT_ASSIGNEE
	})
}

export const setContradictionEndTime = value => dispatch => {
	dispatch({
		type: constants.SET_CONTRADICTION_END_TIME,
		payload: {
			value
		}
	})
}

export const setContradictionHighlight = text => dispatch => {
	dispatch({
		type: constants.SET_CONTRADICTION_HIGHLIGHT,
		text
	})
}

export const setContradictionVideoTime = time => dispatch => {
	dispatch({
		type: constants.SET_CONTRADICTION_VIDEO_TIME,
		payload: {
			time
		}
	})
}
