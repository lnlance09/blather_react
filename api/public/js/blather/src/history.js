import { createBrowserHistory } from "history"
import ReactGA from "react-ga"

ReactGA.initialize("UA-62744772-1")

const history = createBrowserHistory()
history.listen(location => {
	ReactGA.pageview(window.location.pathname + window.location.search)
})
export default history
