import * as constants from "../constants"
import request from "request"

export const createArchive = ({ bearer, url }) => dispatch => {
	request.post(
		`${window.location.origin}/api/users/createArchive`,
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
				type: constants.CREATE_ARCHIVE,
				payload: body
			})
		}
	)
}

export const createCommentArchive = ({ bearer, commentId, id }) => dispatch => {
	request.post(
		`${window.location.origin}/api/youtube/archiveComment`,
		{
			form: {
				id,
				commentId
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.CREATE_COMMENT_ARCHIVE,
				payload: body
			})
		}
	)
}

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

export const downloadVideo = ({ audio, id }) => dispatch => {
	request.post(
		"https://media.blather.io/api/youtube/download",
		{
			form: {
				audio,
				id
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.DOWNLOAD_VIDEO,
				payload: body
			})
		}
	)
}

export const fetchPostData = ({ a, bearer, url }) => dispatch => {
	request.get(
		`${window.location.origin}/api/${url}`,
		{
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				a,
				type: constants.GET_POST_DATA,
				payload: body
			})
		}
	)
}

export const fetchVideoComments = ({ bearer, id, nextPageToken, page }) => dispatch => {
	request.get(
		`${window.location.origin}/api/youtube/getComments`,
		{
			headers: {
				Authorization: bearer
			},
			json: true,
			qs: {
				id,
				nextPageToken,
				page
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.FETCH_VIDEO_COMMENTS,
				payload: body
			})
		}
	)
}

export const insertComment = ({ bearer, id, videoId }) => dispatch => {
	request.get(
		`${window.location.origin}/api/youtube/comment`,
		{
			headers: {
				Authorization: bearer
			},
			json: true,
			qs: {
				id,
				videoId
			}
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.INSERT_COMMENT
			})
		}
	)
}

export const unsetComment = () => dispatch => {
	dispatch({
		type: constants.UNSET_COMMENT
	})
}
