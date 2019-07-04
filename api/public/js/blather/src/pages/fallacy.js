import "pages/css/index.css"
import { adjustTimezone } from "utils/dateFunctions"
import { DisplayMetaTags } from "utils/metaFunctions"
import {
	createVideoFallacy,
	fetchFallacy,
	reset,
	retractLogic,
	saveScreenshot,
	toggleCreateMode,
	updateFallacy
} from "pages/actions/fallacy"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import {
	FacebookIcon,
	FacebookShareButton,
	RedditIcon,
	RedditShareButton,
	TwitterIcon,
	TwitterShareButton
} from "react-share"
import {
	Button,
	Container,
	Dimmer,
	Form,
	Grid,
	Header,
	Icon,
	Image,
	List,
	Message,
	Radio,
	Responsive,
	Segment,
	Statistic
} from "semantic-ui-react"
import Disqus from "disqus-react"
import FallacyExample from "components/fallacyExample/v1/"
import FallaciesList from "components/fallaciesList/v1/"
import FallacyRef from "components/fallacyRef/v1/"
import html2canvas from "html2canvas"
import ImagePic from "images/image-square.png"
import LazyLoad from "components/lazyLoad/v1/"
import Moment from "react-moment"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ReactPlayer from "react-player"
import store from "store"
import TitleHeader from "components/titleHeader/v1/"
import TrumpImg from "images/trump-white.png"

class Fallacy extends Component {
	constructor(props) {
		super(props)

		const params = this.props.match.params
		let { id } = params

		if (isNaN(id)) {
			const split = id.split("-")
			id = split[split.length - 1]
		}

		const currentState = store.getState()
		const auth = currentState.user.authenticated
		const bearer = currentState.user.bearer
		const twitterId = currentState.user.data.twitterId
		const userId = parseInt(currentState.user.data.id, 10)
		const youtubeId = currentState.user.data.youtubeId

		this.state = {
			active: false,
			auth,
			bearer,
			downloading: false,
			editing: false,
			exportArticle: this.props.refId > 8 ? "comment" : "tweet",
			exportOpt: "screenshot",
			id,
			show: false,
			twitterId,
			userId,
			value: "",
			youtubeId
		}

		this.captureScreenshot = this.captureScreenshot.bind(this)
		this.handleExportChange = this.handleExportChange.bind(this)
	}

	captureScreenshot() {
		const { createdAt, fallacyName, id, refId, user } = this.props
		const filename = `${fallacyName}-by-${user.name}-${createdAt}`
		let duration = ""
		let scale = 2

		if (refId === 4 || refId === 5) {
			this.props.toggleCreateMode()
			this.props.createVideoFallacy({
				fallacyName: this.props.fallacyName,
				id,
				original: this.props.originalPayload,
				refId
			})
			return
		}

		if (refId === 6) {
			this.props.toggleCreateMode()
			duration = document.getElementById("fallacyDateDiff").textContent
			this.props.createVideoFallacy({
				contradiction: this.props.contradictionPayload,
				duration,
				id,
				img: "",
				original: this.props.originalPayload,
				refId
			})
			return
		}

		let el = "fallacyMaterial"
		if (this.state.exportOpt === "screenshotAll") {
			el = "fallacyExample"
		}

		if (this.props.canMakeVideo) {
			duration = document.getElementById("fallacyDateDiff").textContent
			el = this.props.screenshotEl
			scale = 1.5
		}

		this.setState({ downloading: true })

		html2canvas(document.getElementById(el), {
			allowTaint: false,
			scale,
			useCORS: true
		}).then(canvas => {
			if (this.props.canScreenshot) {
				const ctx = canvas.getContext("2d")
				ctx.globalAlpha = 1
				let img = canvas.toDataURL("image/png")

				this.props.saveScreenshot({
					id,
					img,
					slug: this.props.slug
				})

				let link = document.createElement("a")
				link.download =
					filename
						.toLowerCase()
						.split(" ")
						.join("-") + ".png"
				link.href = img
				link.click()

				this.setState({ downloading: false })
			} else if (this.props.canMakeVideo) {
				this.props.toggleCreateMode()

				const newCanvas = document.getElementById("materialCanvas")
				newCanvas.width = 1920
				newCanvas.height = 1080

				const canvasContent = newCanvas.getContext("2d")
				canvasContent.fillStyle = "#66dd30"
				canvasContent.fillRect(0, 0, 1920, 1080)
				canvasContent.drawImage(
					canvas,
					1920 / 2 - canvas.width / 2,
					1080 / 2 - canvas.height / 2
				)
				const newImg = newCanvas.toDataURL("image/png")

				this.props.createVideoFallacy({
					contradiction: this.props.contradictionPayload,
					duration,
					id,
					img: newImg,
					original: this.props.originalPayload,
					refId
				})
			}
		})
	}

	componentDidMount() {
		this.props.reset()
		this.props.fetchFallacy({
			bearer: this.state.bearer,
			id: this.state.id
		})
	}

	componentWillReceiveProps(newProps) {
		let newId = newProps.match.params.id
		if (isNaN(newId)) {
			const split = newId.split("-")
			newId = split[split.length - 1]
		}

		if (newId !== this.state.id) {
			window.scrollTo({ top: 0, behavior: 'smooth' })
			this.props.reset()
			this.props.fetchFallacy({
				bearer: this.state.bearer,
				id: newId
			})
			this.setState({ id: newId })
		}

		this.setState({
			exportArticle: newProps.refId > 8 ? "comment" : "tweet",
			exportOpt: newProps.canMakeVideo ? "video" : "screenshot"
		})
	}

	handleExportChange = (e, { value }) => this.setState({ exportOpt: value })

	handleHide = () => this.setState({ active: false })

	handleShow = () => this.setState({ active: true })

	onChange = value => {
		this.setState({ value })
		if (this.props.onChange) {
			this.props.onChange(value.toString("html"))
		}
	}

	retractLogic = () => {
		this.props.retractLogic({
			bearer: this.state.bearer,
			id: this.state.id,
			type: this.props.user.type
		})
	}

	showImage = () => this.setState({ show: true })

	render() {
		const {
			active,
			bearer,
			downloading,
			exportArticle,
			exportOpt,
			id,
			twitterId,
			userId,
			youtubeId
		} = this.state
		const { createdBy, user } = this.props
		const canEdit = createdBy ? createdBy.id === userId : false

		let userLink = ""
		if (user) {
			userLink = `/pages/${user.type}/${user.type === "twitter" ? user.username : user.id}`
		}

		const CommentsSection = props => {
			const DisqusConfig = {
				identifier: props.id,
				title: props.title,
				url: `https://blather.io/fallacies/${props.slug}`
			}
			return (
				<div className="commentsContent">
					<Header dividing size="large">
						Comments
					</Header>
					<Disqus.DiscussionEmbed config={DisqusConfig} shortname="blather-1" />
				</div>
			)
		}

		const ExportSection = (props, side) => {
			const content = (
				<div>
					<Header as="h2" inverted>
						Screenshot
					</Header>
					<Icon color="green" name="download" size="big" />
				</div>
			)
			return (
				<div className="exportSection">
					{side === "left" && (
						<Header dividing size="large">
							Export Options
						</Header>
					)}
					{props.id && (
						<div>
							{props.canScreenshot ? (
								<Form>
									<Form.Field>
										<Radio
											checked={exportOpt === "screenshot"}
											label={`Screenshot just the ${exportArticle}(s)`}
											name="exportOption"
											onChange={this.handleExportChange}
											value="screenshot"
										/>
									</Form.Field>
									<Form.Field>
										<Radio
											checked={exportOpt === "screenshotAll"}
											label={`Screenshot the ${exportArticle}(s) plus the explanation`}
											name="exportOption"
											onChange={this.handleExportChange}
											value="screenshotAll"
										/>
									</Form.Field>
								</Form>
							) : (
								<div>
									<Form>
										<Form.Field>
											<Radio
												checked={exportOpt === "video"}
												disabled={!props.canMakeVideo}
												label="Download a video"
												name="exportOption"
												onChange={this.handleExportChange}
												value="video"
											/>
										</Form.Field>
									</Form>
									{!props.canMakeVideo && (
										<Message
											content="A time frame in the video(s) must be specified that is 60 seconds or less"
											header="This clip is too large to make a video"
											warning
										/>
									)}
								</div>
							)}

							{props.canMakeVideo || props.canScreenshot ? (
								<Button
									className="downloadBtn"
									color="green"
									content={`Create ${
										props.canMakeVideo ? "video" : "screenshot"
									}`}
									fluid={side === "right"}
									icon={props.canMakeVideo ? "film" : "camera"}
									loading={props.creating}
									onClick={this.captureScreenshot}
								/>
							) : null}
							{props.s3Link && props.canScreenshot ? (
								<div>
									<Dimmer.Dimmable
										as={Image}
										bordered
										className="downloadDimmer"
										dimmed={active}
										dimmer={{ active, content }}
										onClick={() => window.open(props.s3Link, "_blank")}
										onMouseEnter={this.handleShow}
										onMouseLeave={this.handleHide}
										rounded
										size="big"
										src={props.s3Link}
									/>
								</div>
							) : null}
						</div>
					)}
				</div>
			)
		}

		const FallacyTitle = ({ props }) => {
			if (props.id) {
				const subheader = (
					<div>
						{props.createdBy && (
							<div>
								Created{" "}
								<Moment
									date={adjustTimezone(props.createdAt)}
									fromNow
									interval={60000}
								/>{" "}
								by{" "}
								<Link to={`/users/${props.createdBy.username}`}>
									{props.createdBy.name}
								</Link>
							</div>
						)}
					</div>
				)
				return (
					<TitleHeader
						bearer={bearer}
						canEdit={canEdit}
						dividing
						id={id}
						subheader={subheader}
						title={props.title}
						type="fallacy"
					/>
				)
			}
			return null
		}

		const MaterialSection = props => {
			return (
				<div className="materialWrapper">
					{props.id ? (
						<div>
							{props.canScreenshot ? (
								<FallacyExample
									bearer={bearer}
									canEdit={canEdit}
									downloading={downloading}
									exportOpt={exportOpt}
									history={props.history}
									id={id}
								/>
							) : (
								<div>
									{props.id && (
										<div>
											{props.s3Link && props.canMakeVideo ? (
												<ReactPlayer
													className="exportEmbed"
													controls
													url={props.s3Link}
												/>
											) : (
												<Image centered size="large" src={ImagePic} />
											)}
										</div>
									)}
								</div>
							)}
							<canvas id="materialCanvas" />
						</div>
					) : (
						<LazyLoad header={false} />
					)}
				</div>
			)
		}

		const ReferenceSection = (
			<div className="fallacyContent">
				<Header dividing size="large">
					Reference
				</Header>
				{this.props.id ? (
					<FallacyRef canScreenshot={false} id={this.props.fallacyId} />
				) : (
					<LazyLoad header={false} />
				)}
			</div>
		)

		const RetractionSegment = props => (
			<div>
				{props.user && (
					<Container className="retractionContainer">
						{props.retracted ? (
							<div>
								<Message
									content={`${
										props.user.name
									} has admitted that this is poor reasoning.`}
									header={`Nice job, ${props.user.name}!`}
									icon="thumbs up"
									success
								/>
							</div>
						) : (
							<div>
								{props.user.id === twitterId || props.user.id === youtubeId ? (
									<div>
										<Message
											content="You have an opportunity to show your followers that you care enough about intellectual honesty to admit you were wrong."
											header={`Congratulation, ${props.user.name}!`}
										/>
										<Button
											color="green"
											content="Yes, I admit this was poor reasoning."
											fluid
											icon="check"
											onClick={this.retractLogic}
										/>
									</div>
								) : (
									<div>
										<Message
											content="How they respond to being called out should tell you everything you need to know."
											header={`Is ${
												props.user.name
											} a grifter or just naive?`}
										/>
										<p>
											<b>
												<Link to={userLink}>{props.user.name}</Link> still
												hasn't admitted to using erroneous logic
											</b>
										</p>
									</div>
								)}
							</div>
						)}
					</Container>
				)}
			</div>
		)

		const ShareSection = useHeader => {
			return (
				<div className="shareContent">
					{useHeader && (
						<Header dividing size="large">
							Share
						</Header>
					)}
					{this.props.id ? (
						<List className="shareList" horizontal>
							<List.Item>
								<TwitterShareButton
									title={this.props.pageTitle}
									url={`${window.location.origin}/fallacies/${id}`}
								>
									<TwitterIcon round size={35} />
								</TwitterShareButton>
							</List.Item>
							<List.Item>
								<FacebookShareButton
									url={`${window.location.origin}/fallacies/${id}`}
								>
									<FacebookIcon round size={35} />
								</FacebookShareButton>
							</List.Item>
							<List.Item>
								<RedditShareButton
									url={`${window.location.origin}/fallacies/${id}`}
								>
									<RedditIcon round size={35} />
								</RedditShareButton>
							</List.Item>
						</List>
					) : (
						<LazyLoad header={false} />
					)}
				</div>
			)
		}

		const SimilarSection = (
			<div className="similarContent">
				<Header dividing size="large">
					Similar
				</Header>
				<FallaciesList
					emptyMsgContent="There are no similar fallacies"
					fallacyId={this.props.fallacyId}
					history={this.props.history}
					icon="warning sign"
					source="fallacy"
					useCards
				/>
			</div>
		)

		const SourcesSection = props => {
			const refId = props.refId
			const rawSources = refId === 3 || refId === 6 || refId === 8
			return (
				<div className="sourcesContent">
					<Header dividing size="large">
						Sources
					</Header>
					<FallacyExample
						bearer={bearer}
						canEdit={canEdit}
						downloading={downloading}
						exportOpt={exportOpt}
						history={this.props.history}
						id={id}
						rawSources={!rawSources}
						showExplanation={false}
					/>
				</div>
			)
		}

		return (
			<Provider store={store}>
				<div className="fallacyPage">
					<DisplayMetaTags page="fallacy" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					{!this.props.error ? (
						<Container className="mainContainer" textAlign="left">
							<FallacyTitle props={this.props} />
							<Responsive maxWidth={1024}>
								<Grid className="fallacyGrid">
									<Grid.Row>{MaterialSection(this.props)}</Grid.Row>
									<Grid.Row>{SourcesSection(this.props)}</Grid.Row>
									<Grid.Row>{ReferenceSection}</Grid.Row>
									<Grid.Row>
										{ShareSection(true)}
										<Statistic
											horizontal
											label="Views"
											value={this.props.viewCount}
										/>
									</Grid.Row>
									<Grid.Row>{CommentsSection(this.props)}</Grid.Row>
									<Grid.Row>{SimilarSection}</Grid.Row>
								</Grid>
							</Responsive>

							<Responsive minWidth={1025}>
								<Grid className="fallacyGrid">
									<Grid.Column className="leftSide" width={12}>
										{MaterialSection(this.props)}
										{SourcesSection(this.props)}
										{ReferenceSection}
										{CommentsSection(this.props)}
										{SimilarSection}
									</Grid.Column>
									<Grid.Column className="rightSide" width={4}>
										{this.props.id ? (
											<div>
												<Segment className="exportContainer">
													{ExportSection(this.props, "right")}
												</Segment>
												{RetractionSegment(this.props)}
												<Statistic
													horizontal
													label="Views"
													value={this.props.viewCount}
												/>
												{ShareSection(false)}
											</div>
										) : (
											<LazyLoad header={false} />
										)}
									</Grid.Column>
								</Grid>
							</Responsive>
						</Container>
					) : (
						<Container className="mainContainer" text textAlign="center">
							<Image centered className="trumpImg404" size="medium" src={TrumpImg} />
							<Header size="medium">This fallacy does not exist!</Header>
						</Container>
					)}
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Fallacy.propTypes = {
	canMakeVideo: PropTypes.bool,
	canScreenshot: PropTypes.bool,
	comments: PropTypes.shape({
		count: PropTypes.number,
		results: PropTypes.array
	}),
	contradictionPayload: PropTypes.shape({
		date: PropTypes.string,
		endTime: PropTypes.number,
		id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		startTime: PropTypes.number,
		type: PropTypes.string
	}),
	conversation: PropTypes.array,
	convoLoading: PropTypes.bool,
	createdAt: PropTypes.string,
	createdBy: PropTypes.shape({
		id: PropTypes.number,
		img: PropTypes.string,
		name: PropTypes.string,
		username: PropTypes.string
	}),
	creating: PropTypes.bool,
	createVideoFallacy: PropTypes.func,
	error: PropTypes.bool,
	explanation: PropTypes.string,
	exportVideoUrl: PropTypes.string,
	fallacies: PropTypes.array,
	fallacyCount: PropTypes.number,
	fallacyId: PropTypes.number,
	fallacyName: PropTypes.string,
	fetchFallacy: PropTypes.func,
	highlightedText: PropTypes.string,
	id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	originalPayload: PropTypes.shape({
		date: PropTypes.string,
		endTime: PropTypes.number,
		id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		startTime: PropTypes.number,
		type: PropTypes.string
	}),
	pageTitle: PropTypes.string,
	refId: PropTypes.number,
	reset: PropTypes.func,
	retracted: PropTypes.bool,
	retractLogic: PropTypes.func,
	s3Link: PropTypes.string,
	saveScreenshot: PropTypes.func,
	slug: PropTypes.string,
	status: PropTypes.number,
	screenshotEl: PropTypes.string,
	tag_ids: PropTypes.string,
	tag_names: PropTypes.string,
	thumbnailImg: PropTypes.string,
	title: PropTypes.string,
	toggleCreateMode: PropTypes.func,
	tweet: PropTypes.object,
	video: PropTypes.object,
	user: PropTypes.shape({
		id: PropTypes.string,
		img: PropTypes.string,
		name: PropTypes.string,
		type: PropTypes.string,
		username: PropTypes.string
	}),
	viewCount: PropTypes.number
}

Fallacy.defaultProps = {
	creating: false,
	convoLoading: true,
	createVideoFallacy,
	error: false,
	fallacyCount: 0,
	fetchFallacy,
	reset,
	retractLogic,
	saveScreenshot,
	thumbnailImg: "https://s3.amazonaws.com/blather22/thumbnail.jpg",
	toggleCreateMode
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.fallacy,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{
		createVideoFallacy,
		fetchFallacy,
		reset,
		retractLogic,
		saveScreenshot,
		toggleCreateMode,
		updateFallacy
	}
)(Fallacy)
