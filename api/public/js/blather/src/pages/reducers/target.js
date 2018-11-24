import * as constants from "../constants"

const initial = () => ({})

const target = (state = initial(), action) => {
	const payload = action.payload
	switch (action.type) {
		case constants.CHANGE_SINCERITY:
			return {
				...state,
				sincerity: payload === "yes"
			}
		case constants.CHANGE_SINCERITY_EXPLANATION:
			return {
				...state,
				sincerityExplanation: payload
			}
		case constants.CHANGE_SUMMARY:
			return {
				...state,
				summary: payload
			}
		case constants.CHANGE_TURING:
			return {
				...state,
				turingTest: payload === "yes"
			}
		case constants.CHANGE_TURING_EXPLANATION:
			return {
				...state,
				turingTestExplanation: payload
			}
		case constants.FETCH_REVIEW:
			if (payload.error) {
				return {
					...state,
					error: true
				}
			}

			let link = `/pages/${payload.review.type}/`
			link += payload.review.type === "twitter" ? payload.review.username : payload.review.id
			return {
				...state,
				error: false,
				fallacyCount: payload.fallacyCount,
				id: parseInt(payload.review.id, 10),
				page: {
					id: payload.review.social_media_id,
					link: link,
					name: payload.review.page_name,
					network: payload.review.type,
					pic: payload.review.page_profile_pic,
					username: payload.review.username
				},
				sincerity: parseInt(payload.review.sincerity, 10) === 1,
				sincerityExplanation:
					payload.review.sincerity_explanation === null
						? ""
						: payload.review.sincerity_explanation,
				summary: payload.review.summary === null ? "" : payload.review.summary,
				turingTest: parseInt(payload.review.turing_test, 10) === 1,
				turingTestExplanation:
					payload.review.turing_test_explanation === null
						? ""
						: payload.review.turing_test_explanation,
				user: {
					id: payload.review.user_id,
					name: payload.review.user_name
				}
			}
		case constants.SAVE_REVIEW:
			return {
				...state,
				hasSubmitted: true,
				page: {
					...state.page
				},
				sincerity: parseInt(payload.review.sincerity, 10) === 1,
				sincerityExplanation: payload.review.sincerity_explanation,
				summary: payload.review.summary,
				turingTest: parseInt(payload.review.turing_test, 10) === 1,
				turingTestExplanation: payload.review.turing_test_explanation,
				user: {
					...state.user
				}
			}
		default:
			return state
	}
}

export default target
