import * as constants from "./constants"

const initial = () => ({})

const test = (state = initial(), action) => {
	switch (action.type) {
		case constants.GET_FALLACIES:
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

		case constants.GET_TARGETS:
			const targets =
				action.payload.page > 0
					? [...state.targets.results, ...action.payload.targets]
					: action.payload.targets
			return {
				...state,
				targets: {
					count: action.payload.targets.length,
					hasMore: action.payload.hasMore,
					loadingMore: false,
					page: action.payload.page,
					pages: action.payload.pages,
					results: targets
				}
			}

		default:
			return state
	}
}

export default test
