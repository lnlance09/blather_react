import { combineReducers } from "redux"
import about from "pages/reducers/about"
import discussion from "pages/reducers/discussion"
import discussions from "components/discussionsList/v1/reducer"
import fallacy from "pages/reducers/fallacy"
import fallacyForm from "components/fallacyForm/v1/reducer"
import fallacies from "components/fallaciesList/v1/reducer"
import feed from "components/feed/v1/reducer"
import newsFeed from "pages/reducers/feed"
import page from "pages/reducers/page"
import post from "pages/reducers/post"
import searchResults from "components/searchResults/v1/reducer"
import tag from "pages/reducers/tag"
import target from "pages/reducers/target"
import user from "components/authentication/v1/reducer"
import pageUser from "pages/reducers/user"
import video from "components/youTubeVideo/v1/reducer"

export default combineReducers({
	about,
	discussion,
	discussions,
	fallacies,
	fallacy,
	fallacyForm,
	feed,
	newsFeed,
	page,
	pageUser,
	post,
	searchResults,
	tag,
	target,
	user,
	video
})
