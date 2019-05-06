import * as constants from "../constants"
import request from "request"
import { showLoading, hideLoading } from "react-redux-loading-bar"

export const createVideoFallacy = ({
	contradiction,
	duration,
	fallacyName,
	id,
	img,
	original,
	refId
}) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/createVideo`,
		{
			form: {
				contradiction,
				duration,
				fallacyName,
				id,
				img,
				original,
				refId
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.CREATE_FALLACY_VIDEO,
				payload: body
			})
		}
	)
}

export const editExplanation = ({ explanation }) => dispatch => {
	dispatch({
		type: constants.EDIT_EXPLANATION,
		payload: {
			explanation
		}
	})
}

export const fetchCommentCount = ({ id }) => dispatch => {
	request.get(
		`${window.location.origin}/api/fallacies/getCommentCount`,
		{
			json: true,
			qs: {
				id
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.GET_FALLACY_COMMENT_COUNT,
				payload: body
			})
		}
	)
}

export const fetchFallacyConversation = ({ bearer, id }) => dispatch => {
	request.get(
		`${window.location.origin}/api/fallacies/getConversation`,
		{
			headers: {
				Authorization: bearer
			},
			json: true,
			qs: {
				id
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.GET_FALLACY_CONVERSATION,
				payload: body
			})
		}
	)
}

export const fetchFallacy = ({ bearer, id }) => dispatch => {
	dispatch(showLoading())

	request.get(
		`${window.location.origin}/api/fallacies`,
		{
			headers: {
				Authorization: bearer
			},
			json: true,
			qs: {
				id
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.GET_FALLACY,
				payload: body
			})
			dispatch(hideLoading())
		}
	)
}

export const removeFallacyTag = ({ bearer, id, tagId, tagName }) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/removeTag`,
		{
			form: {
				id,
				tagId
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.REMOVE_FALLACY_TAG,
				payload: {
					id: tagId,
					name: tagName
				}
			})
		}
	)
}

export const retractLogic = ({ bearer, id, type }) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/retractLogic`,
		{
			form: {
				id,
				type
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				dispatch({
					type: constants.RETRACT_LOGIC
				})
			}
		}
	)
}

export const saveScreenshot = ({ id, img, slug }) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/saveScreenshot`,
		{
			form: {
				id,
				img,
				slug
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.SAVE_SCREENSHOT,
				payload: body
			})
		}
	)
}

export const setTags = ({ value, text }) => dispatch => {
	dispatch({
		type: constants.SET_FALLACY_TAGS,
		payload: { text, value }
	})
}

export const submitFallacyConversation = ({ bearer, id, msg }) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/submitConversation`,
		{
			form: {
				id,
				msg
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.SUBMIT_FALLACY_CONVERSATION,
				payload: body
			})
		}
	)
}

export const toggleCreateMode = () => dispatch => {
	dispatch({
		type: constants.TOGGLE_CREATE_MODE
	})
}

export const updateFallacy = ({
	bearer,
	contradictionEndTime,
	contradictionStartTime,
	endTime,
	explanation,
	fallacyId,
	fallacyName,
	id,
	startTime,
	tags,
	title
}) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/update`,
		{
			form: {
				contradictionEndTime,
				contradictionStartTime,
				endTime,
				explanation,
				fallacyId,
				fallacyName,
				id,
				startTime,
				tags,
				title
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				body.fallacy.fallacyName = fallacyName
			}
			dispatch({
				type: constants.UPDATE_FALLACY,
				payload: body
			})
		}
	)
}

export const reset = () => dispatch => {
	dispatch({
		type: constants.RESET_FALLACY_TO_INITIAL
	})
}
