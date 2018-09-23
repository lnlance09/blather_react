import * as constants from "./constants";
import request from "request";

export const fetchDiscussions = ({
    page,
    q,
    startedBy,
    status,
    tags,
    withUser
}) => dispatch => {
    request.get(
        `${window.location.origin}/api/discussions/search`,
        {
            json: true,
            qs: {
                page,
                q,
                startedBy,
                status,
                tags,
                withUser
            }
        },
        function(err, response, body) {
            if (!body.error) {
                dispatch({
                    type: constants.GET_DISCUSSIONS,
                    payload: body
                });
            }
        }
    );
};