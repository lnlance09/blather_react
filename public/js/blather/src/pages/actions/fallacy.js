import * as constants from '../constants';
import request from 'request';

export const fetchCommentCount = ({id}) => dispatch => {
    request.get(`${window.location.origin}/api/fallacies/getCommentCount`, {
        json: true,
        qs: {
            id
        },
    }, function(err, response, body) {
        dispatch({
            type: constants.GET_FALLACY_COMMENT_COUNT,
            payload: body
        })
    })
}

export const fetchComments = ({id, page}) => dispatch => {
    request.get(`${window.location.origin}/api/fallacies/getComments`, {
        json: true,
        qs: {
            id,
            page
        },
    }, function(err, response, body) {
        dispatch({
            type: constants.GET_COMMENTS,
            payload: body
        })
    })
}

export const fetchConversation = ({bearer, id}) => dispatch => {
    request.get(`${window.location.origin}/api/fallacies/getConversation`, {
        headers: {
            'Authorization': bearer 
        },
        json: true,
        qs: {
            id
        },
    }, function(err, response, body) {
        dispatch({
            type: constants.GET_FALLACY_CONVERSATION,
            payload: body
        })
    })
}

export const fetchFallacy = ({bearer, id}) => dispatch => {
    request.get(`${window.location.origin}/api/fallacies`, {
        headers: {
            'Authorization': bearer 
        },
        json: true,
        qs: {
            id
        },
    }, function(err, response, body) {
        if(!body.error) {
            dispatch({
                type: constants.GET_FALLACY,
                payload: body
            })
        }
    })
}

export const postComment = ({bearer, id, message }) => dispatch => {
    request.post(`${window.location.origin}/api/fallacies/postComment`, {
        form: {
            id,
            message
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        dispatch({
            type: constants.POST_COMMENT,
            payload: body
        })
    })
}

export const removeFallacyTag = ({bearer, id, tagId, tagName}) => dispatch => {
    request.post(`${window.location.origin}/api/fallacies/removeTag`, {
        form: {
            id,
            tagId
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        dispatch({
            type: constants.REMOVE_FALLACY_TAG,
            payload: {
                id: tagId,
                name: tagName
            }
        })
    })
}

export const setTags = ({value, text}) => dispatch => {
    dispatch({
        type: constants.SET_FALLACY_TAGS,
        payload: {text, value}
    })
}

export const submitConversation = ({bearer, id, msg}) => dispatch => {
    request.post(`${window.location.origin}/api/fallacies/submitConversation`, {
        form: {
            id,
            msg
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        dispatch({
            type: constants.SUBMIT_FALLACY_CONVERSATION,
            payload: body
        })
    })
}

export const updateFallacy = ({bearer, explanation, fallacyId, fallacyName, id, tags, title}) => dispatch => {
    request.post(`${window.location.origin}/api/fallacies/update`, {
        form: {
            explanation,
            fallacyId,
            fallacyName,
            id,
            tags,
            title
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        if(!body.error) {
            body.fallacy.fallacyName = fallacyName
        }

        dispatch({
            type: constants.UPDATE_FALLACY,
            payload: body
        })
    })
}