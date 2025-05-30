import * as constants from "../constants"

const initial = () => ({
	loading: true
})

const search = (state = initial(), action) => {
	switch (action.type) {
		case constants.SET_SEARCH_VALUE:
			return {
				...state,
				q: action.value
			}

		default:
			return state
	}
}

export default search
