import { combineReducers } from "redux"
import about from "./pages/reducers/about"
import discussion from "./pages/reducers/discussion"
import discussions from "./components/discussionsList/v1/reducer"
import fallacy from "./pages/reducers/fallacy"
import fallacyForm from "./components/fallacyForm/v1/reducer"
import fallacies from "./components/fallaciesList/v1/reducer"
import page from "./pages/reducers/page"
import post from "./pages/reducers/post"
import searchResults from "./components/searchResults/v1/reducer"
import tag from "./pages/reducers/tag"
import user from "./components/authentication/v1/reducer"
import pageUser from "./pages/reducers/user"

export default combineReducers({
	about,
	discussion,
	discussions,
	fallacies,
	fallacy,
	fallacyForm,
	page,
	pageUser,
	post,
	searchResults,
	tag,
	user
})
