import * as constants from './constants';
import request from 'request';

export const fetchDiscussions = ({bearer, page, q, startedBy, status, tags, withUser}) => dispatch => {
    request.get(`${window.location.origin}/api/discussions/search`, {
        headers: {
            'Authorization': bearer 
        },
        json: true,
        qs: {
            page,
            q,
            startedBy,
            status,
            tags,
            withUser
        },
    }, function(err, response, body) {
        if(!body.error) {
            dispatch({
                type: constants.GET_DISCUSSIONS,
                payload: body
            })
        }
    })
}

export const fetchTags = () => dispatch => {
    request.get(`${window.location.origin}/api/tags/getTags`, {
        json: true
    }, function(err, response, body) {
        dispatch({
            type: constants.GET_TAGS,
            payload: body
        })
    })
}
