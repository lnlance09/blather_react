import * as constants from "../constants";
import request from "request";

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
            });
        }
    );
};

export const fetchPostData = ({ bearer, url }) => dispatch => {
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
                type: constants.GET_POST_DATA,
                payload: body
            });
        }
    );
};

export const fetchVideoComments = ({
    bearer,
    id,
    nextPageToken,
    page
}) => dispatch => {
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
            });
        }
    );
};

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
            });
        }
    );
};

export const setCurrentVideoTime = time => dispatch => {
    dispatch({
        type: constants.SET_CURRENT_VIDEO_TIME,
        payload: {
            time
        }
    });
};

export const setDuration = ({ duration }) => dispatch => {
    dispatch({
        type: constants.SET_DURATION,
        payload: duration
    });
};

export const unsetComment = () => dispatch => {
    dispatch({
        type: constants.UNSET_COMMENT
    });
};