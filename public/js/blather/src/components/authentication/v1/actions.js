import * as constants from "./constants"
import { parseJwt, setToken } from "utils/token"
import jwt from "jsonwebtoken"
import request from "request"

export const changePassword = ({ bearer, confirmPassword, newPassword, password }) => dispatch => {
	request.post(
		`${window.location.origin}/api/users/changePassword`,
		{
			form: {
				current_password: password,
				new_password: newPassword,
				confirm_password: confirmPassword
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.CHANGE_PASSWORD
			})
		}
	)
}

export const changeProfilePic = ({ bearer, file }) => dispatch => {
	const fr = new FileReader()
	fr.onload = event => {
		request.post(
			`${window.location.origin}/api/users/changeProfilePic`,
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
				}
			},
			function(err, response, body) {
				let localData = parseJwt()
				if (!body.error) {
					localData.img = body.img
				}
				const token = setToken(localData)
				body.bearer = token

				dispatch({
					payload: body,
					type: constants.CHANGE_PROFILE_PIC
				})
			}
		)
	}
	fr.readAsArrayBuffer(file)
}

export const linkTwitter = ({ bearer, secret, token, verifier }) => dispatch => {
	request.post(
		`${window.location.origin}/api/twitter/getCredentials`,
		{
			form: {
				oauth_token: token,
				oauth_verifier: verifier
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			let localData = parseJwt()
			localData.twitterAccessSecret = body.twitter_access_secret
			localData.twitterAccessToken = body.twitter_access_token
			localData.twitterUrl = body.twitterUrl
			if (body.linked_twitter) {
				localData.linkedTwitter = 1
				localData.twitterDate = body.twitter_date
				localData.twitterId = body.twitter_id
				localData.twitterUsername = body.twitter_username
			}
			const token = setToken(localData)
			body.bearer = token

			dispatch({
				payload: body,
				type: constants.LINK_TWITTER_ACCOUNT
			})
		}
	)
}

export const linkYouTube = ({ bearer, code }) => dispatch => {
	request.post(
		`${window.location.origin}/api/youtube/redirect`,
		{
			form: {
				code: code
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			let localData = parseJwt()
			if (body.linked_youtube) {
				localData.linkedYoutube = 1
				localData.youtubeAccessToken = body.youtube_access_token
				localData.youtubeDate = body.youtube_date
				localData.youtubeId = body.youtube_id
				localData.youtubeRefreshToken = body.youtube_refresh_token
				setToken(localData)
			}

			dispatch({
				payload: body,
				type: constants.LINK_YOUTUBE_ACCOUNT
			})
		}
	)
}

export const logout = () => dispatch => {
	localStorage.removeItem("jwtToken")
	dispatch({
		type: constants.LOGOUT
	})
}

export const refreshYouTubeToken = ({ bearer }) => dispatch => {
	request.get(
		`${window.location.origin}/api/youtube/refresh`,
		{
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				const localData = parseJwt()
				localData.youtubeAccessToken = body.refreshToken
				const token = setToken(localData)

				dispatch({
					payload: {
						bearer: token,
						youtubeRefreshToken: body.refreshToken
					},
					type: constants.REFRESH_YOUTUBE_TOKEN
				})
			}
		}
	)
}

export const removeTwitter = bearer => dispatch => {
	request.post(
		`${window.location.origin}/api/twitter/remove`,
		{
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				let localData = parseJwt()
				localData.linkedTwitter = false
				localData.twitterAccessSecret = body.twitterAccessSecret
				localData.twitterAccessToken = body.twitterAccessToken
				localData.twitterDate = null
				localData.twitterId = null
				localData.twitterUrl = body.twitterUrl
				localData.twitterUsername = null
				const token = setToken(localData)
				body.bearer = token

				dispatch({
					payload: body,
					type: constants.REMOVE_TWITTER_ACCOUNT
				})
			}
		}
	)
}

export const removeYouTube = bearer => dispatch => {
	request.post(
		`${window.location.origin}/api/youtube/remove`,
		{
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				let localData = parseJwt()
				localData.linkedYoutube = false
				localData.youtubeAccessToken = null
				localData.youtubeDate = null
				localData.youtubeId = null
				localData.youtubeRefreshToken = null
				localData.youtubeUrl = body.youtubeUrl
				const token = setToken(localData)
				body.bearer = token
			}

			dispatch({
				payload: body,
				type: constants.REMOVE_YOUTUBE_ACCOUNT
			})
		}
	)
}

export const resetPasswordProps = () => dispatch => {
	dispatch({
		type: constants.RESET_PASSWORD_PROPS
	})
}

export const submitLoginForm = ({ email, password }) => dispatch => {
	request.post(
		`${window.location.origin}/api/users/login`,
		{
			form: {
				email: email,
				password: password
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				const token = setToken(body.user)
				body.bearer = token
			}

			dispatch({
				payload: body,
				type: constants.SET_USER_DATA
			})
		}
	)
}

export const submitRegistrationForm = ({ email, name, password, username }) => dispatch => {
	request.post(
		`${window.location.origin}/api/users/register`,
		{
			form: {
				email: email,
				name: name,
				password: password,
				username: username
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				const token = jwt.sign({ data: body.user }, "secret", {
					expiresIn: 60 * 60
				})
				localStorage.setItem("jwtToken", token)
				body.bearer = token
			}

			dispatch({
				payload: body,
				type: constants.SET_USER_DATA
			})
		}
	)
}

export const switchTab = tab => dispatch => {
	dispatch({
		tab: tab,
		type: constants.SWITCH_TAB
	})
}

export const twitterRequestToken = bearer => dispatch => {
	request.post(
		`${window.location.origin}/api/twitter/requestToken`,
		{
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				let localData = parseJwt()
				localData.twitterUrl = body.url
				const token = setToken(localData)

				dispatch({
					payload: {
						twitterUrl: body.url,
						bearer: token
					},
					type: constants.SET_TWITTER_URL
				})
			}
		}
	)
}

export const updateAbout = ({ bearer, bio }) => dispatch => {
	request.post(
		`${window.location.origin}/api/users/update`,
		{
			form: {
				bio: bio
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				let localData = parseJwt()
				localData.bio = bio
				const token = setToken(localData)

				dispatch({
					payload: {
						bio: bio,
						bearer: token
					},
					type: constants.UPDATE_ABOUT
				})
			}
		}
	)
}

export const verifyEmail = ({ code, bearer }) => dispatch => {
	request.post(
		`${window.location.origin}/api/users/verifyEmail`,
		{
			form: {
				code: code
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				setToken(body.user)
			}

			dispatch({
				payload: body,
				type: constants.VERIFY_EMAIL
			})
		}
	)
}
