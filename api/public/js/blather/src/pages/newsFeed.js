import "pages/css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { mostFallacious } from "pages/actions/feed"
import { Provider, connect } from "react-redux"
import { Link } from "react-router-dom"
import { FacebookShareButton, RedditShareButton, TwitterShareButton } from "react-share"
import {
	Card,
	Container,
	Divider,
	Feed,
	Grid,
	Header,
	Icon,
	Label,
	List,
	Responsive,
	Segment
} from "semantic-ui-react"
import ImagePic from "images/images/image-square.png"
import FeedComponent from "components/feed/v1/"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
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

		this.props.mostFallacious()
	}

	componentDidMount() {}

	render() {
		const { auth } = this.state

		const Contradictions = props =>
			props.contradictions.map((result, i) => (
				<Card
					className="pickOneSegment"
					fluid
					onClick={() => props.history.push(`/tags/${result.tagId}`)}
				>
					<Card.Content>
						<Responsive maxWidth={1024}>
							<Header color="red" size="medium">
								{result.text[0]}
							</Header>
							<Header color="green" size="medium">
								{result.text[1]}
							</Header>
						</Responsive>

						<Responsive minWidth={1025}>
							<Grid columns={2} relaxed="very" stackable>
								<Grid.Column textAlign="center" verticalAlign="middle">
									<Header color="red" size="medium">
										{result.text[0]}
									</Header>
								</Grid.Column>
								<Grid.Column textAlign="center" verticalAlign="middle">
									<Header color="green" size="medium">
										{result.text[1]}
									</Header>
								</Grid.Column>
							</Grid>
							<Divider vertical>Or</Divider>
						</Responsive>
					</Card.Content>
				</Card>
			))

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
								<Grid.Row className="feedRow">
									<Segment>
										<Header as="h1">Pick one</Header>
										<Label as="a" attached="top right" color="red">
											Conservative Edition
										</Label>

										{Contradictions(this.props)}
										<Header as="h1">Activity</Header>
										<FeedComponent history={this.props.history} size="small" />
									</Segment>
								</Grid.Row>
							</Grid>
						</Responsive>

						<Responsive minWidth={1025}>
							<Grid className="feedGrid">
								<Grid.Column width={12}>
									<Segment>
										<Header as="h1">Pick One</Header>
										<Label as="a" attached="top right" color="red">
											Conservative Edition
										</Label>

										{Contradictions(this.props)}
										<Header as="h1">Activity</Header>
										<FeedComponent history={this.props.history} />
									</Segment>
								</Grid.Column>
								<Grid.Column width={4}>
									{InfoCard(this.props)}
									{TopCard(this.props)}
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
	contradictions: PropTypes.array,
	mostFallacious: PropTypes.func,
	results: PropTypes.array
}

NewsFeed.defaultProps = {
	contradictions: [
		{
			key: "82",
			text: ["Democrats are the party of the KKK", "Democrats hate white people"],
			tagId: "82"
		},
		{
			key: "58",
			text: ["Obama was deporter-in-chief", "Obama was an open borders marxist!"],
			tagId: "58"
		},
		{
			key: "95",
			text: [
				"Private companies have the right to refuse service",
				"YouTube must host my content according to my rules!"
			],
			tagId: "95"
		},
		{
			key: "155",
			text: [
				"How can Trump be a fascist if he has Jewish relatives?",
				"Even though George Soros is Jewish, he’s still a nazi!"
			],
			tagId: "155"
		},
		{
			key: "118",
			text: ["Innocent until proven guilty", "#LockHerUp"],
			tagId: "118"
		},
		{
			key: "146",
			text: ["Tolerant liberals are boycotting Chik-fil-a", "Boycott the NFL!"],
			tagId: "146"
		},
		{
			key: "112",
			text: [
				"Libtards refuse to accept basic biology",
				"Jesus lived, died, and then rose from the dead"
			],
			tagId: "112"
		},
		{
			key: "117",
			text: ["Fuck victim culture", "Conservative is the new gay"],
			tagId: "117"
		},
		{
			key: "194",
			text: ["Europe is a socialist shit hole", "Scandinavia is capitalist"],
			tagId: "194"
		},
		{
			key: "120",
			text: ["No one cares what celebrities think", "Kanye is a free thinker"],
			tagId: "120"
		},
		{
			key: "179",
			text: [
				"The constitution must be preserved at all costs",
				"Get rid of the 14th amendment"
			],
			tagId: "179"
		},
		{
			key: "1",
			text: ["Sanctimonious virtue signaling", "Nike will never get another cent from me"],
			tagId: "1"
		},
		{
			key: "110",
			text: [
				"Gun control doesn’t work because criminals don’t obey laws",
				"Making abortion illegal means that no one will get them"
			],
			tagId: "110"
		},
		{
			key: "62",
			text: ["Taxation is theft", "Illegal aliens aren’t paying taxes"],
			tagId: "62"
		},
		{
			key: "50",
			text: [
				"Stay in your own country and fix your own problems there",
				"If you don’t like your country, then leave!"
			],
			tagId: "50"
		},
		{
			key: "113",
			text: [
				"Immigrants are stealing Americans’ jobs",
				"Immigrants are lazy and collect welfare"
			],
			tagId: "113"
		}
	],
	mostFallacious,
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
