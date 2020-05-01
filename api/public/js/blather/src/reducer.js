import { combineReducers } from "redux"
import { loadingBarReducer } from "react-redux-loading-bar"
import archives from "components/secondary/lists/archivesList/v1/reducer"
import fallacy from "redux/reducers/fallacy"
import fallacyComments from "components/secondary/comments/v1/reducer"
import fallacyForm from "components/secondary/fallacyForm/v1/reducer"
import fallacies from "components/secondary/lists/fallaciesList/v1/reducer"
import feed from "components/secondary/feed/v1/reducer"
import home from "redux/reducers/home"
import newsFeed from "redux/reducers/feed"
import page from "redux/reducers/page"
import pageUser from "redux/reducers/user"
import post from "redux/reducers/post"
import search from "redux/reducers/search"
import searchResults from "components/secondary/searchResults/v1/reducer"
import tag from "redux/reducers/tag"
import target from "redux/reducers/target"
import tweetList from "components/secondary/lists/tweetList/v1/reducer"
import user from "components/secondary/authentication/v1/reducer"
import video from "components/secondary/youTubeVideo/v1/reducer"
import videoList from "components/secondary/lists/videoList/v1/reducer"

export default combineReducers({
	archives,
	fallacies,
	fallacy,
	fallacyComments,
	fallacyForm,
	feed,
	home,
	loadingBar: loadingBarReducer,
	newsFeed,
	page,
	pageUser,
	post,
	search,
	searchResults,
	tag,
	target,
	tweetList,
	user,
	video,
	videoList
})
