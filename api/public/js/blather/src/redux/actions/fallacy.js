import * as constants from "../constants"
import { toast } from "react-toastify"
import { getConfig } from "options/toast"
import { showLoading, hideLoading } from "react-redux-loading-bar"
import request from "request"

toast.configure(getConfig())

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
				payload: body,
				type: constants.CREATE_FALLACY_VIDEO
			})
		}
	)
}

export const editExplanation = ({ explanation }) => dispatch => {
	dispatch({
		payload: {
			explanation
		},
		type: constants.EDIT_EXPLANATION
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
				payload: body,
				type: constants.GET_FALLACY_COMMENT_COUNT
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
				payload: body,
				type: constants.GET_FALLACY_CONVERSATION
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
				payload: body,
				type: constants.GET_FALLACY
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
				payload: {
					id: tagId,
					name: tagName
				},
				type: constants.REMOVE_FALLACY_TAG
			})
		}
	)
}

export const reset = () => dispatch => {
	dispatch({
		type: constants.RESET_FALLACY_TO_INITIAL
	})
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
				payload: body,
				type: constants.SAVE_SCREENSHOT
			})
		}
	)
}

export const setTags = ({ value, text }) => dispatch => {
	dispatch({
		payload: { text, value },
		type: constants.SET_FALLACY_TAGS
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
				payload: body,
				type: constants.SUBMIT_FALLACY_CONVERSATION
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
				toast.success("Updated")
			}
			dispatch({
				payload: body,
				type: constants.UPDATE_FALLACY
			})
		}
	)
}

export const uploadBackgroundPic = ({ file }) => dispatch => {
	const fr = new FileReader()
	fr.onload = event => {
		request.post(
			`${window.location.origin}/api/fallacies/uploadBackgroundPic`,
			{
				headers: {
					"Content-Type": "multipart/form-data",
					enctype: "multipart/form-data"
				},
				json: true,
				multipart: {
					chunked: false,
					data: [
						{
							"Content-Disposition": `form-data; name="file"; filename="${file.name}"`,
							body: event.target.result
						}
					]
				}
			},
			function(err, response, body) {
				dispatch({
					payload: body,
					type: constants.UPLOAD_BACKGROUND_PIC
				})
			}
		)
	}
	fr.readAsArrayBuffer(file)
}
