import { combineReducers } from "redux"
import { loadingBarReducer } from "react-redux-loading-bar"
import about from "redux/reducers/about"
import archives from "components/archivesList/v1/reducer"
import fallacy from "redux/reducers/fallacy"
import fallacyComments from "components/comments/v1/reducer"
import fallacyForm from "components/fallacyForm/v1/reducer"
import fallacies from "components/fallaciesList/v1/reducer"
import feed from "components/feed/v1/reducer"
import home from "redux/reducers/home"
import newsFeed from "redux/reducers/feed"
import page from "redux/reducers/page"
import pageUser from "redux/reducers/user"
import post from "redux/reducers/post"
import search from "redux/reducers/search"
import searchResults from "components/searchResults/v1/reducer"
import tag from "redux/reducers/tag"
import target from "redux/reducers/target"
import tweet from "components/tweet/v1/reducer"
import tweetList from "components/tweetList/v1/reducer"
import user from "components/authentication/v1/reducer"
import video from "components/youTubeVideo/v1/reducer"
import videoList from "components/videoList/v1/reducer"

export default combineReducers({
	about,
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
	tweet,
	tweetList,
	user,
	video,
	videoList
})
