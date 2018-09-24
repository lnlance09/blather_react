import * as constants from "./constants"

export const setData = param => ({
	type: constants.SET_DATA,
	payload: param
})

export const fetchData = () => (dispatch, getState) => {
	const payload = {
		param: getState().test.param
	}

	return fetch("/_controller/action", payload)
		.then(response => response.json())
		.then(json => dispatch(setData(json)))
}

export const startWidget = () => dispatch => {
	dispatch(fetchData())
}
