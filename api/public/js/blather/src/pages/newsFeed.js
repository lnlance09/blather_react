import { DisplayMetaTags } from "utils/metaFunctions"
import { mostFallacious } from "redux/actions/feed"
import { Provider, connect } from "react-redux"
import { Link } from "react-router-dom"
import { FacebookShareButton, RedditShareButton, TwitterShareButton } from "react-share"
import {
	Card,
	Container,
	Divider,
	Feed,
	Grid,
	Icon,
	List,
	Responsive,
	Segment
} from "semantic-ui-react"
import ImagePic from "images/images/image-square.png"
import FeedComponent from "components/secondary/feed/v1/"
import PageFooter from "components/primary/footer/v1/"
import PageHeader from "components/secondary/header/v1/"
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
		const { auth } = this.state

		const InfoCard = props => (
			<Segment>
				<List className="topList" relaxed size="large">
					<List.Item onClick={() => props.history.push("/assign")}>
						<List.Icon color="green" name="plus" />
						<List.Content>Assign a fallacy</List.Content>
					</List.Item>
					{!auth && (
						<List.Item onClick={() => props.history.push("/signin?type=signin")}>
							<List.Icon color="blue" name="sign in" />
							<List.Content>Sign In</List.Content>
						</List.Item>
					)}
				</List>
				<Divider />
				<List className="topList" relaxed size="small">
					<List.Item>
						<TwitterShareButton
							title="Home - Blather"
							url={`${window.location.origin}`}
						>
							<Icon className="twitterIcon" name="twitter" /> Share on Twitter
						</TwitterShareButton>
					</List.Item>
					<List.Item>
						<FacebookShareButton url={window.location.href}>
							<Icon className="facebookIcon" name="facebook" /> Share on Facebook
						</FacebookShareButton>
					</List.Item>
					<List.Item>
						<RedditShareButton url={`${window.location.origin}`}>
							<Icon className="redditIcon" name="reddit" /> Share on Reddit
						</RedditShareButton>
					</List.Item>
				</List>
			</Segment>
		)

		const RenderMostFallacious = props =>
			props.results.map((result, i) => (
				<Feed.Event className="feedEvent" key={`mostFallacious_${i}`}>
					<Feed.Label
						image={result.profile_pic}
						onError={i => (i.target.src = ImagePic)}
					/>
					<Feed.Content>
						<Feed.Summary>
							<Link
								to={`/pages/${result.type}/${
									result.type === "twitter" ? result.username : result.page_id
								}`}
							>
								{result.name}
							</Link>
						</Feed.Summary>
						<Feed.Meta>
							<Feed.Like
								onClick={() =>
									this.props.history.push(
										`/pages/${result.type}/${
											result.type === "twitter"
												? result.username
												: result.page_id
										}`
									)
								}
							>
								{result.count} fallacies
							</Feed.Like>
						</Feed.Meta>
					</Feed.Content>
				</Feed.Event>
			))

		const TopCard = props => (
			<Card fluid>
				<Card.Content>
					<Card.Header>Most Fallacious</Card.Header>
				</Card.Content>
				<Card.Content>
					<Feed className="mostFallacious">{RenderMostFallacious(props)}</Feed>
				</Card.Content>
			</Card>
		)

		const BlogsCard = (
			<Card fluid>
				<Card.Content>
					<Card.Header>Good Sources</Card.Header>
				</Card.Content>
				<Card.Content>
					<List relaxed>
						<List.Item>
							<a
								href="https://rationalwiki.org/"
								rel="noopener noreferrer"
								target="_blank"
							>
								RationalWiki
							</a>
						</List.Item>
						<List.Item>
							<a
								href="https://www.theseventhdegree.net/"
								rel="noopener noreferrer"
								target="_blank"
							>
								The Seventh Degree
							</a>
						</List.Item>
						<List.Item>
							<a
								href="https://medium.com/@mboedy"
								rel="noopener noreferrer"
								target="_blank"
							>
								Matthew Boedy
							</a>
						</List.Item>
						<List.Item>
							<a
								href="https://www.facebook.com/adam.bates.9216"
								rel="noopener noreferrer"
								target="_blank"
							>
								Adam Bates
							</a>
						</List.Item>
					</List>
				</Card.Content>
			</Card>
		)

		return (
			<Provider store={store}>
				<div className="feedPage">
					<DisplayMetaTags page="feed" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container className="mainContainer">
						<Responsive maxWidth={1024}>
							<Grid className="feedGrid">
								<Grid.Row>{InfoCard(this.props)}</Grid.Row>
								<Grid.Row>{TopCard(this.props)}</Grid.Row>
								<Grid.Row>{BlogsCard}</Grid.Row>
								<Grid.Row className="feedRow">
									<Segment>
										<FeedComponent history={this.props.history} size="small" />
									</Segment>
								</Grid.Row>
							</Grid>
						</Responsive>

						<Responsive minWidth={1025}>
							<Grid className="feedGrid">
								<Grid.Column width={12}>
									<Segment>
										<FeedComponent history={this.props.history} />
									</Segment>
								</Grid.Column>
								<Grid.Column width={4}>
									{InfoCard(this.props)}
									{TopCard(this.props)}
									{BlogsCard}
								</Grid.Column>
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
