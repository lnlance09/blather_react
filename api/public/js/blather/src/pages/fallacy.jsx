import { mapIdsToNames } from "utils/arrayFunctions"
import { adjustTimezone } from "utils/dateFunctions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { hyphenateText } from "utils/textFunctions"
import {
	createVideoFallacy,
	fetchFallacy,
	reset,
	retractLogic,
	saveScreenshot,
	toggleCreateMode,
	updateFallacy,
	uploadBackgroundPic
} from "redux/actions/fallacy"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import {
	EmailShareButton,
	FacebookShareButton,
	RedditShareButton,
	TwitterShareButton
} from "react-share"
import { Button, Card, Container, Divider, Header, Icon, Image, List } from "semantic-ui-react"
import { confetti } from "dom-confetti"
import { toast } from "react-toastify"
import { getConfig } from "options/toast"
import DefaultLayout from "layouts"
import FallacyComments from "components/secondary/comments/v1/"
import FallacyExample from "components/primary/fallacyExample/v1/"
import FallaciesList from "components/secondary/lists/fallaciesList/v1/"
import FallacyRef from "components/primary/fallacyRef/v1/"
import html2canvas from "html2canvas"
import ImagePic from "images/images/image-square.png"
import LazyLoad from "components/primary/lazyLoad/v1/"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Component, Fragment } from "react"
import ReactPlayer from "react-player"
import store from "store"
import TagsCard from "components/primary/tagsCard/v1/"
import TitleHeader from "components/primary/titleHeader/v1/"
import TrumpImg from "images/trump-white.png"

toast.configure(getConfig())

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
			id,
			twitterId,
			userId,
			value: "",
			youtubeId
		}
	}

	captureScreenshot = () => {
		const { createdAt, fallacyName, id, refId, user } = this.props
		const filename = `${fallacyName}-by-${user.name}-${createdAt}`
		let duration = ""
		let el = "fallacyMaterial"

		this.setState({ downloading: true }, () => {
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

			if (this.props.canMakeVideo) {
				duration = document.getElementById("fallacyDateDiff").textContent
				el = this.props.screenshotEl
			}

			html2canvas(document.getElementById(el), {
				allowTaint: true,
				scale: 2,
				scrollX: -1,
				scrollY: -window.scrollY,
				useCORS: true
			}).then(canvas => {
				const ctx = canvas.getContext("2d")
				ctx.globalAlpha = 1
				const img = canvas.toDataURL("image/png")

				if (this.props.canScreenshot) {
					this.props.saveScreenshot({
						id,
						img,
						slug: this.props.slug
					})

					let link = document.createElement("a")
					link.download = `${hyphenateText(filename)}.png`
					link.href = img
					link.click()

					this.setState({ downloading: false })
				} else if (this.props.canMakeVideo) {
					this.props.toggleCreateMode()

					this.props.createVideoFallacy({
						contradiction: this.props.contradictionPayload,
						duration,
						id,
						img,
						original: this.props.originalPayload,
						refId
					})
				}
			})
		})
	}

	componentDidMount() {
		this.props.reset()
		this.props.fetchFallacy({
			bearer: this.state.bearer,
			id: this.state.id
		})
	}

	componentDidUpdate(prevProps) {
		if (prevProps !== this.props) {
			let newId = this.props.match.params.id
			if (isNaN(newId)) {
				const split = newId.split("-")
				newId = split[split.length - 1]
			}

			if (newId !== this.state.id) {
				this.props.reset()
				this.props.fetchFallacy({
					bearer: this.state.bearer,
					id: newId
				})
				this.setState({ id: newId })
			}

			this.setState({
				exportOpt: this.props.canMakeVideo ? "video" : "screenshot"
			})
		}
	}

	handleHide = () => this.setState({ active: false })

	handleShow = () => this.setState({ active: true })

	onChange = value => {
		this.setState({ value })
		if (this.props.onChange) {
			this.props.onChange(value.toString("html"))
		}
	}

	retractLogic = () => {
		const button = document.querySelector(".retractBtn")
		confetti(button, {
			angle: 90,
			colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
			dragFriction: 0.1,
			duration: 3000,
			elementCount: 50,
			height: "12px",
			spread: "45",
			stagger: 0,
			startVelocity: 45,
			width: "12px"
		})

		this.props.retractLogic({
			bearer: this.state.bearer,
			id: this.state.id,
			type: this.props.user.type
		})
	}

	render() {
		const { auth, bearer, downloading, id, twitterId, userId, youtubeId } = this.state
		const { createdBy, user } = this.props

		const canEdit = createdBy ? createdBy.id === userId || createdBy.id === 6 : false

		let userLink = ""
		if (user) {
			userLink = `/pages/${user.type}/${user.type === "twitter" ? user.username : user.id}`
		}

		const CommentsSection = props => (
			<div className="commentsContent">
				{props.id && (
					<div>
						<Header inverted size="large">
							Comments
						</Header>
						<FallacyComments
							allowReplies
							authenticated={auth}
							bearer={bearer}
							history={props.history}
							id={props.id}
							showEmptyMsg={false}
						/>
					</div>
				)}
			</div>
		)

		const FallacyTitle = ({ props }) => {
			if (props.id) {
				const subheader = <div>{props.viewCount} views</div>
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
			return null
		}

		const MaterialSection = props => (
			<div className="materialWrapper" id="materialWrapper">
				{props.id ? (
					<div>
						{props.canScreenshot ? (
							<div>
								<FallacyExample
									bearer={bearer}
									creator={props.createdBy}
									downloading={downloading}
									canEdit={canEdit}
									history={props.history}
									id={id}
									updatedAt={props.createdAt}
								/>
								{SourcesSection(props)}
								{ReferenceSection}
							</div>
						) : (
							<div>
								{props.id && (
									<div>
										{props.s3Link && props.canMakeVideo ? (
											<div>
												<ReactPlayer
													className="exportEmbed"
													controls
													url={props.s3Link}
												/>
											</div>
										) : (
											<Image centered size="large" src={ImagePic} />
										)}
										<FallacyExample
											bearer={bearer}
											canEdit={canEdit}
											downloading={downloading}
											history={props.history}
											id={id}
											showMaterial={false}
										/>
										{SourcesSection(props)}
										{ReferenceSection}
									</div>
								)}
							</div>
						)}
						<canvas id="materialCanvas" />
					</div>
				) : (
					<div>
						<LazyLoad header={false} segment={false} />
						<LazyLoad header={false} segment={false} />
						<LazyLoad header={false} segment={false} />
						<LazyLoad header={false} segment={false} />
					</div>
				)}
			</div>
		)

		const ReferenceSection = (
			<div className="fallacyContent">
				{this.props.id ? (
					<div>
						<Header inverted size="large">
							Reference
						</Header>
						<div
							onClick={() =>
								this.props.history.push(
									`/fallacies/${hyphenateText(this.props.fallacyName)}`
								)
							}
							style={{ cursor: "pointer" }}
						>
							<FallacyRef
								canScreenshot={false}
								id={this.props.fallacyId}
								showDialogue={false}
								size="medium"
							/>
						</div>
					</div>
				) : (
					<LazyLoad header={false} />
				)}
			</div>
		)

		const RetractionSegment = props => (
			<div className="retractionContent">
				{props.user ? (
					<div>
						<Header inverted size="large">
							Retraction
						</Header>
						<Container className="retractionContainer">
							<Card className="retractionCard" fluid>
								<Card.Content>
									<Image
										bordered
										circular
										floated="right"
										onClick={() => props.history.push(userLink)}
										onError={i => (i.target.src = ImagePic)}
										size="mini"
										src={props.user.img}
									/>
									<Card.Header className="big retractionHeader">
										{props.retracted ? (
											<div>Retracted</div>
										) : (
											<div>Still waiting for a retraction...</div>
										)}
									</Card.Header>
									<Card.Meta>
										{props.retracted ? (
											<div>Nice work, {props.createdBy.name}</div>
										) : (
											<div>
												<Icon inverted name="clock outline" />
												waiting for{" "}
												<Moment
													ago
													date={adjustTimezone(props.createdAt)}
													fromNow
													interval={60000}
												/>
											</div>
										)}
									</Card.Meta>
									<Card.Description>
										{props.retracted ? (
											<div>
												<Link to={userLink}>{props.user.name}</Link> has
												admitted that this is poor reasoning.
											</div>
										) : props.user.id === twitterId ||
										  props.user.id === youtubeId ? (
											<div>
												<p>
													{props.user.name}, this is an opportunity to
													show your followers that you have enough courage
													to admit that you were wrong.
												</p>
											</div>
										) : (
											<p>
												<Link to={userLink}>{props.user.name}</Link>, if you
												have the courage to admit that you're wrong, please{" "}
												<Link to="/signin">sign in</Link> to retract this.
											</p>
										)}
									</Card.Description>
								</Card.Content>
								<Card.Content extra>
									{props.retracted ? (
										<Button active color="green" fluid>
											<Icon name="checkmark" />
											Retracted
										</Button>
									) : props.user.id === twitterId ||
									  props.user.id === youtubeId ? (
										<Button
											className="retractBtn"
											fluid
											negative
											onClick={this.retractLogic}
										>
											Retract
										</Button>
									) : (
										<Button disabled fluid negative>
											Retract
										</Button>
									)}
								</Card.Content>
							</Card>
						</Container>
						<Divider hidden />
					</div>
				) : (
					<LazyLoad header={false} />
				)}
			</div>
		)

		const ShareSection = useHeader => {
			return (
				<div className="shareContent">
					{useHeader && (
						<Header inverted size="large">
							Share
						</Header>
					)}
					{this.props.id ? (
						<List className="shareList" horizontal size="large">
							<List.Item>
								<FacebookShareButton
									url={`${window.location.origin}/fallacies/${id}`}
								>
									<Button
										circular
										color="facebook"
										icon="facebook f"
										size="big"
									/>
								</FacebookShareButton>
							</List.Item>
							<List.Item>
								<TwitterShareButton
									title={this.props.pageTitle}
									url={`${window.location.origin}/fallacies/${id}`}
								>
									<Button circular color="twitter" icon="twitter" size="big" />
								</TwitterShareButton>
							</List.Item>
							<List.Item>
								<RedditShareButton
									url={`${window.location.origin}/fallacies/${id}`}
								>
									<Button
										circular
										className="redditBtn"
										icon="reddit alien"
										size="big"
									/>
								</RedditShareButton>
							</List.Item>
							<List.Item>
								<CopyToClipboard
									onCopy={() => toast.success("Copied")}
									text={`${window.location.origin}/fallacies/${id}`}
								>
									<div>
										<Button circular color="red" icon="paperclip" size="big" />{" "}
									</div>
								</CopyToClipboard>
							</List.Item>
							<List.Item>
								<EmailShareButton
									body={this.props.explanation}
									subject={this.props.title}
									url={`${window.location.origin}/fallacies/${id}`}
								>
									<Button circular color="blue" icon="mail" size="big" />
								</EmailShareButton>
							</List.Item>
							{this.props.canScreenshot && (
								<List.Item>
									<Button
										circular
										className="screenshotButton"
										color="olive"
										icon="camera"
										loading={downloading}
										onClick={this.captureScreenshot}
										size="big"
										style={{ verticalAlign: "none" }}
									/>
								</List.Item>
							)}
						</List>
					) : (
						<LazyLoad header={false} />
					)}
				</div>
			)
		}

		const SimilarSection = props => {
			if (props.id) {
				return (
					<div className="similarContent">
						<Header inverted size="large">
							{props.similarSearchType === "page" && (
								<div>
									More hot takes from <Link to={userLink}>{props.user.name}</Link>
								</div>
							)}
							{props.similarSearchType === "fallacy_type" && "Similar Fallacies"}
						</Header>
						<FallaciesList
							assignedTo={props.similarSearchType === "page" ? props.user.id : null}
							emptyMsgContent="There are no similar fallacies"
							exclude={[props.id]}
							fallacyId={
								props.similarSearchType === "fallacy_type" ? props.fallacyId : null
							}
							history={props.history}
							icon="warning sign"
							itemsPerRow={2}
							shuffle={true}
							source="fallacy"
							usePics={false}
						/>
					</div>
				)
			}
			return null
		}

		const SourcesSection = props => {
			const refId = props.refId
			const rawSources = refId === 1 || refId === 2
			return (
				<div className="sourcesContent">
					<Header inverted size="large">
						Sources
					</Header>
					<FallacyExample
						bearer={bearer}
						canEdit={canEdit}
						history={this.props.history}
						id={id}
						rawSources={rawSources}
						showExplanation={false}
					/>
				</div>
			)
		}

		const tags = () => {
			if (this.props.tag_ids === null || this.props.tag_names === null) {
				return []
			}
			return mapIdsToNames(this.props.tag_ids, this.props.tag_names)
		}

		return (
			<Provider store={store}>
				<div className="fallacyPage">
					<DisplayMetaTags page="fallacy" props={this.props} state={this.state} />

					<DefaultLayout
						activeItem="fallacy"
						containerClassName="fallacyPage"
						history={this.props.history}
					>
						{!this.props.error ? (
							<Fragment>
								<FallacyTitle props={this.props} />
								{MaterialSection(this.props)}
								{this.props.id && (
									<Fragment>
										{RetractionSegment(this.props)}
										{ShareSection(true)}
										<TagsCard
											bearer={bearer}
											canEdit={canEdit}
											history={this.props.history}
											id={this.props.id}
											tags={tags()}
											type="fallacy"
										/>
										{CommentsSection(this.props)}
										{SimilarSection(this.props)}
									</Fragment>
								)}
							</Fragment>
						) : (
							<Fragment>
								<Image
									centered
									className="trumpImg404"
									size="medium"
									src={TrumpImg}
								/>
								<Header inverted size="large" textAlign="center">
									This fallacy does not exist!
								</Header>
							</Fragment>
						)}
					</DefaultLayout>
				</div>
			</Provider>
		)
	}
}

Fallacy.propTypes = {
	backgroundImg: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
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
	lastUpdated: PropTypes.string,
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
	s3Updated: PropTypes.string,
	saveScreenshot: PropTypes.func,
	similarCount: PropTypes.number,
	similarSearchType: PropTypes.string,
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
	viewCount: PropTypes.number,
	uploadBackgroundPic: PropTypes.func
}

Fallacy.defaultProps = {
	backgroundImg: false,
	creating: false,
	convoLoading: true,
	createVideoFallacy,
	error: false,
	fallacyCount: 0,
	fetchFallacy,
	reset,
	retractLogic,
	saveScreenshot,
	tag_ids: "",
	tag_names: "",
	thumbnailImg: "https://s3.amazonaws.com/blather22/thumbnail.jpg",
	toggleCreateMode,
	uploadBackgroundPic
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.fallacy,
		...ownProps
	}
}

export default connect(mapStateToProps, {
	createVideoFallacy,
	fetchFallacy,
	reset,
	retractLogic,
	saveScreenshot,
	toggleCreateMode,
	updateFallacy,
	uploadBackgroundPic
})(Fallacy)
