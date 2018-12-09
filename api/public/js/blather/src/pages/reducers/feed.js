import * as constants from "../constants"

const initial = () => ({})

const tag = (state = initial(), action) => {
	switch (action.type) {
		case constants.MOST_FALLACIOUS:
			return {
				...state,
				results: action.payload.results
			}
		default:
			return state
	}
}

export default tag
