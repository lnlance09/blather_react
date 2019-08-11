import * as constants from "./constants"

const initial = () => ({
	loadingMore: false
})

const archives = (state = initial(), action) => {
	const payload = action.payload

	switch (action.type) {
		case constants.GET_ARCHIVED_LINKS:
			const archives =
				payload.pagination.page > 0 ? [...state.archives, ...payload.links] : payload.links
			return {
				...state,
				archives,
				count: payload.count,
				hasMore: payload.pagination.hasMore,
				loadingMore: false,
				page: payload.pagination.page
			}

		case constants.TOGGLE_LOADING:
			return {
				...state,
				loadingMore: !state.loadingMore
			}

		default:
			return state
	}
}

export default archives
