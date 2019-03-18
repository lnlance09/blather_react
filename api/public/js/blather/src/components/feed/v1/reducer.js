import * as constants from "./constants"

const initial = () => ({})

const test = (state = initial(), action) => {
	switch (action.type) {
		case constants.GET_FEED:
			const results =
				action.payload.page > 0
					? [...state.results, ...action.payload.results]
					: action.payload.results
			return {
				...state,
				count: action.payload.count,
				hasMore: action.payload.hasMore,
				loadingMore: false,
				page: action.payload.page,
				pages: action.payload.pages,
				results
			}

		default:
			return state
	}
}

export default test
