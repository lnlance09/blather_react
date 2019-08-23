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

		case constants.FETCH_PAGE:
			return {
				...state,
				error: false,
				fallacyCount: 0,
				hasLoaded: true,
				id: 0,
				page: {
					name: payload.page.name,
					pic: payload.page.profile_pic
				},
				user: {
					id: "0",
					name: "You"
				}
			}

		case constants.FETCH_REVIEW:
			if (payload.error) {
				return {
					...state,
					error: true
				}
			}

			let link = `/pages/${payload.review.type}/`
			link +=
				payload.review.type === "twitter"
					? payload.review.username
					: payload.review.social_media_id
			let sincerity = null
			if (parseInt(payload.review.sincerity, 10) === 1) {
				sincerity = true
			}
			if (parseInt(payload.review.sincerity, 10) === 0) {
				sincerity = false
			}

			let turingTest = null
			if (parseInt(payload.review.turing_test, 10) === 1) {
				turingTest = true
			}
			if (parseInt(payload.review.turing_test, 10) === 0) {
				turingTest = false
			}

			return {
				...state,
				error: false,
				fallacyCount: payload.fallacyCount,
				hasLoaded: true,
				id: parseInt(payload.review.id, 10),
				page: {
					id: payload.review.social_media_id,
					link: link,
					name: payload.review.page_name,
					network: payload.review.type,
					pic: payload.review.page_profile_pic,
					username: payload.review.username
				},
				sincerity: sincerity,
				sincerityExplanation:
					payload.review.sincerity_explanation === null
						? ""
						: payload.review.sincerity_explanation,
				summary: payload.review.summary === null ? "" : payload.review.summary,
				turingTest: turingTest,
				turingTestExplanation:
					payload.review.turing_test_explanation === null
						? ""
						: payload.review.turing_test_explanation,
				user: {
					id: payload.review.user_id,
					img: payload.review.user_pic,
					name: payload.review.user_name,
					username: payload.review.user_username
				}
			}

		case constants.SAVE_REVIEW:
			let sincerityAnswer = null
			if (payload.review.sincerity === "1") {
				sincerityAnswer = true
			}
			if (payload.review.sincerity === "0") {
				sincerityAnswer = false
			}

			let turingTestAnswer = null
			if (payload.review.turing_test === "1") {
				turingTestAnswer = true
			}
			if (payload.review.turing_test === "0") {
				turingTestAnswer = false
			}

			return {
				...state,
				hasSubmitted: true,
				page: {
					...state.page
				},
				sincerity: sincerityAnswer,
				sincerityExplanation: payload.review.sincerity_explanation,
				summary: payload.review.summary,
				turingTest: turingTestAnswer,
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
