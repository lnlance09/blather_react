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
	Grid,
	Header,
	Icon,
	Image,
	Label,
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
		const id = parseInt(this.props.match.params.id, 10)
		const currentState = store.getState()
		const authenticated = currentState.user.authenticated
		const bearer = currentState.user.bearer
		const userId = parseInt(currentState.user.data.id, 10)

		this.state = {
			activeItem: "conversation",
			authenticated,
			bearer,
			editing: false,
			id,
			show: false,
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

	handleHide = () => this.setState({ active: false })

	handleItemClick = (e, { name }) => this.setState({ activeItem: name })

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
		const ContactUser = props => {
			if (props.user) {
				const userLink = `/pages/${props.user.type}/${
					props.user.type === "twitter" ? props.user.username : props.user.id
				}`
				return (
					<Segment className="statusActionSegment">
						<Header size="tiny">
							Let <Link to={userLink}>{props.user.name}</Link> know that this
							reasoning doesn't make sense
						</Header>
						{props.user.type === "twitter" && (
							<TwitterShareButton
								className="twitterButton ui icon button"
								title={`${props.title}`}
								url={`${window.location.origin}/fallacies/${props.fallacyId}`}
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
					</Segment>
				)
			}
			return null
		}
		const FallacyMenu = props => (
			<Menu className="fallacyMainMenu" fluid pointing secondary stackable>
				<Menu.Item
					active={activeItem === "conversation"}
					name="conversation"
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
		const ShowContent = props => {
			switch (activeItem) {
				case "conversation":
					return (
						<div className="materialWrapper">
							<FallacyExample
								bearer={bearer}
								canEdit={props.createdBy ? props.createdBy.id === userId : false}
								history={props.history}
								id={id}
							/>
							{ContactUser(props)}
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
					loading={tags ? false : true}
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
									<Grid.Row>{ShowTags(this.props)}</Grid.Row>
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
