import { createStore, applyMiddleware, compose } from "redux"
import { loadingBarMiddleware } from "react-redux-loading-bar"
import logger from "redux-logger"
import thunk from "redux-thunk"
import rootReducer from "./reducer"

const initialState = {}

const middleware = [thunk]

const store = createStore(
	rootReducer,
	initialState,
	compose(
		applyMiddleware(...middleware, loadingBarMiddleware(), logger)
	)
)

export default store
