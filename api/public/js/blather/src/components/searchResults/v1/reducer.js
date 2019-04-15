import * as constants from "./constants"

const initial = () => ({})

const searchResults = (state = initial(), action) => {
	switch (action.type) {
		case constants.GET_SEARCH_RESULTS:

			const data =
				action.payload.page > 0
					? [...state.data, ...action.payload.results]
					: action.payload.results

			return {
				...state,
				count: action.payload.count,
				data,
				error: action.payload.error,
				hasMore: action.payload.hasMore,
				loading: false,
				nextPageToken: action.payload.nextPageToken,
				page: action.payload.page,
				pages: action.payload.pages
			}

		case constants.REFRESH_YOUTUBE_TOKEN:

			return {
				...state,
				bearer: action.payload.bearer,
				youtubeAccessToken: action.payload.refreshToken
			}

		default:
			return state
	}
}

export default searchResults
