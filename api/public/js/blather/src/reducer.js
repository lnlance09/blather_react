import { combineReducers } from "redux"
import about from "pages/reducers/about"
import archives from "components/archivesList/v1/reducer"
import fallacy from "pages/reducers/fallacy"
import fallacyForm from "components/fallacyForm/v1/reducer"
import fallacies from "components/fallaciesList/v1/reducer"
import feed from "components/feed/v1/reducer"
import newsFeed from "pages/reducers/feed"
import page from "pages/reducers/page"
import pageUser from "pages/reducers/user"
import post from "pages/reducers/post"
import search from "pages/reducers/search"
import searchResults from "components/searchResults/v1/reducer"
import tag from "pages/reducers/tag"
import target from "pages/reducers/target"
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
	fallacyForm,
	feed,
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
