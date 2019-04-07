import * as constants from "../constants"

const initial = () => ({})

const page = (state = initial(), action) => {
	const payload = action.payload
	switch (action.type) {
		case constants.GET_PAGE_DATA:
			if (payload.error) {
				return {
					...state,
					error: payload.error,
					errorCode: payload.code,
					exists: false
				}
			}

			const review = payload.review
			const reviewCount = parseInt(review.count, 10)
			const sincerityNo = review.sincerity_no === null ? 0 : parseInt(review.sincerity_no, 10)
			const turingTestNo =
				review.turing_test_no === null ? 0 : parseInt(review.turing_test_no, 10)
			const sincerityYes = parseInt(reviewCount - sincerityNo, 10)
			const turingTestYes = parseInt(reviewCount - turingTestNo, 10)

			return {
				...state,
				about: payload.data.about,
				dbId: parseInt(payload.data.id, 10),
				error: false,
				errorCode: 0,
				exists: true,
				externalUrl: payload.data.external_url,
				id:
					payload.data.type === "youtube"
						? payload.data.social_media_id
						: parseInt(payload.data.social_media_id, 10),
				img: payload.data.profile_pic,
				name: payload.data.name,
				network: payload.data.type,
				sincerity: {
					count: reviewCount,
					yes: sincerityYes,
					no: sincerityNo
				},
				turingTest: {
					count: reviewCount,
					yes: turingTestYes,
					no: turingTestNo
				},
				username: payload.data.username
			}

		case constants.GET_PAGE_POSTS:
			if (payload.error) {
				let data = []
				if (payload.type === 101) {
					data = [{}, {}, {}, {}, {}]
				}
				return {
					...state,
					posts: {
						...state.posts,
						count: 0,
						data: data,
						error: true,
						errorMsg: payload.error,
						errorType: payload.type,
						loading: false
					}
				}
			}

			const data =
				payload.page > 0 ? [...state.posts.data, ...payload.posts.data] : payload.posts.data
			return {
				...state,
				posts: {
					count: payload.posts.count,
					data: data,
					error: false,
					errorMsg: "",
					hasMore: payload.posts.hasMore,
					loading: false,
					lastId: payload.posts.lastId,
					nextPageToken: payload.posts.nextPageToken
				}
			}

		case constants.SET_FALLACY_COUNT:
			return {
				...state,
				fallacyCount: payload.count
			}

		default:
			return state
	}
}

export default page
