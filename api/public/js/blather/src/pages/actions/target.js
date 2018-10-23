import * as constants from "../constants"
import request from "request"

export const changeSincerity = ({ value }) => dispatch => {
	dispatch({
		type: constants.CHANGE_SINCERITY,
		payload: value
	})
}

export const changeSincerityExplanation = ({ value }) => dispatch => {
	dispatch({
		type: constants.CHANGE_SINCERITY_EXPLANATION,
		payload: value
	})
}

export const changeSummary = ({ value }) => dispatch => {
	dispatch({
		type: constants.CHANGE_SUMMARY,
		payload: value
	})
}

export const changeTuring = ({ value }) => dispatch => {
	dispatch({
		type: constants.CHANGE_TURING,
		payload: value
	})
}

export const changeTuringExplanation = ({ value }) => dispatch => {
	dispatch({
		type: constants.CHANGE_TURING_EXPLANATION,
		payload: value
	})
}

export const fetchReview = ({ pageId, userId }) => dispatch => {
	request.get(
		`${window.location.origin}/api/fallacies/getReview`,
		{
			json: true,
			qs: {
				pageId,
				userId
			}
		},
		function(err, response, body) {
			dispatch({
				type: constants.FETCH_REVIEW,
				payload: body
			})
		}
	)
}

export const saveReview = ({
	bearer,
	id,
	sincerity,
	sincerityExplanation,
	summary,
	turingTest,
	turingTestExplanation
}) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/updateReview`,
		{
			form: {
				id,
				sincerity: sincerity ? 1 : 0,
				sincerityExplanation,
				summary,
				turingTest: turingTest ? 1 : 0,
				turingTestExplanation
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				type: constants.SAVE_REVIEW,
				payload: body
			})
		}
	)
}
