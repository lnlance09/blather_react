import "pages/css/index.css"
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
	toggleLoading,
	updateDescription,
	updateTag
} from "./actions/tag"
import Moment from "react-moment"
import { connect, Provider } from "react-redux"
import {
	Button,
	Card,
	Container,
	Divider,
	Form,
	Header,
	Icon,
	Image,
	Input,
	List,
	Menu,
	Message,
	Segment,
	TextArea
} from "semantic-ui-react"
import Dropzone from "react-dropzone"
import FallaciesList from "components/fallaciesList/v1/"
import ImageMasonry from "react-image-masonry"
import ImagePic from "images/image-square.png"
import Lightbox from "react-image-lightbox"
import Marked from "marked"
import LazyLoad from "components/lazyLoad/v1/"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import TitleHeader from "components/titleHeader/v1/"
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

		this.onChangeDescription = this.onChangeDescription.bind(this)
		this.onChangeRelatedSearchVal = this.onChangeRelatedSearchVal.bind(this)
		this.onClickEdit = this.onClickEdit.bind(this)
		this.onDrop = this.onDrop.bind(this)
		this.setVersion = this.setVersion.bind(this)
		this.updateTag = this.updateTag.bind(this)
	}

	componentDidMount() {
		window.scrollTo({ top: 0, behavior: "smooth" })
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

	scrollToTop() {
		const element = document.getElementsByClassName("examplesContent")
		element[0].scrollIntoView({ behavior: "smooth" })
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
					<Form as={Segment}>
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
				return <div className="tagDescription">There is no description yet...</div>
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
						<Header size="large">Notable instances</Header>
						<FallaciesList
							assignedTo={assignedTo}
							emptyMsgContent="There are no instances of this platitude"
							history={props.history}
							icon="warning sign"
							itemsPerRow={3}
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
				<Header size="large">Platitudes thru imagery</Header>
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
						<Message content="There are no images yet" />
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
						/>
					)}
				</div>
				{authenticated && (
					<Dropzone className="dropdown" onDrop={this.onDrop}>
						{({ getRootProps, getInputProps }) => (
							<div {...getRootProps()}>
								<input {...getInputProps()} />
								<Button
									circular
									color="green"
									icon="camera"
									style={{ marginTop: "10px" }}
								/>
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
							size="mini"
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
				<Header size="large">Other platitudes</Header>
				<Input
					fluid
					icon="search"
					onChange={this.onChangeRelatedSearchVal}
					placeholder="Search..."
					value={relatedSearchVal}
					size="large"
				/>
				<Card.Group className="tagsList" itemsPerRow={3} stackable>
					{RenderTags(props)}
				</Card.Group>
			</div>
		)

		const RenderTags = props =>
			props.relatedTags.map(tag => (
				<Card
					key={tag.id}
					onClick={() => {
						this.setState({ id: tag.id })
						props.toggleLoading()
						props.history.push(`/tags/${tag.id}`)
						window.scrollTo({ top: 0, behavior: "smooth" })
					}}
					raised={parseInt(tag.id, 10) === parseInt(props.id, 10)}
				>
					<Card.Content>
						<Card.Header>{tag.value}</Card.Header>
						<Card.Meta>{tag.count} examples</Card.Meta>
					</Card.Content>
				</Card>
			))

		const TagMenu = props => (
			<Menu borderless className="tagMenu" color="blue" pointing secondary size="large">
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
							<EditButton props={this.props} />
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
				<div className="tagsPage">
					<DisplayMetaTags page="tags" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					{!this.props.error ? (
						<Container className="mainContainer" textAlign="left">
							<TagTitle props={this.props} />
							{this.props.loading ? (
								<div style={{ marginTop: "10px" }}>
									<LazyLoad header={false} />
									<LazyLoad header={false} />
								</div>
							) : (
								<div className="tagsWrapper">
									{TagMenu(this.props)}
									{activeItem === "article" && (
										<div>{ArticleSection(this.props)}</div>
									)}

									{activeItem === "history" && (
										<Segment>
											<List divided relaxed>
												{HistorySection(this.props)}
											</List>
										</Segment>
									)}

									<Divider horizontal />
									{GallerySection(this.props)}

									<Divider horizontal />
									{ExamplesSection(this.props)}

									<Divider horizontal />
									{RelatedSection(this.props)}
								</div>
							)}
						</Container>
					) : (
						<Container className="mainContainer" text textAlign="center">
							<Image centered className="trumpImg404" size="medium" src={TrumpImg} />
							<Header size="medium">This tag does not exist!</Header>
						</Container>
					)}
					<PageFooter />
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

export default connect(
	mapStateToProps,
	{
		addPic,
		fetchHistory,
		fetchTaggedUsers,
		fetchTagInfo,
		getRelatedTags,
		toggleLoading,
		updateDescription,
		updateTag
	}
)(Tag)
