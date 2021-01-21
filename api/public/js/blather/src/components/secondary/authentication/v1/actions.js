import * as constants from "./constants"
import secret, { parseJwt, setToken } from "utils/tokenFunctions"
import { toast } from "react-toastify"
import { getConfig } from "options/toast"
import jwt from "jsonwebtoken"
import request from "request"

toast.configure(getConfig())

export const changePassword = ({
	bearer,
	callback = () => null,
	confirmPassword,
	newPassword,
	password
}) => dispatch => {
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
			callback()

			if (body.error) {
				toast.error(body.error)
			} else {
				toast.success("Your password has been changed")
			}

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
							"Content-Disposition": `form-data; name="file"; filename="${file.name}"`,
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

export const linkTwitter = ({ bearer, callback = () => null, token, verifier }) => dispatch => {
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
			if (!body.error) {
				let token = ""
				if (bearer) {
					let localData = parseJwt()
					localData.twitterAccessSecret = body.user.twitterAccessSecret
					localData.twitterAccessToken = body.user.twitterAccessToken
					localData.twitterUrl = body.user.twitterUrl
					if (body.user.linkedTwitter) {
						localData.linkedTwitter = 1
						localData.twitterDate = body.user.twitterDate
						localData.twitterId = body.user.twitterId
						localData.twitterUsername = body.user.twitterUsername
					}
					token = setToken(localData)
					body.bearer = token

					dispatch({
						payload: body,
						type: constants.LINK_TWITTER_ACCOUNT
					})
					return
				}

				token = setToken(body.user)
				body.bearer = token

				callback()
				dispatch({
					payload: body,
					type: constants.SET_USER_DATA
				})
			}
		}
	)
}

export const linkYouTube = ({ bearer, code }) => dispatch => {
	request.post(
		`${window.location.origin}/api/youtube/redirect`,
		{
			form: {
				code
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

export const setPatreonUsername = ({ bearer, patreonUsername }) => dispatch => {
	request.post(
		`${window.location.origin}/api/users/update`,
		{
			form: {
				patreonUsername
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				let localData = parseJwt()
				localData.patreonUsername = body.data.patreon_username
				const token = setToken(localData)

				dispatch({
					payload: {
						patreonUsername: body.data.patreon_username,
						bearer: token
					},
					type: constants.SET_PATREON_USERNAME
				})
			}
		}
	)
}

export const submitGoogleForm = ({ accessToken, email, id, idToken, img, name }) => dispatch => {
	request.post(
		`${window.location.origin}/api/users/registerWithGoogle`,
		{
			form: {
				accessToken,
				email,
				id,
				idToken,
				img,
				name
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				const token = jwt.sign({ data: body.user }, secret, {
					expiresIn: 60 * 60 * 5
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

export const submitLoginForm = ({ callback = () => null, email, password }) => dispatch => {
	request.post(
		`${window.location.origin}/api/users/login`,
		{
			form: {
				email,
				password
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				const token = setToken(body.user)
				body.bearer = token
			}

			if (body.error) {
				toast.error("Wrong password")
			}

			callback()

			dispatch({
				payload: body,
				type: constants.SET_USER_DATA
			})
		}
	)
}

export const submitRegistrationForm = ({
	callback = () => null,
	email,
	name,
	password,
	username
}) => dispatch => {
	request.post(
		`${window.location.origin}/api/users/register`,
		{
			form: {
				email,
				name,
				password,
				username
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				const token = jwt.sign({ data: body.user }, secret, {
					expiresIn: 60 * 60 * 5
				})
				localStorage.setItem("jwtToken", token)
				body.bearer = token
			}

			if (body.error) {
				toast.error(body.error)
			}

			callback()

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

export const togglePatreonLoading = () => dispatch => {
	dispatch({
		type: constants.TOGGLE_PATREON_LOADING
	})
}

export const twitterRequestToken = ({ bearer, reset }) => dispatch => {
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
				let token = null
				if (!reset) {
					let localData = parseJwt()
					localData.twitterUrl = body.url
					token = setToken(localData)
				}

				dispatch({
					payload: {
						bearer: token,
						twitterAccessSecret: body.secret,
						twitterUrl: body.url
					},
					type: constants.SET_TWITTER_URL
				})
			}
		}
	)
}

export const updateAbout = ({ bearer, bio, callback = () => null }) => dispatch => {
	request.post(
		`${window.location.origin}/api/users/update`,
		{
			form: {
				bio
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			if (!body.error) {
				let localData = parseJwt()
				localData.bio = body.data.bio
				const token = setToken(localData)

				dispatch({
					payload: {
						bio: body.data.bio,
						bearer: token
					},
					type: constants.UPDATE_ABOUT
				})

				toast.success("Edited!")
				callback()
			}
		}
	)
}

export const verifyEmail = ({ code, bearer }) => dispatch => {
	request.post(
		`${window.location.origin}/api/users/verifyEmail`,
		{
			form: {
				code
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

			if (body.error) {
				toast.error(body.error)
			}

			dispatch({
				payload: body,
				type: constants.VERIFY_EMAIL
			})
		}
	)
}
