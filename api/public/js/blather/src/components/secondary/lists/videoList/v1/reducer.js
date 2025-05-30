import * as constants from "./constants"

const initial = () => ({})

const videoList = (state = initial(), action) => {
	const payload = action.payload

	switch (action.type) {
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
						data,
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
					data,
					error: false,
					errorMsg: "",
					hasMore: payload.posts.hasMore,
					loading: false,
					lastId: payload.posts.lastId,
					nextPageToken: payload.posts.nextPageToken
				}
			}

		case constants.SEARCH_VIDEOS_BY_TEXT:
			if (payload.timed_out) {
				let data = []
				return {
					...state,
					posts: {
						...state.posts,
						count: 0,
						data,
						error: true,
						errorMsg: true,
						errorType: "There was an error",
						loading: false
					}
				}
			}

			const hits =
				payload.page > 0 ? [...state.posts.data, ...payload.hits.hits] : payload.hits.hits
			return {
				...state,
				posts: {
					count: payload.hits.total.value,
					data: hits,
					error: false,
					errorMsg: "",
					hasMore: payload.hits.hits.length === 50,
					loading: false
				}
			}

		default:
			return state
	}
}

export default videoList
