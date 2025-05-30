import * as constants from "./constants"
import request from "request"
import { toast } from "react-toastify"
import { getConfig } from "options/toast"

toast.configure(getConfig())

export const assignFallacy = ({
	bearer,
	callback = () => null,
	commentId,
	contradiction,
	endTime,
	explanation,
	fallacyId,
	highlightedText,
	history,
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
			callback()

			dispatch({
				type: constants.ASSIGN_FALLACY,
				payload: body
			})

			if (body.error) {
				toast.error(body.error)
			}

			if (!body.error) {
				history.push(`/fallacies/${body.fallacy.id}`)
			}
		}
	)
}

export const clearContradiction = () => dispatch => {
	dispatch({
		type: constants.CLEAR_CONTRADICTION
	})
}

export const parseContradiction = ({ bearer, type, url }) => dispatch => {
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
				payload: body,
				postType: type
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

export const setBeginTime = value => dispatch => {
	dispatch({
		type: constants.SET_BEGIN_TIME,
		payload: {
			value
		}
	})
}

export const setContradictionBeginTime = value => dispatch => {
	dispatch({
		type: constants.SET_CONTRADICTION_BEGIN_TIME,
		payload: {
			value
		}
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

export const setEndTime = value => dispatch => {
	dispatch({
		type: constants.SET_END_TIME,
		payload: {
			value
		}
	})
}

export const toggleModal = () => dispatch => {
	dispatch({
		type: constants.TOGGLE_MODAL
	})
}
