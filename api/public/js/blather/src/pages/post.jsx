import { refreshYouTubeToken } from "components/secondary/authentication/v1/actions"
import { formatTime } from "utils/dateFunctions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { fetchPostData } from "redux/actions/post"
import { Provider, connect } from "react-redux"
import {
	Card,
	Container,
	Divider,
	Grid,
	Header,
	Icon,
	Image,
	List,
	Message,
	Responsive,
	Segment
} from "semantic-ui-react"
import { stopWords } from "options/stopWords"
import DefaultLayout from "layouts"
import html2canvas from "html2canvas"
import FallacyForm from "components/secondary/fallacyForm/v1/"
import FallaciesList from "components/secondary/lists/fallaciesList/v1/"
import LazyLoad from "components/primary/lazyLoad/v1/"
import PropTypes from "prop-types"
import queryString from "query-string"
import React, { Component } from "react"
import removeWords from "remove-words"
import store from "store"
import TrumpImg from "images/trump-white.png"
import Tweet from "components/primary/tweet/v1/"
import YouTubeCommentsSection from "components/secondary/youTubeVideo/v1/comments"
import YouTubeVideo from "components/secondary/youTubeVideo/v1/"

class Post extends Component {
	constructor(props) {
		super(props)

		const path = this.props.match.path
		const qs = queryString.parse(this.props.location.search)

		let id = this.props.match.params.id
		if (id.substring(id.length - 1, id.length) === "&") {
			id = id.slice(0, -1)
		}

		let a = ""
		if (qs.a) {
			a = qs.a
		}

		let startTime = "00:00:00"
		if (qs.x) {
			startTime = qs.x
		}

		let endTime = "00:00:00"
		if (qs.y) {
			endTime = qs.y
		}

		const currentState = store.getState()
		const auth = currentState.user.authenticated
		const bearer = currentState.user.bearer
		const { network, type, url } = this.postType(id, path)
		this.state = {
			a,
			auth,
			bearer,
			endTime,
			highlightedText: "",
			id,
			network,
			startTime,
			submitted: false,
			type
		}

		this.props.fetchPostData({
			a,
			bearer,
			url
		})
	}

	componentDidUpdate(prevProps) {
		if (prevProps !== this.props) {
			const qs = queryString.parse(this.props.location.search)
			const path = this.props.match.path
			let id = this.props.match.params.id

			if (id.substring(id.length - 1, id.length) === "&") {
				id = id.slice(0, -1)
			}

			let a = ""
			if (qs.a) {
				a = qs.a
			}

			let startTime = "00:00:00"
			if (qs.x) {
				startTime = qs.x
			}

			let endTime = "00:00:00"
			if (qs.y) {
				endTime = qs.y
			}

			if (this.state.id !== id) {
				const currentState = store.getState()
				const auth = currentState.user.authenticated
				const bearer = currentState.user.bearer
				const { network, type, url } = this.postType(id, path)
				this.setState({
					auth,
					bearer,
					endTime,
					id,
					network,
					startTime,
					type
				})

				this.props.fetchPostData({
					a,
					bearer,
					url
				})
			}

			if (this.state.a !== a) {
				this.setState({ a })
			}
		}
	}

	captureScreenshot = () => {
		const filename = "blather-tweet-screenshot"
		html2canvas(document.getElementById("captureTweet"), {
			allowTaint: false,
			scale: 2,
			useCORS: true
		}).then(canvas => {
			const ctx = canvas.getContext("2d")
			ctx.globalAlpha = 1
			let img = canvas.toDataURL("image/png")
			let link = document.createElement("a")
			link.download =
				filename
					.toLowerCase()
					.split(" ")
					.join("-") + ".png"
			link.href = img
			link.click()
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

	handleSubmit = () => this.setState({ submitted: !this.state.submitted })

	postType(id, path) {
		switch (path) {
			case "/comment/:id":
				return {
					network: "youtube",
					type: "comment",
					url: `youtube/comment?id=${id}`
				}
			case "/tweet/:id":
				return {
					network: "twitter",
					type: "tweet",
					url: `twitter/tweet?id=${id}`
				}
			case "/video/:id":
				return {
					network: "youtube",
					type: "video",
					url: `youtube/video?id=${id}`
				}
			default:
				return false
		}
	}

	setClip = (start, end) => {
		this.setState({
			endTime: formatTime(end),
			startTime: formatTime(start)
		})
	}

	render() {
		const {
			a,
			auth,
			bearer,
			endTime,
			highlightedText,
			id,
			network,
			startTime,
			type
		} = this.state

		const { error, errorCode, info } = this.props

		if (this.props.needToRefresh) {
			this.props.refreshYouTubeToken({
				bearer
			})
			setTimeout(() => {
				window.location.reload()
			}, 1000)
		}

		const tweetExists = error && network === "twitter" ? false : true

		const videoExists = error && errorCode === 404 && network === "youtube" ? false : true

		const user = info ? (network === "twitter" ? info.user : info.channel) : null

		const DisplayFallacies = ({ props }) => {
			if (props.info) {
				return (
					<div className="fallaciesWrapper">
						<Header inverted size="large">
							Fallacies
						</Header>
						<FallaciesList
							commentId={type === "comment" ? id : null}
							emptyMsgContent={`No fallacies have been assigned to this ${type}`}
							history={props.history}
							icon={network}
							itemsPerRow={1}
							network={network}
							objectId={id}
							page={0}
							source="post"
						/>
					</div>
				)
			}
			return null
		}

		const pageInfo = user
			? {
					id: `${network === "twitter" ? user.id_str : user.id}`,
					name: network === "youtube" ? user.title : user.name,
					type: network,
					username: network === "youtube" ? null : user.screen_name
			  }
			: null

		const DisplayFallacyForm = props => (
			<div className="fallacyFormWrapper">
				<FallacyForm
					authenticated={auth}
					bearer={bearer}
					commentId={type === "comment" ? id : null}
					endTime={endTime}
					handleSubmit={this.handleSubmit}
					highlightedText={highlightedText}
					history={props.history}
					network={network}
					objectId={id}
					pageInfo={pageInfo}
					sendNotification={props.sendNotification}
					startTime={startTime}
					type={type}
					useCard={type === "tweet"}
					user={user}
				/>
			</div>
		)

		const DisplayPost = props => {
			switch (type) {
				case "comment":
					if (props.info) {
						return (
							<div>
								<YouTubeCommentsSection
									archive={props.archive}
									auth={auth}
									bearer={bearer}
									comment={props.info.comment}
									handleHoverOn={this.handleHoverOn}
									highlightedText={highlightedText}
									history={props.history}
									sendNotification={props.sendNotification}
									showComment
									showComments={false}
									source="post"
									videoId={props.info.id}
								/>
								<Divider hidden />
							</div>
						)
					}
					break

				case "tweet":
					if (props.info) {
						return (
							<div className="tweetWrapper">
								<div id="captureTweet">
									<Tweet
										archive={props.archive}
										archives={props.archives}
										bearer={bearer}
										canArchive
										created_at={props.info.created_at}
										displayTextRange={props.info.display_text_range}
										extended_entities={props.info.extended_entities}
										externalLink
										highlight={highlightedText !== ""}
										highlightedText={highlightedText}
										history={props.history}
										full_text={props.info.full_text}
										handleHoverOn={this.handleHoverOn}
										id={props.info.id_str}
										imageSize="medium"
										is_quote_status={props.info.is_quote_status}
										profileImg={props.s3Pic}
										quoted_status={
											props.info.quoted_status === undefined &&
											props.info.is_quote_status
												? props.info.retweeted_status
												: props.info.quoted_status
										}
										quoted_status_id_str={props.info.quoted_status_id_str}
										quoted_status_permalink={props.info.quoted_status_permalink}
										retweeted_status={
											props.info.retweeted_status === undefined
												? false
												: props.info.retweeted_status
										}
										stats={{
											favorite_count: props.info.favorite_count,
											retweet_count: props.info.retweet_count
										}}
										user={props.info.user}
									/>
								</div>
								<Message className="screenshotMsg">
									<Icon name="camera" />
									<span onClick={this.captureScreenshot}>Capture screenshot</span>
								</Message>
								{DisplayFallacyForm(props)}
							</div>
						)
					} else {
						return (
							<div className="tweetWrapper">
								<LazyLoad />
							</div>
						)
					}

				case "video":
					if (props.info) {
						return (
							<div>
								<YouTubeVideo
									archives={props.archives}
									archiveId={a}
									bearer={bearer}
									canArchive={false}
									channel={props.info.channel}
									dateCreated={props.info.date_created}
									description={props.info.description}
									endTime={endTime}
									existsOnYt={props.existsOnYt}
									history={props.history}
									id={props.info.id}
									placeholder={props.info.img}
									playing
									s3Link={props.info.s3_link}
									sendNotification={props.sendNotification}
									setClip={this.setClip}
									showComments
									showStats={false}
									showTranscript
									startTime={startTime}
									stats={props.info.stats}
									title={props.info.title}
									transcript={props.transcript}
								/>
								<Divider section />
								<Header inverted size="large">
									Call out bullshit
								</Header>
								{DisplayFallacyForm(props)}
							</div>
						)
					}

					return null

				case "youtube_comment":
					return null
				default:
					return null
			}
		}

		const RelatedSearches = props => {
			if (props.info) {
				const start = props.info.display_text_range[0]
				const end = props.info.display_text_range[1]
				const related = removeWords(
					props.info.full_text.substring(start, end),
					true,
					stopWords
				)
				return (
					<Card className="relatedSearches" fluid>
						<Card.Content>
							<Card.Header>Search for contradictions</Card.Header>
						</Card.Content>
						<Card.Content>
							<List relaxed>
								{related.map(word => (
									<List.Item key={word}>
										<a
											href={`https://twitter.com/search?q=${word} from:${props.info.user.screen_name}&src=typed_query`}
											rel="noopener noreferrer"
											target="_blank"
										>
											{word}
										</a>
									</List.Item>
								))}
							</List>
						</Card.Content>
					</Card>
				)
			}
			return null
		}

		return (
			<Provider store={store}>
				<div className="postPage">
					<DisplayMetaTags page="post" props={this.props} state={this.state} />
					<DefaultLayout
						activeItem=""
						containerClassName="notFoundPage"
						history={this.props.history}
					>
						{type === "video" &&
							(videoExists ? (
								<Segment inverted>
									{DisplayPost(this.props)}
									{!this.props.error && <DisplayFallacies props={this.props} />}
								</Segment>
							) : (
								<div>
									<Image
										centered
										className="trumpImg404"
										size="medium"
										src={TrumpImg}
									/>
									<Header size="large" textAlign="center">
										This video does not exist
									</Header>
								</div>
							))}

						{type === "tweet" && (
							<div>
								<Responsive maxWidth={1024}>
									<Grid>
										<Grid.Row>
											{DisplayPost(this.props)}
											{!tweetExists && (
												<Message
													content="This tweet does not exist"
													error
												/>
											)}
										</Grid.Row>
										<Grid.Row className="relatedRow">
											{RelatedSearches(this.props)}
										</Grid.Row>
										<Grid.Row>
											{!this.props.error && (
												<DisplayFallacies props={this.props} />
											)}
										</Grid.Row>
									</Grid>
								</Responsive>

								<Responsive minWidth={1025}>
									<Grid>
										<Grid.Column className="leftSide" width={11}>
											{DisplayPost(this.props)}
											{!tweetExists && (
												<Message
													content="This tweet does not exist"
													error
												/>
											)}
											{!this.props.error && (
												<DisplayFallacies props={this.props} />
											)}
										</Grid.Column>
										<Grid.Column className="rightSide" width={5}>
											{RelatedSearches(this.props)}
										</Grid.Column>
									</Grid>
								</Responsive>
							</div>
						)}
					</DefaultLayout>
				</div>
			</Provider>
		)
	}
}

Post.propTypes = {
	archive: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.shape({
			code: PropTypes.string,
			date_created: PropTypes.string,
			link: PropTypes.string
		})
	]),
	archives: PropTypes.array,
	error: PropTypes.bool,
	errorCode: PropTypes.number,
	existsOnYt: PropTypes.bool,
	info: PropTypes.object,
	fallacyCount: PropTypes.number,
	myArchives: PropTypes.array,
	pageInfo: PropTypes.object,
	profileImg: PropTypes.string,
	refreshYouTubeToken: PropTypes.func,
	s3Pic: PropTypes.string,
	sendNotification: PropTypes.func,
	transcript: PropTypes.string,
	type: PropTypes.string
}

Post.defaultProps = {
	archives: [],
	myArchives: [],
	refreshYouTubeToken,
	transcript: ""
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.post,
		...state.user,
		...ownProps
	}
}

export default connect(mapStateToProps, { fetchPostData, refreshYouTubeToken })(Post)
