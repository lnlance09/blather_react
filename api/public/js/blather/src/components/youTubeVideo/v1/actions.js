import * as constants from "./constants"
import request from "request"

export const createVideoArchive = ({ bearer, description, endTime, id, startTime }) => dispatch => {
	request.post(
		`${window.location.origin}/api/youtube/archive`,
		{
			form: {
				description,
				endTime,
				id,
				startTime
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.CREATE_VIDEO_ARCHIVE,
				payload: body
			})
		}
	)
}

export const deleteArchive = ({ bearer, id }) => dispatch => {
	request.post(
		`${window.location.origin}/api/youtube/deleteArchive`,
		{
			form: {
				id
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.DELETE_ARCHIVE,
				payload: body
			})
		}
	)
}

export const getVideoArchives = ({ archiveId, id, userId }) => dispatch => {
	request.get(
		`${window.location.origin}/api/youtube/getVideoArchives`,
		{
			json: true,
			qs: {
				id,
				userId
			}
		},
		function(err, response, body) {
			dispatch({
				archiveId,
				type: constants.GET_VIDEO_ARCHIVES,
				payload: body
			})
		}
	)
}

export const setCurrentVideoTime = time => dispatch => {
	dispatch({
		type: constants.SET_CURRENT_VIDEO_TIME,
		payload: {
			time
		}
	})
}

export const setDuration = ({ duration }) => dispatch => {
	dispatch({
		type: constants.SET_DURATION,
		payload: duration
	})
}

export const updateArchiveDescription = val => dispatch => {
	dispatch({
		type: constants.UPDATE_ARCHIVE_DESCRIPTION,
		val
	})
}

export const updateArchiveEndTime = val => dispatch => {
	dispatch({
		type: constants.UPDATE_ARCHIVE_END_TIME,
		val
	})
}

export const updateArchiveStartTime = val => dispatch => {
	dispatch({
		type: constants.UPDATE_ARCHIVE_START_TIME,
		val
	})
}
