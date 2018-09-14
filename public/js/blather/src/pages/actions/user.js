import * as constants from '../constants';
import request from 'request';

export const fetchUserData = ({bearer, username}) => dispatch => {
    request.get(`${window.location.origin}/api/users/getInfo?username=${username}`, {
        headers: {
            'Authorization': bearer 
        },
        json: true
    }, function(err, response, body) {
         dispatch({
            type: constants.GET_USER_DATA,
            payload: body
        })
    })
}

export const getArchives = ({ id, page }) => dispatch => {
    request.get(`${window.location.origin}/api/users/getArchivedLinks`, {
        json: true,
        qs: {
            id,
            page
        }
    }, function(err, response, body) {
        dispatch({
            type: constants.GET_ARCHIVED_LINKS,
            payload: body
        })
    })
}
