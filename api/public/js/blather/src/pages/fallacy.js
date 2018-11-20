import "pages/css/index.css"
import { mapIdsToNames } from "utils/arrayFunctions"
import { adjustTimezone } from "utils/dateFunctions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { fetchCommentCount, fetchFallacy, updateFallacy } from "pages/actions/fallacy"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import {
	FacebookIcon,
	FacebookShareButton,
	RedditIcon,
	RedditShareButton,
	TumblrIcon,
	TumblrShareButton,
	TwitterIcon,
	TwitterShareButton
} from "react-share"
import {
	Button,
	Container,
	Grid,
	Header,
	Icon,
	Image,
	Label,
	List,
	Menu,
	Responsive,
	Segment
} from "semantic-ui-react"
import Comments from "components/comments/v1/"
import FallacyExample from "components/fallacyExample/v1/"
import FallacyRef from "components/fallacyRef/v1/"
import Moment from "react-moment"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import TagsCard from "components/tagsCard/v1/"
import TitleHeader from "components/titleHeader/v1/"
import TrumpImg from "images/trump.svg"

class Fallacy extends Component {
	constructor(props) {
		super(props)
		const tabs = ["material", "comments", "reference"]
		const id = parseInt(this.props.match.params.id, 10)
		let tab = this.props.match.params.tab
		const currentState = store.getState()
		const authenticated = currentState.user.authenticated
		const bearer = currentState.user.bearer
		const userId = parseInt(currentState.user.data.id, 10)

		if (!tabs.includes(tab)) {
			tab = "material"
		}

		this.state = {
			activeItem: tab,
			authenticated,
			bearer,
			editing: false,
			id,
			show: false,
			tabs,
			userId,
			value: ""
		}
	}

	componentDidMount() {
		this.props.fetchCommentCount({ id: this.state.id })
		this.props.fetchFallacy({
			bearer: this.state.bearer,
			id: this.state.id
		})
	}

	componentWillReceiveProps(newProps) {
		let tab = newProps.match.params.tab
		if (!this.state.tabs.includes(tab)) {
			tab = "material"
		}
		this.setState({ activeItem: tab })
	}

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
		const { activeItem, authenticated, bearer, id, userId } = this.state
		const canEdit = this.props.createdBy ? this.props.createdBy.id === userId : false
		const CallToSignUp = props => {
			if (!authenticated) {
				return (
					<Segment className="callToSignUp" textAlign="center">
						<Header>
							Help stop the spread of bad ideas
							<Header.Subheader>start calling out bullshit now</Header.Subheader>
						</Header>
						<Button
							content="Sign Up"
							onClick={() => this.props.history.push("/signin")}
							positive
						/>
					</Segment>
				)
			}
			return null
		}
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
		const FallacyMenu = props => (
			<Menu className="fallacyMainMenu" fluid pointing secondary stackable>
				<Menu.Item
					active={activeItem === "material"}
					name="material"
					onClick={this.handleItemClick}
				/>
				<Menu.Item
					active={activeItem === "comments"}
					name="comments"
					onClick={this.handleItemClick}
				>
					Comments {""}
					{props.commentCount > 0 && <Label circular>{props.commentCount}</Label>}
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
		const ShareButtons = props => (
			<Container className="shareContainer" textAlign="center">
				<List className="shareList" horizontal>
					<List.Item>
						<FacebookShareButton url={`${window.location.origin}/fallacies/${id}`}>
							<FacebookIcon round size={35} />
						</FacebookShareButton>
					</List.Item>
					<List.Item>
						<TwitterShareButton url={`${window.location.origin}/fallacies/${id}`}>
							<TwitterIcon round size={35} />
						</TwitterShareButton>
					</List.Item>
					<List.Item>
						<RedditShareButton url={`${window.location.origin}/fallacies/${id}`}>
							<RedditIcon round size={35} />
						</RedditShareButton>
					</List.Item>
					<List.Item>
						<TumblrShareButton url={`${window.location.origin}/fallacies/${id}`}>
							<TumblrIcon round size={35} />
						</TumblrShareButton>
					</List.Item>
				</List>
			</Container>
		)
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
							{CallToSignUp(props)}
							{ContactUser(props)}
							{ShareButtons(props)}
						</div>
					)
				case "comments":
					return (
						<div className="commentsContent">
							<Comments
								authenticated={authenticated}
								bearer={bearer}
								history={this.props.history}
								id={id}
							/>
						</div>
					)
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
									</Grid.Column>
									<Grid.Column className="rightSide" width={4}>
										{ShowTags(this.props)}
									</Grid.Column>
								</Grid>
							</Responsive>
						</Container>
					) : (
						<Container className="mainContainer" text textAlign="center">
							<Image centered disabled size="medium" src={TrumpImg} />
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
	fallacyId: PropTypes.number,
	fallacyName: PropTypes.string,
	fetchCommentCount: PropTypes.func,
	fetchFallacy: PropTypes.func,
	highlightedText: PropTypes.string,
	id: PropTypes.number,
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
	fetchCommentCount: fetchCommentCount,
	fetchFallacy: fetchFallacy
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
