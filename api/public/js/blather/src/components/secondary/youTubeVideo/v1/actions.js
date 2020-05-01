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
				payload: body,
				type: constants.CREATE_VIDEO_ARCHIVE
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
				payload: body,
				type: constants.DELETE_ARCHIVE
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
				payload: body,
				type: constants.GET_VIDEO_ARCHIVES
			})
		}
	)
}

export const setCurrentVideoTime = time => dispatch => {
	dispatch({
		payload: {
			time
		},
		type: constants.SET_CURRENT_VIDEO_TIME
	})
}

export const setDuration = ({ duration }) => dispatch => {
	dispatch({
		payload: duration,
		type: constants.SET_DURATION
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
