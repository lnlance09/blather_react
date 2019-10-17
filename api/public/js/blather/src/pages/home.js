import "pages/css/index.css"
import { getPostFromUrl } from "pages/actions/home"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import { DisplayMetaTags } from "utils/metaFunctions"
import { Container, Divider, Header, Icon, Input, List, Message, Segment } from "semantic-ui-react"
import FallacyForm from "components/fallacyForm/v1/"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
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
							<Segment className="heroSegment">
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

						<Divider hidden section />

						<div>
							<Header as="h1">
								<Icon color="red" name="crosshairs" />
								<Header.Content>
									Hit List
									<Header.Subheader>
										We need more ammunition to use against grifters and trolls
									</Header.Subheader>
								</Header.Content>
							</Header>
							<div>
								<p>
									This is a list of unsavory characters that traffic in
									falsehoods, baseless conspiracies, and ideological dogma. For
									many on this list, their presence on social media is part of a
									much larger grift that brings them attention, clicks, and
									opportunities to hawk merchandise to their followers. For
									others, they may sincerely believe the outrageous things that
									they say and social media is simply a tool for validating their
									ideas. Either way, the poor ideas that are echoed by the people
									on this list must be called out and it usually isn't that
									difficult to do.
								</p>
								<Divider hidden />
								<List size="medium">
									{this.props.hitList.map(h => (
										<List.Item key={h.key}>
											<Link to={`/pages/${h.key}`}>{h.name}</Link> -{" "}
											{h.description}
										</List.Item>
									))}
								</List>
							</div>
						</div>

						<Divider hidden section />

						<Header as="h2" icon textAlign="center">
							<Icon color="yellow" name="trophy" />
							Coming soon
							<Header.Subheader>
								A cash reward for the best example of partisanship each month
							</Header.Subheader>
						</Header>
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Home.propTypes = {
	examples: PropTypes.array,
	getPostFromUrl: PropTypes.func,
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
			description: "convicted felon, Christian apologist, and Trump sycophant",
			key: "twitter/dineshdsouza",
			name: "Dinesh D'Souza"
		},
		{
			description: "rabid Trump supporter and conservative pseudo intellectual",
			key: "twitter/kurtschlichter",
			name: "Kurt Schlichter"
		},
		{
			description:
				"alt-right apologist and online talk show host who masquerades as a liberal in an attempt to make his guests' views appear less vile than they truly are",
			key: "twitter/rubinreport",
			name: "Dave Rubin"
		},
		{
			description:
				"scantily clad AOC wannabe who likes to take pictures of herself with assault rifles. She's currently running for congress in Florida",
			key: "twitter/realannapaulina",
			name: "Anna Paulina Luna"
		},
		{
			description:
				"bully and \x22journalist\x22 for InfoWars who siezes every opportunity imaginable to take pictures of herself holding a firearm while dressed in provocative attire",
			key: "twitter/kaitmarieox",
			name: "Kaitlin Bennett"
		},
		{
			description:
				"right-wing YouTuber who copies Dave Rubin's whole shtick of pretending to be a liberal",
			key: "twitter/timcast",
			name: "Tim Pool"
		},
		{
			description:
				"race realist, cult leader, and fringe pseudo intellectual who thinks that black people have smaller brains",
			key: "twitter/stefanmolyneux",
			name: "Stefan Molyneux"
		},
		{
			description:
				"evangelical Christian and anti-abortion activist who regularly compares abortion to genocide",
			key: "twitter/lilagracerose",
			name: "Lila Rose"
		},
		{
			description:
				"a fake university that regurgitates thoroughly debunked right-wing talking points",
			key: "twitter/prageru",
			name: "Prager University"
		},
		{
			description:
				"Canadian \x22comedian\x22 who hawks \x22socialism is for fags\x22 t-shirts online",
			key: "twitter/scrowder",
			name: "Steven Crowder"
		},
		{
			description:
				"the quintessential Fox News barbie babe, she's a vile young woman with a nationally syndicated talk show who likes to scream into the conservative echo chamber",
			key: "twitter/tomilahren",
			name: "Tomi Lahren"
		},
		{
			description: "the poor man's version of Tomi Lahren",
			key: "twitter/liz_wheeler",
			name: "Liz Wheeler"
		},
		{
			description: "alt-lite apologist and nutritional supplement salesman",
			key: "twitter/benshapiro",
			name: "Ben Shapiro"
		},
		{
			description: "batshit crazy conspiracy theorist and Alex Jones protégé",
			key: "twitter/prisonplanet",
			name: "Paul Joseph Watson"
		},
		{
			description:
				"founder of Turning Point USA, an astroturf organization that repackages boomer talking points so that they're more appealing to millenials",
			key: "twitter/charliekirk11",
			name: "Charlie Kirk"
		},
		{
			description: "partisan hack with her own show on Fox News",
			key: "twitter/ingrahamangle",
			name: "Laura Ingraham"
		},
		{
			description:
				"former cop turned hat salesman with a penchant for bootlicking and delivering rants from his car",
			key: "twitter/theofficertatum",
			name: "Brandon Tatum"
		},
		{
			description:
				"self-loathing homophobe who runs a prominent conspiracy theory website called \x22The Gateway Pundit\x22",
			key: "twitter/gatewaypundit",
			name: "Jim Hoft"
		},
		{
			description:
				"evangelical huckster who is the president of a diploma mill called Liberty University",
			key: "twitter/jerryfalwelljr",
			name: "Jerry Falwell Jr."
		}
	],
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
		getPostFromUrl
	}
)(Home)
