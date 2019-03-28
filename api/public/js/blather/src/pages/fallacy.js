import "pages/css/index.css"
import { mapIdsToNames } from "utils/arrayFunctions"
import { adjustTimezone } from "utils/dateFunctions"
import { DisplayMetaTags } from "utils/metaFunctions"
import {
	createVideoFallacy,
	fetchCommentCount,
	fetchFallacy,
	toggleCreateMode,
	updateFallacy
} from "pages/actions/fallacy"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import { TwitterShareButton } from "react-share"
import {
	Button,
	Container,
	Divider,
	Form,
	Grid,
	Header,
	Icon,
	Image,
	Label,
	Menu,
	Message,
	Radio,
	Responsive,
	Segment
} from "semantic-ui-react"
import Comments from "components/comments/v1/"
import FallacyExample from "components/fallacyExample/v1/"
import FallaciesList from "components/fallaciesList/v1/"
import FallacyRef from "components/fallacyRef/v1/"
import html2canvas from "html2canvas"
import Moment from "react-moment"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import TagsCard from "components/tagsCard/v1/"
import TitleHeader from "components/titleHeader/v1/"
import TrumpImg from "images/trump-white.png"

class Fallacy extends Component {
	constructor(props) {
		super(props)
		const tabs = ["material", "comments", "similar", "reference"]
		const id = parseInt(this.props.match.params.id, 10)
		let tab = this.props.match.params.tab
		const currentState = store.getState()
		const auth = currentState.user.authenticated
		const bearer = currentState.user.bearer
		const userId = parseInt(currentState.user.data.id, 10)

		if (!tabs.includes(tab)) {
			tab = "material"
		}

		this.state = {
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
			userId,
			value: ""
		}

		this.captureScreenshot = this.captureScreenshot.bind(this)
		this.handleExportChange = this.handleExportChange.bind(this)
	}

	adjustHighlightBlocks(add) {
		const elements = document.getElementsByClassName("linkifyTweet")
		for (let i = 0; i < elements.length; i++) {
			if (add) {
				elements[i].classList.add("downloading")
			} else {
				elements[i].classList.remove("downloading")
			}
		}
	}

	captureScreenshot() {
		const { createdAt, fallacyName, refId, user } = this.props
		const filename = `${fallacyName}-by-${user.name}-${createdAt}`
		let duration = ""
		let scale = window.devicePixelRatio

		if (refId === 6) {
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

		if (this.props.canMakeVideo && refId !== 4 && refId !== 5) {
			duration = document.getElementById("fallacyDateDiff").textContent
			el = this.props.screenshotEl
			scale = 1
		}

		this.adjustHighlightBlocks(true)
		this.setState({ downloading: true })

		html2canvas(document.getElementById(el), {
			allowTaint: true,
			scale
		}).then(canvas => {
			if (this.props.canScreenshot) {
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

				this.setState({ downloading: false })
			} else if (this.props.canMakeVideo) {
				this.props.toggleCreateMode()
				if (refId === 4 || refId === 5) {
					this.props.createVideoFallacy({
						fallacyName: this.props.fallacyName,
						id: this.props.id,
						original: this.props.originalPayload,
						refId
					})
				} else {
					// const img = canvas.toDataURL("image/png")
					const newCanvas = document.getElementById("materialCanvas")
					newCanvas.width = 1280
					newCanvas.height = 720

					const canvasContent = newCanvas.getContext("2d")
					canvasContent.fillStyle = "#66dd30"
					canvasContent.fillRect(0, 0, 1280, 720)
					canvasContent.drawImage(
						canvas,
						1280 / 2 - canvas.width / 2,
						720 / 2 - canvas.height / 2
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
			}

			this.adjustHighlightBlocks(false)
		})
	}

	componentDidMount() {
		this.props.fetchCommentCount({ id: this.state.id })
		this.props.fetchFallacy({
			bearer: this.state.bearer,
			id: this.state.id
		})
	}

	componentWillReceiveProps(newProps) {
		const newId = parseInt(newProps.match.params.id, 10)
		if (newId !== this.state.id) {
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

	showImage = () => this.setState({ show: true })

	render() {
		const {
			activeItem,
			auth,
			bearer,
			downloading,
			exportArticle,
			exportOpt,
			id,
			userId
		} = this.state
		const canEdit = this.props.createdBy ? this.props.createdBy.id === userId : false

		const ContactUser = props => {
			if (props.user) {
				const userLink = `/pages/${props.user.type}/${
					props.user.type === "twitter" ? props.user.username : props.user.id
				}`
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
		const ExportSection = props => (
			<div className="exportSection">
				<Header as="h3" dividing>
					Export Options
				</Header>
				{props.id && (
					<div>
						{props.exportVideoUrl ? (
							<div>
								<Icon name="film" />
								<a
									href={props.exportVideoUrl}
									rel="noopener noreferrer"
									target="_blank"
								>
									Click here to download
								</a>
							</div>
						) : (
							<div>
								{props.canScreenshot ? (
									<Form>
										<Form.Field>
											<Radio
												checked={exportOpt === "screenshot"}
												label={`Screenshot just the ${exportArticle}(s)`}
												onChange={this.handleExportChange}
												name="exportOption"
												value="screenshot"
											/>
										</Form.Field>
										<Form.Field>
											<Radio
												checked={exportOpt === "screenshotAll"}
												label={`Screenshot the ${exportArticle}(s) plus the explanation`}
												onChange={this.handleExportChange}
												name="exportOption"
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
													onChange={this.handleExportChange}
													name="exportOption"
													value="video"
												/>
											</Form.Field>
										</Form>
										{!props.canMakeVideo && (
											<Message
												content="A time frame in the video(s) must be specified that is 60 seconds or less"
												header="This clip is too large to make a video"
											/>
										)}
									</div>
								)}
								{props.canMakeVideo || props.canScreenshot ? (
									<Button
										className="downloadBtn"
										color="green"
										compact
										content="Download"
										icon="download"
										loading={props.creating}
										onClick={this.captureScreenshot}
									/>
								) : null}
							</div>
						)}
					</div>
				)}
			</div>
		)
		const FallacyMenu = props => (
			<Menu className="fallacyMainMenu" fluid stackable tabular>
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
						<Label color="blue" size="small">
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
						<Label color="blue" size="small">
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
					id={id}
					subheader={subheader}
					title={props.title}
					type="fallacy"
				/>
			)
		}
		const ShowContent = props => {
			switch (activeItem) {
				case "material":
					return (
						<div className="materialWrapper">
							<FallacyExample
								bearer={bearer}
								canEdit={props.createdBy ? props.createdBy.id === userId : false}
								downloading={downloading}
								exportOpt={exportOpt}
								history={props.history}
								id={id}
							/>
							<canvas id="materialCanvas" />
						</div>
					)
				case "comments":
					return (
						<Segment className="commentsContent" stacked>
							<Comments
								authenticated={auth}
								bearer={bearer}
								history={this.props.history}
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
									icon="sticky note"
									source="fallacy"
								/>
							</Segment>
						)
					}
					return null
				case "reference":
					return (
						<div className="fallacyContent">
							<FallacyRef id={props.fallacyId} stacked />
						</div>
					)
				default:
					return null
			}
		}
		const ShowTags = props => {
			let tags = null
			if (props.tag_ids) {
				tags = mapIdsToNames(props.tag_ids, props.tag_names)
			}

			return (
				<TagsCard
					bearer={bearer}
					canEdit={canEdit}
					history={props.history}
					id={id}
					tags={tags ? tags : []}
					type="fallacy"
				/>
			)
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
									<Grid.Row>{ShowContent(this.props)}</Grid.Row>
									{activeItem === "material" && (
										<div>
											<Grid.Row>{ExportSection(this.props)}</Grid.Row>
											<Divider />
											<Grid.Row>{ContactUser(this.props)}</Grid.Row>
										</div>
									)}
									{activeItem === "material" && (
										<Grid.Row>{ShowTags(this.props)}</Grid.Row>
									)}
								</Grid>
							</Responsive>
							<Responsive minWidth={1025}>
								<FallacyTitle props={this.props} />
								{FallacyMenu(this.props)}
								<Grid>
									<Grid.Column className="leftSide" width={12}>
										{ShowContent(this.props)}
										{activeItem === "material" && (
											<div>
												<Grid.Row>{ExportSection(this.props)}</Grid.Row>
												<Divider />
												<Grid.Row>{ContactUser(this.props)}</Grid.Row>
											</div>
										)}
									</Grid.Column>
									<Grid.Column className="rightSide" width={4}>
										{ShowTags(this.props)}
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
	id: PropTypes.number,
	originalPayload: PropTypes.shape({
		date: PropTypes.string,
		endTime: PropTypes.number,
		id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		startTime: PropTypes.number,
		type: PropTypes.string
	}),
	pageTitle: PropTypes.string,
	refId: PropTypes.number,
	status: PropTypes.number,
	screenshotEl: PropTypes.string,
	tag_ids: PropTypes.string,
	tag_names: PropTypes.string,
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
		toggleCreateMode,
		updateFallacy
	}
)(Fallacy)
