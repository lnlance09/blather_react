import "pages/css/index.css"
import { mapIdsToNames } from "utils/arrayFunctions"
import { adjustTimezone } from "utils/dateFunctions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { fetchCommentCount, fetchFallacy, updateFallacy } from "pages/actions/fallacy"
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
			editing: false,
			exportOpt: "screenshot",
			id,
			screenshots: [1,2,4,9,11,12],
			show: false,
			tabs,
			userId,
			value: ""
		}

		this.captureScreenshot = this.captureScreenshot.bind(this)
		this.handleExportChange = this.handleExportChange.bind(this)
	}

	captureScreenshot = () => {
		const { createdAt, fallacyName, user } = this.props
		const filename = `${fallacyName}-by-${user.name}-${createdAt}`
		const width = document.getElementById("fallacyExample").offsetWidth
		const endPixel = width * 2
		const elements = document.getElementsByClassName("linkifyTweet")
		for (let i = 0; i < elements.length; i++) {
			elements[i].classList.add("downloading")
		}

		html2canvas(document.getElementById("fallacyExample"), {
			allowTaint: true,
			width: width
		}).then(canvas => {
			const ctx = canvas.getContext("2d")
			ctx.globalAlpha = 1
			ctx.font = "24px Arial"
			ctx.fillStyle = "#07f"
			ctx.fillText(`blather.io/fallacies/${this.state.id}`, endPixel - 320, 45)

			let link = document.createElement("a")
			link.download =
				filename
					.toLowerCase()
					.split(" ")
					.join("-") + ".png"
			link.href = canvas.toDataURL("image/png")
			link.click()
			for (let i = 0; i < elements.length; i++) {
				elements[i].classList.remove("downloading")
			}
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
		this.setState({ activeItem: tab })
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
		const { activeItem, auth, bearer, exportOpt, id, screenshots, userId } = this.state
		const canEdit = this.props.createdBy ? this.props.createdBy.id === userId : false
		const canScreenshot = screenshots.includes(this.props.refId)
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
								title={`@${props.user.username} ${props.title} - ${
									props.fallacyName
								} by ${props.user.name}`}
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
				<div>
					{canScreenshot ? (
						<Form>
							<Form.Field>
								<Radio
									checked={exportOpt === "screenshot"}
									label="Screenshot just the tweet(s)"
									onChange={this.handleExportChange}
									name="exportOption"
									value="screenshot"
								/>
							</Form.Field>
							<Form.Field>
								<Radio
									checked={exportOpt === "screenshotAll"}
									label="Screenshot the tweet(s) plus the explanation"
									onChange={this.handleExportChange}
									name="exportOption"
									value="screenshotAll"
								/>
							</Form.Field>
						</Form>
					) : (
						<Form>
							<Form.Field>
								<Radio
									checked={exportOpt === "video"}
									label="Download a video"
									onChange={this.handleExportChange}
									name="exportOption"
									value="video"
								/>
							</Form.Field>
						</Form>
					)}
					<Button
						className="downloadBtn"
						color="green"
						compact
						content="Download"
						icon="download"
						onClick={this.captureScreenshot}
					/>
				</div>
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
								history={props.history}
								id={id}
							/>
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
							<Segment className="similarFallaciesSegment" stacked>
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
									<Grid.Row>{ExportSection(this.props)}</Grid.Row>
									{activeItem === "material" && (
										<div>
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
										{ExportSection(this.props)}
										<Divider />
										{activeItem === "material" && ContactUser(this.props)}
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
	commentCount: PropTypes.number,
	comments: PropTypes.shape({
		count: PropTypes.number,
		results: PropTypes.array
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
	error: PropTypes.bool,
	explanation: PropTypes.string,
	fallacies: PropTypes.array,
	fallacyCount: PropTypes.number,
	fallacyId: PropTypes.number,
	fallacyName: PropTypes.string,
	fetchCommentCount: PropTypes.func,
	fetchFallacy: PropTypes.func,
	highlightedText: PropTypes.string,
	id: PropTypes.number,
	refId: PropTypes.number,
	status: PropTypes.number,
	tag_ids: PropTypes.string,
	tag_names: PropTypes.string,
	title: PropTypes.string,
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
	convoLoading: true,
	error: false,
	fallacyCount: 0,
	fetchCommentCount,
	fetchFallacy
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
		fetchCommentCount,
		fetchFallacy,
		updateFallacy
	}
)(Fallacy)
