import * as constants from "../constants"
import request from "request"

export const changePic = ({ bearer, file, id }) => dispatch => {
	const fr = new FileReader()
	fr.onload = event => {
		request.post(
			`${window.location.origin}/api/tags/changePic`,
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
					id
				}
			},
			function(err, response, body) {
				dispatch({
					payload: body,
					type: constants.CHANGE_TAG_PIC
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
