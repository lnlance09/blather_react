import * as constants from "../constants"
import request from "request"

export const addPic = ({ bearer, caption, file, id }) => dispatch => {
	const fr = new FileReader()
	fr.onload = event => {
		request.post(
			`${window.location.origin}/api/tags/addPic`,
			{
				headers: {
					Authorization: bearer,
					"Content-Type": "multipart/form-data",
					enctype: "multipart/form-data"
				},
				json: true,
				multipart: {
					chunked: false,
					data: [
						{
							"Content-Disposition": `form-data; name="file"; filename="${
								file.name
							}"`,
							body: event.target.result
						}
					]
				},
				qs: {
					caption,
					id
				}
			},
			function(err, response, body) {
				dispatch({
					payload: body,
					type: constants.ADD_TAG_PIC
				})
			}
		)
	}
	fr.readAsArrayBuffer(file)
}

export const fetchHistory = ({ id }) => dispatch => {
	request.get(
		`${window.location.origin}/api/tags/getHistory`,
		{
			json: true,
			qs: {
				id
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.FETCH_TAG_HISTORY,
				payload: body
			})
		}
	)
}

export const fetchTaggedUsers = ({ id }) => dispatch => {
	request.get(
		`${window.location.origin}/api/tags/getTaggedUsers`,
		{
			json: true,
			qs: {
				id
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.FETCH_TAGGED_USERS,
				payload: body
			})
		}
	)
}

export const fetchTagInfo = ({ id }) => dispatch => {
	request.get(
		`${window.location.origin}/api/tags`,
		{
			json: true,
			qs: {
				id
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.FETCH_TAG_INFO,
				payload: body
			})
		}
	)
}

export const getRelatedTags = ({ q }) => dispatch => {
	request.get(
		`${window.location.origin}/api/tags/getRelatedTags`,
		{
			json: true,
			qs: {
				q
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.GET_RELATED_TAGS,
				payload: body
			})
		}
	)
}

export const updateDescription = ({ description }) => dispatch => {
	dispatch({
		type: constants.UPDATE_TAG_DESCRIPTION,
		payload: description
	})
}

export const updateTag = ({ bearer, description, id }) => dispatch => {
	request.post(
		`${window.location.origin}/api/tags/update`,
		{
			form: {
				description,
				id
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.UPDATE_TAG,
				payload: body
			})
		}
	)
}
