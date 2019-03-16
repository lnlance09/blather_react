import * as constants from "./constants"
import request from "request"

export const fetchVideoArchives = ({ bearer, id }) => dispatch => {
    request.get(
        `${window.location.origin}/api/youtube/getVideoArchives`,
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
                type: constants.FETCH_VIDEO_ARCHIVES,
                payload: body
            })
        }
    )
}

export const updateArchiveDescription = val => dispatch => {
    dispatch({
        type: constants.UPDATE_ARCHIVE_DESCRIPTION,
        val
    })
}

export const updateArchiveEndTime = val => dispatch => {
    dispatch({
        type: constants.UPDATE_ARCHIVE_END_TIME,
        val
    })
}

export const updateArchiveStartTime = val => dispatch => {
    dispatch({
        type: constants.UPDATE_ARCHIVE_START_TIME,
        val
    })
}
