import "pages/css/index.css"
import { refreshYouTubeToken } from "components/authentication/v1/actions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { fetchFallacyCount, fetchPageData } from "pages/actions/page"
import { Provider, connect } from "react-redux"
import {
	Button,
	Container,
	Dimmer,
	Grid,
	Header,
	Icon,
	Image,
	Label,
	Menu,
	Responsive,
	Segment
} from "semantic-ui-react"
import AboutCard from "components/aboutCard/v1/"
import defaultImg from "images/image-square.png"
import FallaciesList from "components/fallaciesList/v1/"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import ParagraphPic from "images/short-paragraph.png"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "../store"
import TitleHeader from "components/titleHeader/v1/"
import TrumpImg from "images/trump.svg"
import TweetList from "components/tweetList/v1/"
import VideoList from "components/videoList/v1/"

class Page extends Component {
	constructor(props) {
		super(props)
		const id = this.props.match.params.id
		const network = this.props.match.params.network
		const tab = this.props.match.params.tab
		const label = this.determineItemsLabel(network)
		const currentState = store.getState()
		const authenticated = currentState.user.authenticated
		const bearer = currentState.user.bearer

		this.state = {
			activeItem: tab === "fallacies" ? tab : label,
			authenticated,
			bearer,
			id,
			itemsLabel: label,
			network,
			page: 0,
			updated: false
		}

		this.props.fetchPageData({
			bearer: this.state.bearer,
			id: this.state.id,
			type: this.state.network
		})
	}

	componentWillReceiveProps(props) {
		const id = props.match.params.id
		const network = props.match.params.network
		const tab = props.match.params.tab
		if (this.state.id !== id) {
			this.props.fetchPageData({
				bearer: this.state.bearer,
				id: id,
				type: network
			})

			this.setState({
				id,
				network,
				page: 0
			})
		}

		const label = this.determineItemsLabel(network)
		this.setState({
			activeItem: tab === "fallacies" ? tab : label,
			itemsLabel: label,
			updated: !this.state.updated
		})
	}

	determineItemsLabel(network) {
		switch (network) {
			case "twitter":
				return "tweets"
			case "youtube":
				return "videos"
			default:
				return null
		}
	}

	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name })
		this.props.history.push(`/pages/${this.state.network}/${this.state.id}/${name}`)
	}

	render() {
		const { activeItem, authenticated, bearer, id, itemsLabel, network } = this.state
		if (this.props.error && this.props.errorCode !== 404 && network === "youtube") {
			this.props.refreshYouTubeToken({
				bearer
			})
			setTimeout(() => {
				window.location.reload()
			}, 200)
		}
		const DimmerMsg = ({ btn, msg, props }) => {
			return (
				<Dimmer active>
					<Header as="h2">{msg}</Header>
					{btn}
				</Dimmer>
			)
		}
		const LazyLoadDefault = [{}, {}, {}, {}, {}].map((post, i) => {
			let marginTop = i === 0 ? 0 : 15
			return (
				<div key={`lazy_load_${i}`} style={{ marginTop: `${marginTop}px` }}>
					<Segment className="lazyLoadSegment">
						<Image fluid src={ParagraphPic} />
					</Segment>
				</div>
			)
		})
		const PageHeaderInfo = props => {
			const subheader = (
				<div>
					{props.username && (
						<a
							className="externalUrl"
							onClick={() => window.open(props.externalUrl, "_blank")}
						>
							@{props.username}
						</a>
					)}{" "}
					<Icon className={`${network}Icon`} name={network} />
				</div>
			)
			return <TitleHeader subheader={subheader} title={props.name} />
		}
		const PageMenu = props => (
			<Menu className="socialMediaPageMenu" fluid pointing secondary stackable>
				<Menu.Item
					active={activeItem === itemsLabel}
					name={itemsLabel}
					onClick={this.handleItemClick}
				/>
				<Menu.Item
					active={activeItem === "fallacies"}
					name="fallacies"
					onClick={this.handleItemClick}
				>
					Fallacies{" "}
					{props.fallacyCount > 0 && <Label circular>{props.fallacyCount}</Label>}
				</Menu.Item>
			</Menu>
		)
		const ShowContent = props => {
			if (props.id) {
				if (activeItem === "fallacies") {
					return (
						<FallaciesList
							assignedTo={props.id}
							emptyMsgHeader={false}
							emptyMsgContent={`No fallacies have been assigned to ${props.name}`}
							history={props.history}
							source="pages"
						/>
					)
				}

				if (authenticated) {
					if (activeItem === "tweets" && props.data.linkedTwitter) {
						return (
							<div>
								<TweetList bearer={bearer} history={props.history} username={id} />
							</div>
						)
					}

					if (activeItem === "videos" && props.data.linkedYoutube) {
						return (
							<div>
								<VideoList bearer={bearer} channelId={id} history={props.history} />
							</div>
						)
					}

					return (
						<Dimmer.Dimmable as={Segment} dimmed>
							{LazyLoadDefault}
							<DimmerMsg
								btn={
									<Button
										color={props.network}
										icon
										onClick={() =>
											props.history.push(`/settings/${props.network}`)
										}
									>
										<Icon name={props.network} /> Link your {props.network}
									</Button>
								}
								msg={`Link your ${props.network} to start calling ${
									props.name
								} out`}
								props={props}
							/>
						</Dimmer.Dimmable>
					)
				}
				return (
					<Dimmer.Dimmable as={Segment} dimmed>
						{LazyLoadDefault}
						<DimmerMsg
							btn={
								<Button color="blue" onClick={() => props.history.push("/signin")}>
									Sign in
								</Button>
							}
							msg={`Sign in to start calling ${props.name} out`}
							props={props}
						/>
					</Dimmer.Dimmable>
				)
			}
		}

		return (
			<Provider store={store}>
				<div className="socialMediaPage">
					<DisplayMetaTags page="pages" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					{this.props.exists ? (
						<Container className="mainContainer" textAlign="left">
							<Responsive maxWidth={1024}>
								<Grid>
									<Grid.Row>{PageHeaderInfo(this.props)}</Grid.Row>
									<Grid.Row className="pageContentRow">
										<Image
											className="profilePic"
											onError={i => (i.target.src = defaultImg)}
											rounded
											src={this.props.img}
										/>
										<AboutCard
											description={this.props.about}
											linkify
											title="About"
										/>
										{PageMenu(this.props)}
										<Container className="profileContentContainer">
											{ShowContent(this.props)}
										</Container>
									</Grid.Row>
								</Grid>
							</Responsive>

							<Responsive minWidth={1025}>
								<Grid>
									<Grid.Column width={4}>
										<Image
											centered
											className="profilePic"
											onError={i => (i.target.src = defaultImg)}
											rounded
											src={this.props.img}
										/>
										<AboutCard
											description={this.props.about}
											linkify
											title="About"
										/>
									</Grid.Column>
									<Grid.Column width={12}>
										{PageHeaderInfo(this.props)}
										{PageMenu(this.props)}
										<Container className="profileContentContainer">
											{ShowContent(this.props)}
										</Container>
									</Grid.Column>
								</Grid>
							</Responsive>
						</Container>
					) : (
						<Container className="mainContainer" text textAlign="center">
							<Image centered disabled size="medium" src={TrumpImg} />
							<Header size="medium">This page does not exist!</Header>
						</Container>
					)}
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Page.propTypes = {
	about: PropTypes.string,
	error: PropTypes.bool,
	errorCode: PropTypes.number,
	exists: PropTypes.bool,
	externalUrl: PropTypes.string,
	fallacyCount: PropTypes.number,
	fetchPageData: PropTypes.func,
	id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	img: PropTypes.string,
	isVerified: PropTypes.bool,
	name: PropTypes.string,
	network: PropTypes.string,
	posts: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.shape({
			count: PropTypes.number,
			data: PropTypes.array,
			error: PropTypes.bool,
			errorMsg: PropTypes.string,
			errorType: PropTypes.number,
			hasMore: PropTypes.bool,
			loading: true
		})
	]),
	refreshYouTubeToken: PropTypes.func,
	username: PropTypes.string
}

Page.defaultProps = {
	error: false,
	exists: true,
	fallacies: {
		count: 0,
		error: false,
		data: [{}, {}, {}, {}, {}]
	},
	fetchPageData: fetchPageData,
	img: defaultImg,
	posts: {
		count: 0,
		error: false,
		data: [{}, {}, {}, {}, {}]
	},
	refreshYouTubeToken: refreshYouTubeToken
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.page,
		...state.user,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{
		fetchFallacyCount,
		fetchPageData,
		refreshYouTubeToken
	}
)(Page)
