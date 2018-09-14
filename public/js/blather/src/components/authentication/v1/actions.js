import * as constants from './constants';
import { parseJwt, setToken } from '../../../utils/token';
import jwt from 'jsonwebtoken';
import request from 'request';

export const changePassword = ({bearer, confirmPassword, newPassword, password}) => dispatch => {
    request.post(`${window.location.origin}/api/users/changePassword`, {
        form: {
            current_password: password,
            new_password: newPassword,
            confirm_password: confirmPassword
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        dispatch({
            type: constants.CHANGE_PASSWORD,
            payload: body
        })
    })
}

export const changeProfilePic = ({bearer, file}) => dispatch => {
    const fr = new FileReader();
    fr.onload = (event) => {
        request.post(`${window.location.origin}/api/users/changeProfilePic`, {
            headers: {
                'Authorization': bearer,
                'Content-Type': 'multipart/form-data',
                'enctype': 'multipart/form-data'
            },
            json: true,
            multipart: {
                chunked: false,
                data: [{
                    'Content-Disposition': `form-data; name="file"; filename="${file.name}"`,
                    body: event.target.result
                }]
            }
        }, function(err, response, body) {
            let localData = parseJwt();
            if(!body.error) {
                localData.img = body.img;
            }
            const token = setToken(localData);
            body.bearer = token;

             dispatch({
                type: constants.CHANGE_PROFILE_PIC,
                payload: body
            })
        })
    }
    fr.readAsArrayBuffer(file);
}

export const linkFacebook = ({bearer, code}) => (dispatch, getState) => {
    request.post(`${window.location.origin}/api/fb/getCredentials`, {
        form: {
            code
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        let localData = parseJwt();
        if(body.linked_fb) {
            localData.linkedFb = 1
            localData.fbAccessToken = body.fb_access_token
            localData.fbDate = body.fb_date
            localData.fbId = body.fb_id
            localData.fbUrl = body.fbUrl
            const token = setToken(localData)
            body.bearer = token
        }

        dispatch({
            type: constants.LINK_FACEBOOK_ACCOUNT,
            payload: body
        })
    })
}

export const linkTwitter = ({bearer, secret, token, verifier}) => (dispatch, getState) => {
    request.post(`${window.location.origin}/api/twitter/getCredentials`, {
        form: {
            oauth_token: token,
            oauth_verifier: verifier
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        let localData = parseJwt();
        localData.twitterAccessSecret = body.twitter_access_secret
        localData.twitterAccessToken = body.twitter_access_token
        localData.twitterUrl = body.twitterUrl
        if(body.linked_twitter) {
            localData.linkedTwitter = 1
            localData.twitterDate = body.twitter_date
            localData.twitterId = body.twitter_id
            localData.twitterUsername = body.twitter_username
        }
        const token = setToken(localData)
        body.bearer = token

        dispatch({
            type: constants.LINK_TWITTER_ACCOUNT,
            payload: body
        })
    })
}

export const linkYouTube = ({bearer, code}) => (dispatch, getState) => {
    request.post(`${window.location.origin}/api/youtube/redirect`, {
        form: {
            code: code
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        let localData = parseJwt();
        if(body.linked_youtube) {
            localData.linkedYoutube = 1
            localData.youtubeAccessToken = body.youtube_access_token
            localData.youtubeDate = body.youtube_date
            localData.youtubeId = body.youtube_id
            localData.youtubeRefreshToken = body.youtube_refresh_token
            setToken(localData)
        }

        dispatch({
            type: constants.LINK_YOUTUBE_ACCOUNT,
            payload: body
        })
    })
}

export const logout = () => (dispatch, getState) => {
    localStorage.removeItem('jwtToken');
    dispatch({
        type: constants.LOGOUT
    })
}

export const refreshYouTubeToken = ({bearer}) => dispatch => {
    request.get(`${window.location.origin}/api/youtube/refresh`, {
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        if(!body.error) {
            const localData = parseJwt()
            localData.youtubeAccessToken = body.refreshToken
            const token = setToken(localData)

            dispatch({
                type: constants.REFRESH_YOUTUBE_TOKEN,
                payload: {
                    bearer: token,
                    youtubeRefreshToken: body.refreshToken
                }
            })
        }
    })
}

export const removeFacebook = bearer => (dispatch, getState) => {
    request.post(`${window.location.origin}/api/fb/remove`, {
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        if(body.success) {
            let localData = parseJwt();
            localData.linkedFb = 0
            localData.fbAccessToken = body.fbAccessToken
            localData.fbDate = null
            localData.fbId = null
            const token = setToken(localData)
            body.bearer = token

            dispatch({
                type: constants.REMOVE_FACEBOOK_ACCOUNT,
                payload: body
            })
        }
    })
}

export const removeTwitter = bearer => (dispatch, getState) => {
    request.post(`${window.location.origin}/api/twitter/remove`, {
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        if(body.success) {
            let localData = parseJwt();
            localData.linkedTwitter = 0
            localData.twitterAccessSecret = body.twitterAccessSecret
            localData.twitterAccessToken = body.twitterAccessToken
            localData.twitterDate = null
            localData.twitterId = null
            localData.twitterUrl = body.twitterUrl
            localData.twitterUsername = null
            const token = setToken(localData)
            body.bearer = token

            dispatch({
                type: constants.REMOVE_TWITTER_ACCOUNT,
                payload: body
            })
        }
    })
}

export const removeYouTube = bearer => (dispatch, getState) => {
    request.post(`${window.location.origin}/api/youtube/remove`, {
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
         if(body.success) {
            let localData = parseJwt()
            localData.linkedYoutube = 0
            localData.youtubeAccessToken = ''
            localData.youtubeDate = ''
            localData.youtubeId = ''
            localData.youtubeRefreshToken = ''
            localData.youtubeUrl = body.youtubeUrl
            const token = setToken(localData)
            body.bearer = token
        }

        dispatch({
            type: constants.REMOVE_YOUTUBE_ACCOUNT,
            payload: body
        })
    })
}

export const resetPasswordProps = () => dispatch => {
    dispatch({
        type: constants.RESET_PASSWORD_PROPS
    })
}

export const submitLoginForm = ({email, password}) => (dispatch, getState) => {
    request.post(`${window.location.origin}/api/users/login`, {
        form: {
            email: email,
            password: password
        },
        json: true
    }, function(err, response, body) {
        if(!body.error) {
            const token = setToken(body.user)
            body.bearer = token
        }

        dispatch({
            type: constants.SET_USER_DATA,
            payload: body
        })
    })
}

export const submitRegistrationForm = ({email, name, password, username}) => (dispatch, getState) => {
    request.post(`${window.location.origin}/api/users/register`, {
        form: {
            email: email,
            name: name,
            password: password,
            username: username
        },
        json: true
    }, function(err, response, body) {
        if(!body.error) {
            const token = jwt.sign({data: body.user}, 'secret', {expiresIn: 60*60})
            localStorage.setItem('jwtToken', token)
            body.user.bearer = token
        }

        dispatch({
            type: constants.SET_USER_DATA,
            payload: body
        })
    })
}

export const switchTab = (tab) => dispatch => {
    dispatch({
        type: constants.SWITCH_TAB,
        tab: tab
    })
}

export const updateAbout = ({bearer, bio}) => dispatch => {
    request.post(`${window.location.origin}/api/users/update`, {
        form: {
            bio: bio
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        if(!body.error) {
            let localData = parseJwt()
            localData.bio = bio
            const token = setToken(localData)

            dispatch({
                type: constants.UPDATE_ABOUT,
                payload: {bio: bio, bearer: token}
            })
        }
    })
}

export const verifyEmail = ({code, bearer}) => (dispatch, getState) => {
    request.post(`${window.location.origin}/api/users/verifyEmail`, {
        form: {
            code: code
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        if(!body.error) {
            setToken(body.user)
        }

        dispatch({
            type: constants.VERIFY_EMAIL,
            payload: body
        })
    })
}
