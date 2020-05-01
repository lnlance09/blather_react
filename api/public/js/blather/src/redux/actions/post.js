import * as constants from "../constants"
import request from "request"
import { showLoading, hideLoading } from "react-redux-loading-bar"

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
				payload: body,
				type: constants.CREATE_ARCHIVE
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
				payload: body,
				type: constants.CREATE_COMMENT_ARCHIVE
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
				payload: body,
				type: constants.CREATE_VIDEO_ARCHIVE
			})
		}
	)
}

export const downloadVideo = ({ audio, id }) => dispatch => {
	request.post(
		`${window.location.origin}/api/youtube/download`,
		{
			form: {
				audio,
				id
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.DOWNLOAD_VIDEO
			})
		}
	)
}

export const fetchPostData = ({ a, bearer, url }) => dispatch => {
	dispatch(showLoading())

	request.get(
		`${window.location.origin}/api/${url}`,
		{
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error && body.type === "video" && body.exists_on_yt) {
				dispatch(downloadVideo({ audio: 0, id: body.data.id }))
			}

			dispatch({
				a,
				payload: body,
				type: constants.GET_POST_DATA
			})

			dispatch(hideLoading())
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
				payload: body,
				type: constants.FETCH_VIDEO_COMMENTS
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
