import * as constants from '../constants';
import request from 'request';

export const fetchDiscussion = ({bearer, id}) => dispatch => {
    request.get(`${window.location.origin}/api/discussions`, {
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
                type: constants.GET_DISCUSSION,
                payload: body
            })
        }
    })
}

export const setTags = ({value, text}) => dispatch => {
    dispatch({
        type: constants.SET_DISCUSSION_TAGS,
        payload: {text, value}
    })
}

export const submitDiscussion = ({bearer, description, extra, id = null, tags, title}) => dispatch => {
    request.post(`${window.location.origin}/api/discussions/create`, {
        form: {
            description,
            extra,
            id,
            tags,
            title
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
         dispatch({
            type: constants.SUBMIT_DISCUSSION,
            payload: body
        })
    })
}

export const updateDiscussion = ({bearer, description, extra, id, tags, title}) => dispatch => {
    request.post(`${window.location.origin}/api/discussions/update`, {
        form: {
            description,
            extra,
            id,
            tags,
            title
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
         dispatch({
            type: constants.UPDATE_DISCUSSION,
            payload: body
        })
    })
}
