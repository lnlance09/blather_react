import * as constants from "../constants"
import request from "request"

export const getHitList = () => dispatch => {
	request.get(
		`${window.location.origin}/api/pages/getAllStars`,
		{
			json: true
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.GET_HIT_LIST
			})
		}
	)
}

export const getPostFromUrl = ({ bearer, url }) => dispatch => {
	request.post(
		`${window.location.origin}/api/fallacies/parseUrl`,
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
				payload: body,
				type: constants.GET_POST_FROM_URL
			})
		}
	)
}

export const getTweetsForAssignment = () => dispatch => {
	request.get(
		`${window.location.origin}/api/home/getTweetsForAssignment`,
		{
			json: true
		},
		function(err, response, body) {
			dispatch({
				payload: body,
				type: constants.GET_TWEETS_FOR_ASSIGNMENT
			})
		}
	)
}
