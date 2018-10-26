import { createBrowserHistory } from "history"
import ReactGA from "react-ga"

const history = createBrowserHistory()
history.listen(function(location) {
	ReactGA.initialize("UA-62744772-1")
	ReactGA.pageview(window.location.pathname + window.location.search)
})
export default history
