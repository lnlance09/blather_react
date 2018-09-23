import * as constants from "./constants";
import request from "request";

export const fetchSearchResults = ({
    bearer,
    fallacies,
    network,
    nextPageToken,
    page,
    q,
    type
}) => dispatch => {
    request.get(
        `${window.location.origin}/api/search/advanced`,
        {
            headers: {
                Authorization: bearer
            },
            json: true,
            qs: {
                fallacies,
                network,
                nextPageToken,
                page,
                q,
                type
            }
        },
        function(err, response, body) {
            dispatch({
                type: constants.GET_SEARCH_RESULTS,
                payload: body
            });
        }
    );
};