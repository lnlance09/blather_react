import * as constants from "./constants";
import request from "request";

export const getFallacies = ({
    assignedBy,
    assignedTo,
    commentId,
    fallacies,
    network,
    objectId,
    page
}) => dispatch => {
    request.get(
        `${window.location.origin}/api/fallacies/search`,
        {
            json: true,
            qs: {
                assignedBy,
                assignedTo,
                commentId,
                fallacies,
                network,
                objectId,
                page
            }
        },
        function(err, response, body) {
            dispatch({
                type: constants.GET_FALLACIES,
                payload: body
            });
        }
    );
};