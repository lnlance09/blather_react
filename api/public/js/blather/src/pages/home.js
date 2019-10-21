import "pages/css/index.css"
import { getHitList, getPostFromUrl } from "pages/actions/home"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import { DisplayMetaTags } from "utils/metaFunctions"
import {
	Card,
	Container,
	Divider,
	Grid,
	Header,
	Icon,
	Input,
	Label,
	List,
	Message,
	Responsive,
	Segment
} from "semantic-ui-react"
import FallacyForm from "components/fallacyForm/v1/"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PageCard from "components/pageCard/v1/"
import queryString from "query-string"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import Tweet from "components/tweet/v1/"

class Home extends Component {
	constructor(props) {
		super(props)

		const currentState = store.getState()
		const user = currentState.user
		const auth = user.authenticated
		const bearer = user.bearer

		const qs = queryString.parse(this.props.location.search)
		const url = qs.url

		this.state = {
			auth,
			bearer,
			endTime: "",
			fallacyId: "1",
			formVisible: true,
			highlightedText: "IF YOU ARE NOT HAPPY HERE, YOU CAN LEAVE!",
			startTime: "",
			type: null,
			url,
			user
		}

		this.props.getPostFromUrl({
			bearer: this.state.bearer,
			url
		})
		this.props.getHitList()

		this.handleHoverOn = this.handleHoverOn.bind(this)
		this.onKeyUp = this.onKeyUp.bind(this)
		this.onPaste = this.onPaste.bind(this)
	}

	componentDidMount() {}

	componentWillMount(newProps) {
		const qs = queryString.parse(this.props.location.search)
		const url = qs.url
		if (this.state.url !== url) {
			this.setState({ url })
			this.props.getPostFromUrl({
				bearer: this.state.bearer,
				url
			})
		}
	}

	handleHoverOn = e => {
		let text = ""
		if (window.getSelection) {
			text = window.getSelection().toString()
		} else if (document.selection) {
			text = document.selection.createRange().text
		}
		this.setState({ highlightedText: text })
	}

	onKeyUp = e => {
		if (e.keyCode === 8) {
			this.setState({ url: "", videoId: null })
		}
	}

	onPaste = e => {
		const url = e.clipboardData.getData("Text")
		this.setState({ url })
		this.props.getPostFromUrl({
			bearer: this.state.bearer,
			url
		})
	}

	render() {
		const {
			auth,
			bearer,
			endTime,
			fallacyId,
			highlightedText,
			id,
			startTime,
			url,
			user
		} = this.state
		const { info, mediaId, page, type } = this.props
		const validPost = type === "tweet"

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

		return (
			<Provider store={store}>
				<div className="homePage">
					<DisplayMetaTags page="home" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container className="mainContainer" textAlign="left">
						<div>
							<Header as="h1" className="heroHeader">
								Assign a Logical Fallacy
							</Header>
							<Segment basic className="heroSegment">
								<Input
									className="heroInput"
									fluid
									icon="twitter"
									iconPosition="left"
									onKeyUp={this.onKeyUp}
									onPaste={this.onPaste}
									placeholder="Paste a link to a Tweet"
									size="large"
									value={url}
								/>

								{validPost && url !== "" ? (
									<div>
										<div className="postContainer">
											{type === "tweet" && (
												<Tweet
													bearer={bearer}
													created_at={info.created_at}
													displayTextRange={info.display_text_range}
													extended_entities={info.extended_entities}
													externalLink
													highlight={highlightedText !== ""}
													highlightedText={highlightedText}
													full_text={info.full_text}
													handleHoverOn={this.handleHoverOn}
													history={this.props.history}
													id={info.id_str}
													imageSize="medium"
													is_quote_status={info.is_quote_status}
													profileImg={this.props.profileImg}
													quoted_status={
														info.quoted_status === undefined &&
														info.is_quote_status
															? info.retweeted_status
															: info.quoted_status
													}
													quoted_status_id_str={info.quoted_status_id_str}
													quoted_status_permalink={
														info.quoted_status_permalink
													}
													retweeted_status={
														info.retweeted_status === undefined
															? false
															: info.retweeted_status
													}
													stats={{
														favorite_count: info.favorite_count,
														retweet_count: info.retweet_count
													}}
													user={info.user}
												/>
											)}
											{type === "video" && (
												<Message
													content="Link your YouTube account to assign fallacies to videos"
													warning
												/>
											)}
										</div>

										<Divider />
										<FallacyForm
											authenticated={auth}
											bearer={bearer}
											commentId={type === "comment" ? id : null}
											endTime={endTime}
											fallacyId={fallacyId}
											handleSubmit={this.handleSubmit}
											highlightedText={highlightedText}
											history={this.props.history}
											network={this.props.network}
											objectId={mediaId}
											pageInfo={page}
											sendNotification={this.props.sendNotification}
											startTime={startTime}
											type={type}
											useCard={false}
											user={user}
										/>

										{!auth && (
											<Message warning>
												<Message.Content>
													<Message.Header>Sign in</Message.Header>
													This will be assigned anonymously. It is
													recommended that you{" "}
													<Link to="/signin">sign in</Link>.
												</Message.Content>
											</Message>
										)}
									</div>
								) : (
									<Segment padded="very" placeholder>
										<Header icon>
											<Icon className="twitterIcon" name="twitter" />
										</Header>
									</Segment>
								)}
							</Segment>
						</div>
					</Container>
				</div>
				<div className="competitionContainer">
					<Container>
						<Header size="huge">What is Blather?</Header>

						<p>
							Blather is a website that lets users assign logical fallacies and
							analyze the logic and reasoning of claims made on social media. You can
							use it to make memes out of tweets and sharpen your critical thinking
							skills too.
						</p>

						<Header size="medium" textAlign="left">
							Rules
						</Header>

						<List bulleted size="medium">
							<List.Item>
								You can select from{" "}
								<Link to="/fallacies">46 logical fallacies</Link>.
							</List.Item>
							<List.Item>
								If you're assigning a doublethink, keep in mind that sometimes
								people genuinely have a change of heart. Use your own best
								judgement.
							</List.Item>
							<List.Item>
								Tweets can be used to show how they contradict other tweets but they
								have to be from the same account.
							</List.Item>
							<List.Item>
								Learn to understand what the fallacy actually is and how it's used
								before assigning it.
							</List.Item>
						</List>

						<Header size="medium" textAlign="left">
							Examples
						</Header>

						<List bulleted>
							{this.props.examples.map(e => (
								<List.Item>
									<Link to={`/fallacies/${e.link}`}>{e.text}</Link>
								</List.Item>
							))}
							<List.Item>
								<Link to="/activity">See more examples</Link>
							</List.Item>
						</List>
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Home.propTypes = {
	contradictions: PropTypes.array,
	examples: PropTypes.array,
	getHitList: PropTypes.func,
	getPostFromUrl: PropTypes.func,
	hitList: PropTypes.array,
	info: PropTypes.object,
	mediaId: PropTypes.string,
	network: PropTypes.string,
	page: PropTypes.shape({
		id: PropTypes.string,
		name: PropTypes.string,
		username: PropTypes.string
	}),
	type: PropTypes.string
}

Home.defaultProps = {
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
	examples: [
		{
			key: "tomi-lahrens-cheap-appeal-authority-logical-fallacy-305",
			link: "tomi-lahrens-cheap-appeal-authority-logical-fallacy-305",
			text: "Appeal to authority by Tomi Lahren"
		},
		{
			key: "bernie-sanders-tired-ad-populum-bandwagoning-logical-fallacy-241",
			link: "bernie-sanders-tired-ad-populum-bandwagoning-logical-fallacy-241",
			text: "Bandwagoning by Bernie Sanders"
		},
		{
			key: "alley-stuckeys-shameless-circular-reasoning-begging-question-logical-fallacy-472",
			link:
				"alley-stuckeys-shameless-circular-reasoning-begging-question-logical-fallacy-472",
			text: "Begging the question by Allie Beth Stuckey"
		},
		{
			key: "dylan-wheeler-cant-decide-if-hes-a-republican-231",
			link: "dylan-wheeler-cant-decide-if-hes-a-republican-231",
			text: "Doublethink by Dylan Wheeler"
		}
	],
	hitList: [
		{
			loading: true
		},
		{
			loading: true
		},
		{
			loading: true
		}
	],
	getHitList,
	getPostFromUrl,
	info: {},
	page: {}
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.home,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{
		getHitList,
		getPostFromUrl
	}
)(Home)
