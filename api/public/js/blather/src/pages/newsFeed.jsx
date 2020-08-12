import { DisplayMetaTags } from "utils/metaFunctions"
import { Provider } from "react-redux"
import DefaultLayout from "layouts"
import FeedComponent from "components/secondary/feed/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class NewsFeed extends Component {
	constructor(props) {
		super(props)

		const currentState = store.getState()
		const auth = currentState.user.authenticated

		this.state = {
			auth
		}
	}

	componentDidMount() {}

	render() {
		return (
			<Provider store={store}>
				<div className="feedPage">
					<DisplayMetaTags page="feed" props={this.props} state={this.state} />
					<DefaultLayout
						activeItem="home"
						containerClassName="homePage"
						history={this.props.history}
					>
						<FeedComponent history={this.props.history} />
					</DefaultLayout>
				</div>
			</Provider>
		)
	}
}

NewsFeed.propTypes = {
	results: PropTypes.array
}

NewsFeed.defaultProps = {
	results: []
}

export default NewsFeed
