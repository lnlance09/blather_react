import { DisplayMetaTags } from "utils/metaFunctions"
import { mostFallacious } from "redux/actions/feed"
import { Provider, connect } from "react-redux"
import { Container } from "semantic-ui-react"
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

	componentDidMount() {
		this.props.mostFallacious()
	}

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
	mostFallacious: PropTypes.func,
	results: PropTypes.array
}

NewsFeed.defaultProps = {
	mostFallacious,
	results: []
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.newsFeed,
		...ownProps
	}
}

export default connect(mapStateToProps, {
	mostFallacious
})(NewsFeed)
