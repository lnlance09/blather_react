import * as constants from "../constants";
import request from "request";

export const fetchDiscussion = ({ bearer, id }) => dispatch => {
    request.get(
        `${window.location.origin}/api/discussions`,
        {
            headers: {
                Authorization: bearer
            },
            json: true,
            qs: {
                id
            }
        },
        function(err, response, body) {
            if (!body.error) {
                dispatch({
                    type: constants.GET_DISCUSSION,
                    payload: body
                });
            }
        }
    );
};

export const fetchDiscussionConversation = ({ bearer, id }) => dispatch => {
    request.get(
        `${window.location.origin}/api/discussions/getConversation`,
        {
            headers: {
                Authorization: bearer
            },
            json: true,
            qs: {
                id
            }
        },
        function(err, response, body) {
            dispatch({
                type: constants.GET_DISCUSSION_CONVERSATION,
                payload: body
            });
        }
    );
};

export const removeDiscussionTag = ({
    bearer,
    id,
    tagId,
    tagName
}) => dispatch => {
    request.post(
        `${window.location.origin}/api/discussions/removeTag`,
        {
            form: {
                id,
                tagId
            },
            headers: {
                Authorization: bearer
            },
            json: true
        },
        function(err, response, body) {
            dispatch({
                type: constants.REMOVE_DISCUSSION_TAG,
                payload: {
                    id: tagId,
                    name: tagName
                }
            });
        }
    );
};

export const setTags = ({ value, text }) => dispatch => {
    dispatch({
        type: constants.SET_DISCUSSION_TAGS,
        payload: { text, value }
    });
};

export const submitDiscussion = ({
    bearer,
    description,
    extra,
    id = null,
    tags,
    title
}) => dispatch => {
    request.post(
        `${window.location.origin}/api/discussions/create`,
        {
            form: {
                description,
                extra,
                id,
                tags,
                title
            },
            headers: {
                Authorization: bearer
            },
            json: true
        },
        function(err, response, body) {
            dispatch({
                type: constants.SUBMIT_DISCUSSION,
                payload: body
            });
        }
    );
};

export const submitDiscussionConversation = ({
    bearer,
    id,
    msg,
    status
}) => dispatch => {
    request.post(
        `${window.location.origin}/api/discussions/submitConversation`,
        {
            form: {
                id,
                msg,
                status
            },
            headers: {
                Authorization: bearer
            },
            json: true
        },
        function(err, response, body) {
            dispatch({
                type: constants.SUBMIT_DISCUSSION_CONVERSATION,
                payload: body
            });
        }
    );
};

export const updateDescription = ({ description }) => dispatch => {
    dispatch({
        type: constants.UPDATE_DESCRIPTION,
        payload: {
            description
        }
    });
};

export const updateExtra = ({ extra }) => dispatch => {
    dispatch({
        type: constants.UPDATE_EXTRA,
        payload: {
            extra
        }
    });
};

export const updateDiscussion = ({
    bearer,
    description,
    extra,
    id,
    tags,
    title
}) => dispatch => {
    request.post(
        `${window.location.origin}/api/discussions/update`,
        {
            form: {
                description,
                extra,
                id,
                tags,
                title
            },
            headers: {
                Authorization: bearer
            },
            json: true
        },
        function(err, response, body) {
            dispatch({
                type: constants.UPDATE_DISCUSSION,
                payload: body
            });
        }
    );
};