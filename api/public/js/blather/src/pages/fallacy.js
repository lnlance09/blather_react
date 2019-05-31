import "pages/css/index.css"
import { adjustTimezone } from "utils/dateFunctions"
import { DisplayMetaTags } from "utils/metaFunctions"
import {
	createVideoFallacy,
	fetchCommentCount,
	fetchFallacy,
	reset,
	retractLogic,
	saveScreenshot,
	toggleCreateMode,
	updateFallacy
} from "pages/actions/fallacy"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import { TwitterShareButton } from "react-share"
import {
	Button,
	Container,
	Dimmer,
	Divider,
	Form,
	Grid,
	Header,
	Icon,
	Image,
	Label,
	Menu,
	Message,
	Placeholder,
	Radio,
	Responsive,
	Segment
} from "semantic-ui-react"
import Comments from "components/comments/v1/"
import FallacyExample from "components/fallacyExample/v1/"
import FallaciesList from "components/fallaciesList/v1/"
import FallacyRef from "components/fallacyRef/v1/"
import html2canvas from "html2canvas"
import ImagePic from "images/image-square.png"
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

		const tabs = ["material", "comments", "similar", "reference"]
		const params = this.props.match.params
		let { id, tab } = params

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

		if (!tabs.includes(tab)) {
			tab = "material"
		}

		this.state = {
			active: false,
			activeItem: tab,
			auth,
			bearer,
			downloading: false,
			editing: false,
			exportArticle: this.props.refId > 8 ? "comment" : "tweet",
			exportOpt: "screenshot",
			id,
			show: false,
			tabs,
			twitterId,
			userId,
			value: "",
			youtubeId
		}

		this.captureScreenshot = this.captureScreenshot.bind(this)
		this.handleExportChange = this.handleExportChange.bind(this)
	}

	captureScreenshot() {
		const { createdAt, fallacyName, refId, user } = this.props
		const filename = `${fallacyName}-by-${user.name}-${createdAt}`
		let duration = ""
		let scale = 2

		if (refId === 4 || refId === 5) {
			this.props.toggleCreateMode()
			this.props.createVideoFallacy({
				fallacyName: this.props.fallacyName,
				id: this.props.id,
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
				id: this.props.id,
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
					id: this.props.id,
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
					id: this.props.id,
					img: newImg,
					original: this.props.originalPayload,
					refId
				})
			}
		})
	}

	componentDidMount() {
		this.props.reset()
		this.props.fetchCommentCount({ id: this.state.id })
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
			this.props.reset()
			this.props.fetchCommentCount({ id: newId })
			this.props.fetchFallacy({
				bearer: this.state.bearer,
				id: newId
			})
			this.setState({ id: newId })
		}

		let tab = newProps.match.params.tab
		if (!this.state.tabs.includes(tab)) {
			tab = "material"
		}
		this.setState({
			activeItem: tab,
			exportArticle: newProps.refId > 8 ? "comment" : "tweet",
			exportOpt: newProps.canMakeVideo ? "video" : "screenshot"
		})
	}

	handleExportChange = (e, { value }) => this.setState({ exportOpt: value })

	handleHide = () => this.setState({ active: false })

	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name })
		this.props.history.push(`/fallacies/${this.state.id}/${name}`)
	}

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
			activeItem,
			auth,
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

		const ContactUser = props => {
			if (props.user) {
				return (
					<div className="statusActionSegment">
						<Header size="tiny">
							Let <Link to={userLink}>{props.user.name}</Link> know that this
							reasoning doesn't make sense
						</Header>
						{props.user.type === "twitter" && (
							<TwitterShareButton
								className="twitterButton ui icon button"
								title={props.pageTitle}
								url={`${window.location.origin}/fallacies/${id}`}
							>
								<Icon name="twitter" /> Tweet @{props.user.username}
							</TwitterShareButton>
						)}
						{props.user.type === "youtube" && (
							<Button
								className="youtubeButton"
								icon
								onClick={() =>
									window.open(
										`https://youtube.com/channel/${props.user.id}`,
										"_blank"
									)
								}
							>
								<Icon name="youtube" /> {props.user.name}
							</Button>
						)}
					</div>
				)
			}
			return null
		}

		const content = (
			<div>
				<Header as="h2" inverted>
					Screenshot
				</Header>
				<Icon color="green" name="download" size="big" />
			</div>
		)

		const ExportSection = props => (
			<div className="exportSection">
				<Header as="h3" dividing>
					Export Options
				</Header>
				{props.id && (
					<div>
						{props.s3Link && props.canMakeVideo ? (
							<ReactPlayer className="exportEmbed" controls url={props.s3Link} />
						) : (
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
				)}
			</div>
		)

		const FallacyMenu = props => (
			<Menu borderless className="fallacyMainMenu" fluid stackable>
				<Menu.Item
					active={activeItem === "material"}
					name="material"
					onClick={this.handleItemClick}
				/>
				<Menu.Item
					active={activeItem === "similar"}
					name="similar"
					onClick={this.handleItemClick}
				>
					Similar {""}
					{props.similarCount > 0 && (
						<Label color="blue" horizontal>
							{props.similarCount}
						</Label>
					)}
				</Menu.Item>
				<Menu.Item
					active={activeItem === "comments"}
					name="comments"
					onClick={this.handleItemClick}
				>
					Comments {""}
					{props.commentCount > 0 && (
						<Label color="red" horizontal>
							{props.commentCount}
						</Label>
					)}
				</Menu.Item>
				<Menu.Item
					active={activeItem === "reference"}
					name="reference"
					onClick={this.handleItemClick}
				/>
			</Menu>
		)

		const FallacyTitle = ({ props }) => {
			if (props.id) {
				const subheader = (
					<div>
						{props.createdBy && (
							<div>
								<Icon name="clock outline" />{" "}
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
						id={id}
						subheader={subheader}
						title={props.title}
						type="fallacy"
					/>
				)
			}
			return (
				<Placeholder fluid>
					<Placeholder.Header>
						<Placeholder.Line />
						<Placeholder.Line />
					</Placeholder.Header>
				</Placeholder>
			)
		}

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
											<Image
												avatar
												bordered
												circular
												onError={i => (i.target.src = ImagePic)}
												src={props.user.img}
											/>{" "}
											<b>
												<Link to={userLink}>{props.user.name}</Link> still
												hasn't admitted that they've used erroneous logic.
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

		const MaterialRow = (
			<div className="materialRow">
				{this.props.id && (
					<div>
						<Grid.Row>{ExportSection(this.props)}</Grid.Row>
						<Divider className="seperator" />
						<Grid.Row>{RetractionSegment(this.props)}</Grid.Row>
						{!this.props.retracted && (
							<div>
								<Divider className="seperator" />
								<Grid.Row>{ContactUser(this.props)}</Grid.Row>
							</div>
						)}
					</div>
				)}
			</div>
		)

		const ShowContent = ({ props }) => {
			switch (activeItem) {
				case "comments":
					return (
						<Segment basic className="commentsContent">
							<Comments
								authenticated={auth}
								bearer={bearer}
								history={props.history}
								id={id}
							/>
						</Segment>
					)
				case "similar":
					if (props.fallacyId) {
						return (
							<Segment basic className="similarFallaciesSegment">
								<FallaciesList
									emptyMsgContent="There are no similar fallacies"
									fallacyId={props.fallacyId}
									history={props.history}
									icon="warning sign"
									source="fallacy"
								/>
							</Segment>
						)
					}
					return null
				case "reference":
					return (
						<div className="fallacyContent">
							<FallacyRef id={props.fallacyId} />
						</div>
					)
				default:
					return null
			}
		}

		const ShowMaterial = props => {
			if (activeItem === "material") {
				return (
					<div className="materialWrapper">
						<FallacyExample
							bearer={bearer}
							canEdit={canEdit}
							downloading={downloading}
							exportOpt={exportOpt}
							history={props.history}
							id={id}
						/>
						<canvas id="materialCanvas" />
					</div>
				)
			}
			return null
		}

		return (
			<Provider store={store}>
				<div className="fallacyPage">
					<DisplayMetaTags page="fallacy" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					{!this.props.error ? (
						<Container className="mainContainer" textAlign="left">
							<Responsive maxWidth={1024}>
								<Grid>
									<Grid.Row>
										<FallacyTitle props={this.props} />
									</Grid.Row>
									<Grid.Row>{FallacyMenu(this.props)}</Grid.Row>
									<Grid.Row>
										{ShowMaterial(this.props)}
										<ShowContent props={this.props} />
									</Grid.Row>
									{activeItem === "material" && MaterialRow}
								</Grid>
							</Responsive>

							<Responsive minWidth={1025}>
								<FallacyTitle props={this.props} />
								{FallacyMenu(this.props)}
								<Grid>
									<Grid.Column className="leftSide" width={16}>
										{ShowMaterial(this.props)}
										<ShowContent props={this.props} />
										{activeItem === "material" && MaterialRow}
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
	commentCount: PropTypes.number,
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
	fetchCommentCount: PropTypes.func,
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
	fetchCommentCount,
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
		fetchCommentCount,
		fetchFallacy,
		reset,
		retractLogic,
		saveScreenshot,
		toggleCreateMode,
		updateFallacy
	}
)(Fallacy)
