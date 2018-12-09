import "pages/css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { mostFallacious } from "pages/actions/feed"
import { Provider, connect } from "react-redux"
import { Link } from "react-router-dom"
import { Card, Container, Feed, Grid, Header, Responsive } from "semantic-ui-react"
import ImagePic from "images/image-square.png"
import FeedComponent from "components/feed/v1/"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class NewsFeed extends Component {
	constructor(props) {
		super(props)
		this.state = {}

		this.props.mostFallacious()
	}

	render() {
		const RenderMostFallacious = props =>
			props.results.map((result, i) => {
				return (
					<Feed.Event key={`mostFallacious_${i}`}>
						<Feed.Label
							image={result.profile_pic}
							onError={i => (i.target.src = ImagePic)}
						/>
						<Feed.Content>
							<Feed.Summary>
								<Link
									to={`/pages/${result.network}/${
										result.network === "twitter"
											? result.username
											: result.page_id
									}`}
								>
									{result.name}
								</Link>
							</Feed.Summary>
							<Feed.Meta>
								<Feed.Like>{result.count} fallacies</Feed.Like>
							</Feed.Meta>
						</Feed.Content>
					</Feed.Event>
				)
			})

		const TopCard = props => (
			<Card fluid>
				<Card.Content>
					<Card.Header>Most Fallacious</Card.Header>
				</Card.Content>
				<Card.Content>
					<Feed>{RenderMostFallacious(props)}</Feed>
				</Card.Content>
			</Card>
		)

		return (
			<Provider store={store}>
				<div className="feedPage">
					<DisplayMetaTags page="feed" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container className="mainContainer">
						<Header as="h1" dividing>
							Activity
						</Header>
						<Responsive maxWidth={1024}>
							<Grid>
								<Grid.Row>{TopCard(this.props)}</Grid.Row>
								<Grid.Row>
									<FeedComponent size="small" />
								</Grid.Row>
							</Grid>
						</Responsive>

						<Responsive minWidth={1025}>
							<Grid>
								<Grid.Column width={12}>
									<FeedComponent />
								</Grid.Column>
								<Grid.Column width={4}>{TopCard(this.props)}</Grid.Column>
							</Grid>
						</Responsive>
					</Container>
					<PageFooter />
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
	mostFallacious: mostFallacious,
	results: []
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.newsFeed,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{
		mostFallacious
	}
)(NewsFeed)
