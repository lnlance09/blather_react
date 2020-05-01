import * as constants from "../constants"
import request from "request"

export const acceptDiscussionConvo = ({ acceptance, bearer, id }) => dispatch => {
	request.post(
		`${window.location.origin}/api/discussions/accept`,
		{
			form: {
				acceptance,
				id
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.ACCEPT_DISCUSSION
			})
		}
	)
}

export const fetchDiscussion = ({ bearer, id }) => dispatch => {
	request.get(
		`${window.location.origin}/api/discussions`,
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
				type: constants.GET_DISCUSSION
			})
		}
	)
}

export const fetchDiscussionConversation = ({ bearer, id }) => dispatch => {
	request.get(
		`${window.location.origin}/api/discussions/getConversation`,
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
				type: constants.GET_DISCUSSION_CONVERSATION
			})
		}
	)
}

export const removeDiscussionTag = ({ bearer, id, tagId, tagName }) => dispatch => {
	request.post(
		`${window.location.origin}/api/discussions/removeTag`,
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
				type: constants.REMOVE_DISCUSSION_TAG
			})
		}
	)
}

export const setTags = ({ value, text }) => dispatch => {
	dispatch({
		payload: { text, value },
		type: constants.SET_DISCUSSION_TAGS
	})
}

export const submitDiscussion = ({
	bearer,
	description,
	extra,
	id = null,
	tags,
	title
}) => dispatch => {
	request.post(
		`${window.location.origin}/api/discussions/create`,
		{
			form: {
				description,
				extra,
				id,
				tags,
				title
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.SUBMIT_DISCUSSION
			})
		}
	)
}

export const submitDiscussionConversation = ({ bearer, id, msg, status }) => dispatch => {
	request.post(
		`${window.location.origin}/api/discussions/submitConversation`,
		{
			form: {
				id,
				msg,
				status
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				payload: {
					body,
					status
				},
				type: constants.SUBMIT_DISCUSSION_CONVERSATION
			})
		}
	)
}

export const updateDescription = ({ description }) => dispatch => {
	dispatch({
		payload: {
			description
		},
		type: constants.UPDATE_DESCRIPTION
	})
}

export const updateExtra = ({ extra }) => dispatch => {
	dispatch({
		payload: {
			extra
		},
		type: constants.UPDATE_EXTRA
	})
}

export const updateDiscussion = ({ bearer, description, extra, id, tags, title }) => dispatch => {
	request.post(
		`${window.location.origin}/api/discussions/update`,
		{
			form: {
				description,
				extra,
				id,
				tags,
				title
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.UPDATE_DISCUSSION
			})
		}
	)
}
