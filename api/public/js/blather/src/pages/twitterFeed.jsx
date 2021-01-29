import { DisplayMetaTags } from "utils/metaFunctions"
import { Provider } from "react-redux"
import { Header } from "semantic-ui-react"
import DefaultLayout from "layouts"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import TweetList from "components/secondary/lists/tweetList/v1/"

class TwitterFeed extends Component {
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
						<Header as="h1" inverted>
							Tales from the grift
							<Header.Subheader>
								Almost everything here will be fallacious
							</Header.Subheader>
						</Header>
						<TweetList assignable history={this.props.history} useList />
					</DefaultLayout>
				</div>
			</Provider>
		)
	}
}

TwitterFeed.propTypes = {
	results: PropTypes.array
}

TwitterFeed.defaultProps = {
	results: []
}

export default TwitterFeed
