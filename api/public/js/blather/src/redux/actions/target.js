import * as constants from "../constants"
import request from "request"
import { showLoading, hideLoading } from "react-redux-loading-bar"

export const changeSincerity = ({ value }) => dispatch => {
	dispatch({
		payload: value,
		type: constants.CHANGE_SINCERITY
	})
}

export const changeSincerityExplanation = ({ value }) => dispatch => {
	dispatch({
		payload: value,
		type: constants.CHANGE_SINCERITY_EXPLANATION
	})
}

export const changeSummary = ({ value }) => dispatch => {
	dispatch({
		payload: value,
		type: constants.CHANGE_SUMMARY
	})
}

export const changeTuring = ({ value }) => dispatch => {
	dispatch({
		payload: value,
		type: constants.CHANGE_TURING
	})
}

export const changeTuringExplanation = ({ value }) => dispatch => {
	dispatch({
		payload: value,
		type: constants.CHANGE_TURING_EXPLANATION
	})
}

export const fetchPage = id => dispatch => {
	dispatch(showLoading())

	request.get(
		`${window.location.origin}/api/pages/getPageByDbId`,
		{
			json: true,
			qs: {
				id
			}
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.FETCH_PAGE
			})

			dispatch(hideLoading())
		}
	)
}

export const fetchReview = ({ pageId, userId }) => dispatch => {
	dispatch(showLoading())

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
				payload: body,
				type: constants.FETCH_REVIEW
			})

			dispatch(hideLoading())
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
	let sincerityAnswer = sincerity
	if (sincerity) {
		sincerityAnswer = 1
	}
	if (sincerity === false) {
		sincerityAnswer = "0"
	}

	let turingTestAnswer = turingTest
	if (turingTest) {
		turingTestAnswer = 1
	}
	if (turingTest === false) {
		turingTestAnswer = "0"
	}
	request.post(
		`${window.location.origin}/api/fallacies/updateReview`,
		{
			form: {
				id,
				sincerity: sincerityAnswer,
				sincerityExplanation,
				summary,
				turingTest: turingTestAnswer,
				turingTestExplanation
			},
			headers: {
				Authorization: bearer
			},
			json: true
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.SAVE_REVIEW
			})
		}
	)
}
