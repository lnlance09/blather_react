import * as constants from '../constants';
import request from 'request';

export const fetchTagInfo = ({id}) => dispatch => {
    request.get(`${window.location.origin}/api/tags`, {
        json: true,
        qs: {
            id
        }
    }, function(err, response, body) {
        dispatch({
            type: constants.FETCH_TAG_INFO,
            payload: body
        })
    })
}

export const updateTag = ({bearer, description, id}) => dispatch => {
    request.post(`${window.location.origin}/api/tags/update`, {
        form: {
            description,
            id
        },
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
        dispatch({
            type: constants.UPDATE_TAG,
            payload: body
        })
    })
}