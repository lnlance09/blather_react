import * as constants from "./constants"

const initial = () => ({
	loadingMore: true
})

const feed = (state = initial(), action) => {
	switch (action.type) {
		case constants.GET_FEED:
			const { count } = action.payload
			const results =
				action.payload.page > 0
					? [...state.results, ...action.payload.results]
					: action.payload.results

			let lastId = false
			if (count > 0) {
				lastId = action.payload.page === 0 ? parseInt(results[0]["id"], 10) : state.lastId
			}

			return {
				...state,
				count,
				hasMore: action.payload.hasMore,
				lastId,
				loadingMore: false,
				page: action.payload.page,
				pages: action.payload.pages,
				results
			}

		case constants.GET_FEED_UPDATES:
			const _results = [...action.payload.results, ...state.results]

			let _lastId = false
			if (action.payload.count > 0) {
				_lastId = _results[0]["id"]
			}

			return {
				...state,
				lastId: _lastId,
				loadingMore: false,
				results: _results
			}

		case constants.TOGGLE_LOADING_MORE:
			return {
				...state,
				loadingMore: !state.loadingMore
			}

		default:
			return state
	}
}

export default feed
