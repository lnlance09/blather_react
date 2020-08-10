import "react-image-lightbox/style.css"
import { adjustTimezone } from "utils/dateFunctions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { sanitizeText } from "utils/textFunctions"
import {
	addPic,
	fetchHistory,
	fetchTaggedUsers,
	fetchTagInfo,
	getRelatedTags,
	reset,
	toggleLoading,
	updateDescription,
	updateTag
} from "redux/actions/tag"
import Moment from "react-moment"
import { connect, Provider } from "react-redux"
import {
	Button,
	Card,
	Divider,
	Form,
	Header,
	Icon,
	Image,
	Input,
	List,
	Menu,
	Segment,
	TextArea
} from "semantic-ui-react"
import DefaultLayout from "layouts"
import Dropzone from "react-dropzone"
import FallaciesList from "components/secondary/lists/fallaciesList/v1/"
import ImageMasonry from "react-image-masonry"
import ImagePic from "images/images/image-square.png"
import Lightbox from "react-image-lightbox"
import Marked from "marked"
import LazyLoad from "components/primary/lazyLoad/v1/"
import PropTypes from "prop-types"
import React, { Component, Fragment } from "react"
import store from "store"
import TitleHeader from "components/primary/titleHeader/v1/"
import TrumpImg from "images/trump-white.png"

class Tag extends Component {
	constructor(props) {
		super(props)
		let id = this.props.match.params.id
		if (isNaN(id)) {
			const split = id.split("-")
			id = split[split.length - 1]
		}

		const currentState = store.getState()
		const authenticated = currentState.user.authenticated
		const bearer = currentState.user.bearer
		const userId = parseInt(currentState.user.data.id, 10)

		this.state = {
			activeItem: "article",
			assignedTo: null,
			authenticated,
			bearer,
			description: "",
			editing: false,
			id,
			isOpen: false,
			photoIndex: 0,
			relatedSearchVal: "",
			userId
		}

		Marked.setOptions({
			renderer: new Marked.Renderer(),
			highlight: function(code) {
				// return require('highlight.js').highlightAuto(code).value;
			},
			pedantic: false,
			breaks: false,
			sanitize: false,
			smartLists: true,
			smartypants: false,
			xhtml: false
		})
	}

	componentDidMount() {
		this.props.toggleLoading()
		this.props.fetchTagInfo({ id: this.state.id })
		this.props.fetchTaggedUsers({ id: this.state.id })
	}

	componentWillUpdate(nextProps) {
		let id = nextProps.match.params.id
		if (isNaN(id)) {
			const split = id.split("-")
			id = parseInt(split[split.length - 1], 10)
		} else {
			id = parseInt(id, 10)
		}

		if (id !== this.props.id && !this.props.loading) {
			this.props.fetchTagInfo({ id })
			this.props.fetchTaggedUsers({ id })
		}
	}

	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name })
		if (name === "history") {
			this.props.fetchHistory({ id: this.props.id })
		}
	}

	onChangeDescription = (e, { value }) => this.setState({ description: value })

	onChangeRelatedSearchVal = (e, { value }) => {
		this.setState({ relatedSearchVal: value })
		this.props.getRelatedTags({ q: value })
	}

	onClickEdit = () => {
		this.setState({
			description: this.props.description,
			editing: this.state.editing === false
		})
	}

	onDrop = files => {
		if (files.length > 0) {
			files.forEach(file => {
				this.props.addPic({
					bearer: this.state.bearer,
					file,
					id: this.props.id
				})
			})
		}
	}

	setVersion = edit => {
		this.setState({
			activeItem: "article",
			editing: false,
			version: edit.version
		})
		this.props.updateDescription({ description: edit.description })
	}

	updateTag = () => {
		this.setState({ editing: false })
		this.props.updateTag({
			bearer: this.state.bearer,
			id: this.props.id,
			description: this.state.description
		})
	}

	render() {
		const {
			activeItem,
			assignedTo,
			authenticated,
			bearer,
			description,
			editing,
			isOpen,
			photoIndex,
			relatedSearchVal,
			version
		} = this.state
		const { images, rawImages } = this.props

		const ArticleSection = props => {
			if (editing) {
				return (
					<Form inverted>
						<Form.Field>
							<TextArea
								onChange={this.onChangeDescription}
								rows={15}
								value={description}
							/>
						</Form.Field>
						<Button color="blue" content="Update" fluid onClick={this.updateTag} />
					</Form>
				)
			}

			if (props.description === null) {
				return (
					<Segment inverted placeholder>
						<Header icon inverted>
							<Icon name="warning sign" />
							This tag is empty
						</Header>
						{!authenticated && (
							<Button
								color="yellow"
								inverted
								onClick={() => props.history.push("/signin")}
							>
								<Icon color="yellow" inverted name="pencil" />
								Edit this article
							</Button>
						)}
					</Segment>
				)
			}

			return (
				<div
					className="tagDescription"
					dangerouslySetInnerHTML={{
						__html: sanitizeText(Marked(props.description))
					}}
				/>
			)
		}

		const EditButton = ({ props }) => {
			if (!props.loading) {
				if (authenticated) {
					return (
						<div className="editButtonWrapper">
							<Icon
								className={`editButton ${editing ? "editing" : ""}`}
								inverted
								name={editing ? "close" : "pencil"}
								onClick={this.onClickEdit}
							/>
						</div>
					)
				}
			}
			return null
		}

		const ExamplesSection = props => {
			if (props.id) {
				return (
					<div className="examplesContent">
						<Header inverted size="large">
							Notable instances
						</Header>
						<FallaciesList
							assignedTo={assignedTo}
							emptyMsgContent="There are no instances of this platitude"
							history={props.history}
							icon="warning sign"
							itemsPerRow={2}
							size="large"
							source="tag"
							tagId={props.id}
						/>
					</div>
				)
			}
			return null
		}

		const GallerySection = props => (
			<div className="galleryContent">
				<div className="galleryWrapper">
					{images.length > 0 ? (
						<ImageMasonry animate forceOrder numCols={3}>
							{images.map((img, i) => (
								<div
									className="tile"
									key={i}
									onClick={() => {
										this.setState({
											isOpen: true,
											photoIndex: i
										})
									}}
								>
									<img alt={img.src} src={img.src} />
								</div>
							))}
						</ImageMasonry>
					) : (
						<Segment inverted placeholder>
							<Header icon inverted>
								<Icon color="blue" inverted name="image" />
								There are no images yet
							</Header>
						</Segment>
					)}

					{isOpen && (
						<Lightbox
							mainSrc={rawImages[photoIndex]}
							nextSrc={rawImages[(photoIndex + 1) % rawImages.length]}
							onCloseRequest={() => this.setState({ isOpen: false })}
							onMoveNextRequest={() =>
								this.setState({
									photoIndex: (photoIndex + 1) % rawImages.length
								})
							}
							onMovePrevRequest={() =>
								this.setState({
									photoIndex:
										(photoIndex + rawImages.length - 1) % rawImages.length
								})
							}
							prevSrc={
								rawImages[(photoIndex + rawImages.length - 1) % rawImages.length]
							}
							reactModalStyle={{
								content: {
									top: "70px"
								}
							}}
						/>
					)}
				</div>
				{authenticated && (
					<Dropzone className="dropdown" onDrop={this.onDrop}>
						{({ getRootProps, getInputProps }) => (
							<div {...getRootProps()}>
								<input {...getInputProps()} />
								<Divider horizontal>
									<Icon
										circular
										className="cameraIcon"
										name="camera"
										size="big"
									/>
								</Divider>
							</div>
						)}
					</Dropzone>
				)}
			</div>
		)

		const HistorySection = props => {
			return props.editHistory.map((edit, i) => {
				return (
					<List.Item
						className={`${version === edit.version ? "selected" : null}`}
						key={`editHistory${i}`}
						onClick={() => this.setVersion(edit)}
					>
						<Image
							avatar
							onError={i => (i.target.src = ImagePic)}
							src={edit.user_img}
						/>
						<List.Content>
							<List.Header as="a">{edit.user_name}</List.Header>
							<List.Description>
								Edited <Moment date={adjustTimezone(edit.date_updated)} fromNow />
							</List.Description>
						</List.Content>
					</List.Item>
				)
			})
		}

		const RelatedSection = props => (
			<div className="relatedContent">
				<Header inverted size="large">
					Other tags
				</Header>
				<Input
					fluid
					icon="search"
					inverted
					onChange={this.onChangeRelatedSearchVal}
					placeholder="Search..."
					value={relatedSearchVal}
					size="large"
				/>
				<Card.Group className="tagsList" itemsPerRow={2} stackable>
					{RenderTags(props)}
				</Card.Group>
			</div>
		)

		const RenderTags = props =>
			props.relatedTags.map(tag => {
				const selected = parseInt(tag.id, 10) === parseInt(props.id, 10)
				return (
					<Card
						color={selected ? "blue" : null}
						key={tag.id}
						onClick={() => {
							if (!selected) {
								props.reset()
								props.toggleLoading()
								props.history.push(`/tags/${tag.id}`)
							}
						}}
						raised={selected}
					>
						<Card.Content>
							<Card.Header>{tag.value}</Card.Header>
							<Card.Meta>{tag.count} examples</Card.Meta>
						</Card.Content>
					</Card>
				)
			})

		const TagMenu = props => (
			<Menu attached="top" className="tagMenu" inverted size="large">
				<Menu.Item
					active={activeItem === "article"}
					name="article"
					onClick={this.handleItemClick}
				/>
				<Menu.Item
					active={activeItem === "history"}
					name="history"
					onClick={this.handleItemClick}
				/>
				{activeItem === "article" && (
					<Menu.Menu position="right">
						<Menu.Item>
							{authenticated ? (
								<EditButton props={this.props} />
							) : (
								<Icon
									color="blue"
									inverted
									name="sign in"
									onClick={() => {
										props.history.push("/signin")
									}}
									style={{ cursor: "pointer" }}
								/>
							)}
						</Menu.Item>
					</Menu.Menu>
				)}
			</Menu>
		)

		const TagTitle = ({ props }) => {
			const subheader = (
				<div className="subHeader">
					{props.createdBy && (
						<div>
							Created{" "}
							<Moment
								date={adjustTimezone(props.dateCreated)}
								fromNow
								interval={60000}
							/>
						</div>
					)}
				</div>
			)
			return (
				<TitleHeader
					bearer={bearer}
					canEdit={false}
					id={props.id}
					subheader={subheader}
					textAlign="left"
					title={props.name}
					type="tag"
				/>
			)
		}

		return (
			<Provider store={store}>
				<div className="tagPage">
					<DisplayMetaTags page="tags" props={this.props} state={this.state} />
					<DefaultLayout
						activeItem="tags"
						containerClassName="tagPage"
						history={this.props.history}
					>
						{!this.props.error ? (
							<Fragment>
								<TagTitle props={this.props} />
								<div className="tagsWrapper">
									{TagMenu(this.props)}
									<Segment attached inverted>
										{this.props.loading ? (
											<div style={{ marginTop: "10px" }}>
												<LazyLoad header={false} />
												<LazyLoad header={false} />
											</div>
										) : (
											<div>
												{activeItem === "article" && (
													<div>{ArticleSection(this.props)}</div>
												)}

												{activeItem === "history" && (
													<List
														divided
														inverted
														relaxed="very"
														size="large"
													>
														{HistorySection(this.props)}
													</List>
												)}

												<Divider inverted section />
												{GallerySection(this.props)}

												<Divider horizontal inverted />
												{ExamplesSection(this.props)}

												<Divider horizontal inverted />
												{RelatedSection(this.props)}
											</div>
										)}
									</Segment>
								</div>
							</Fragment>
						) : (
							<Fragment>
								<Image
									centered
									className="trumpImg404"
									size="medium"
									src={TrumpImg}
								/>
								<Header inverted size="medium">
									This tag does not exist!
								</Header>
							</Fragment>
						)}
					</DefaultLayout>
				</div>
			</Provider>
		)
	}
}

Tag.propTypes = {
	addPic: PropTypes.func,
	createdBy: PropTypes.shape({
		id: PropTypes.number,
		img: PropTypes.string,
		name: PropTypes.string,
		username: PropTypes.string
	}),
	dateCreated: PropTypes.string,
	description: PropTypes.string,
	editHistory: PropTypes.array,
	error: PropTypes.bool,
	fetchHistory: PropTypes.func,
	fetchTaggedUsers: PropTypes.func,
	fetchTagInfo: PropTypes.func,
	getRelatedTags: PropTypes.func,
	id: PropTypes.number,
	images: PropTypes.array,
	img: PropTypes.string,
	loading: PropTypes.bool,
	name: PropTypes.string,
	rawImages: PropTypes.array,
	relatedTags: PropTypes.array,
	reset: PropTypes.func,
	toggleLoading: PropTypes.func,
	updateDescription: PropTypes.func,
	updateTag: PropTypes.func,
	users: PropTypes.array
}

Tag.defaultProps = {
	addPic,
	description: "",
	editHistory: [],
	fetchHistory,
	fetchTaggedUsers,
	fetchTagInfo,
	getRelatedTags,
	images: [],
	loading: false,
	rawImages: [],
	relatedTags: [],
	reset,
	toggleLoading,
	updateDescription,
	updateTag,
	users: []
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.tag,
		...ownProps
	}
}

export default connect(mapStateToProps, {
	addPic,
	fetchHistory,
	fetchTaggedUsers,
	fetchTagInfo,
	getRelatedTags,
	reset,
	toggleLoading,
	updateDescription,
	updateTag
})(Tag)
