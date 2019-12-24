import { getPostFromUrl } from "redux/actions/home"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import { DisplayMetaTags } from "utils/metaFunctions"
import { translateToShit } from "utils/textFunctions"
import {
	Button,
	Container,
	Divider,
	Form,
	Grid,
	Header,
	Icon,
	Input,
	List,
	Message,
	Segment,
	TextArea
} from "semantic-ui-react"
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
			text: "",
			translation: "",
			type: null,
			url,
			user
		}

		this.handleHoverOn = this.handleHoverOn.bind(this)
		this.onPaste = this.onPaste.bind(this)
	}

	componentDidMount() {
		const qs = queryString.parse(this.props.location.search)
		const url = qs.url
		this.setState({ url }, () => {
			this.props.getPostFromUrl({
				bearer: this.state.bearer,
				url
			})
		})
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

	onChangeText = (e, { value }) => {
		this.setState({ text: value })
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

	translate = text => {
		const translation = translateToShit(text)
		this.setState({ translation })
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
			text,
			translation,
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
					<div className="assignContainer">
						<Container className="mainContainer" textAlign="left">
							<Header as="h1" className="heroHeader">
								Assign a Logical Fallacy
							</Header>
							<Segment basic className="heroSegment">
								<Input
									className="heroInput"
									fluid
									icon="twitter"
									iconPosition="left"
									inverted
									onKeyUp={this.onKeyUp}
									onPaste={this.onPaste}
									placeholder="Paste a link to a Tweet"
									size="large"
									value={url}
								/>

								<Divider inverted section />

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

										<Divider inverted section />

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
						</Container>
					</div>

					<div className="competitionContainer">
						<Container>
							<Header size="huge">What is Blather?</Header>

							<p>
								Blather is a website that lets users assign logical fallacies and
								analyze the logic and reasoning of claims made on social media. You
								can use it to make memes out of tweets and sharpen your critical
								thinking skills too.
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
									Tweets can be used to show how they contradict other tweets but
									they have to be from the same account.
								</List.Item>
								<List.Item>
									Learn to understand what the fallacy actually is and how it's
									used before assigning it.
								</List.Item>
							</List>

							<Header>Examples</Header>

							<List bulleted>
								{this.props.examples.map((e, i) => (
									<List.Item key={`fallacyItem${i}`}>
										<Link to={`/fallacies/${e.link}`}>{e.text}</Link>
									</List.Item>
								))}
								<List.Item>
									<Link to="/activity">See more examples</Link>
								</List.Item>
							</List>
						</Container>

						<Divider hidden />

						<Container>
							<Header icon size="huge" textAlign="center">
								<Icon color="red" name="translate" />
								Translator
								<Header.Subheader>
									Take your tweets to the next level
								</Header.Subheader>
							</Header>
						</Container>

						<div className="translationContainer">
							<Container>
								<Segment vertical>
									<Form inverted size="small">
										<Grid columns="equal" stackable>
											<Grid.Row textAlign="center">
												<Grid.Column>
													<TextArea
														onChange={this.onChangeText}
														placeholder="Enter text here"
														rows={10}
														value={text}
													/>
												</Grid.Column>
												<Grid.Column>
													<TextArea
														disabled
														placeholder=""
														rows={10}
														value={translation}
													/>
												</Grid.Column>
											</Grid.Row>
										</Grid>
										<Divider hidden />
										<Button
											color="red"
											fluid
											onClick={() => this.translate(text)}
										>
											Translate
										</Button>
									</Form>
								</Segment>
							</Container>
						</div>

						<Container style={{ marginTop: "12px" }}>
							<List size="large">
								<List.Item>
									<List.Icon color="green" name="checkmark" />{" "}
									<List.Content>
										<List.Header>
											Capitalizes random words for no apparent reason
										</List.Header>
									</List.Content>
								</List.Item>
								<List.Item>
									<List.Icon color="green" name="checkmark" />{" "}
									<List.Content>
										<List.Header>
											Omits periods so that it's not clear where one sentence
											ends and another one begins
										</List.Header>
									</List.Content>
								</List.Item>
								<List.Item>
									<List.Icon color="green" name="checkmark" />
									<List.Content>
										<List.Header>
											Deliberately misuses the following words so that your
											comments will have that authentic Trumpanzee feel
										</List.Header>
										<List.List>
											<List.Item>
												<List.Content>
													<List.Header>
														<i>"you're"</i> and <i>"your"</i>
													</List.Header>
												</List.Content>
											</List.Item>
											<List.Item>
												<List.Content>
													<List.Header>
														<i>"to"</i>, <i>"too"</i>, and <i>"two"</i>
													</List.Header>
												</List.Content>
											</List.Item>
											<List.Item>
												<List.Content>
													<List.Header>
														<i>"there"</i>, <i>"their"</i>, and{" "}
														<i>"they're"</i>
													</List.Header>
												</List.Content>
											</List.Item>
											<List.Item>
												<List.Content>
													<List.Header>
														<i>"it's"</i> and <i>"its"</i>
													</List.Header>
												</List.Content>
											</List.Item>
											<List.Item>
												<List.Content>
													<List.Header>
														<i>"could have"</i> and <i>"could of"</i>
													</List.Header>
												</List.Content>
											</List.Item>
										</List.List>
									</List.Content>
								</List.Item>
							</List>
						</Container>
					</div>

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
