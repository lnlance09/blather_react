import "pages/css/index.css"
import { adjustTimezone } from "utils/dateFunctions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { sanitizeText } from "utils/textFunctions"
import {
	addPic,
	fetchHistory,
	fetchTaggedUsers,
	fetchTagInfo,
	getRelatedTags,
	updateDescription,
	updateTag
} from "./actions/tag"
import Moment from "react-moment"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Container,
	Divider,
	Form,
	Grid,
	Header,
	Icon,
	Image,
	Input,
	List,
	Menu,
	Modal,
	Responsive,
	Segment,
	TextArea
} from "semantic-ui-react"
import Dropzone from "react-dropzone"
import FallaciesList from "components/fallaciesList/v1/"
import Gallery from "react-grid-gallery"
import ImagePic from "images/image-square.png"
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
			caption: "",
			description: "",
			editing: false,
			id,
			img: false,
			files: [],
			modalVisible: false,
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

		this.onChangeCaption = this.onChangeCaption.bind(this)
		this.onChangeDescription = this.onChangeDescription.bind(this)
		this.onChangeRelatedSearchVal = this.onChangeRelatedSearchVal.bind(this)
		this.onClickEdit = this.onClickEdit.bind(this)
		this.onDrop = this.onDrop.bind(this)
		this.setVersion = this.setVersion.bind(this)
		this.updateTag = this.updateTag.bind(this)
		this.updloadPic = this.uploadPic.bind(this)
	}

	componentDidMount() {
		window.scrollTo({ top: 0, behavior: "smooth" })
		this.props.fetchTagInfo({ id: this.state.id })
		this.props.fetchTaggedUsers({ id: this.state.id })
	}

	handleHide = () => this.setState({ active: false })

	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name })
		if (name === "history") {
			this.props.fetchHistory({ id: this.props.id })
		}
	}

	handleShow = () => this.setState({ active: true })

	onChangeCaption = (e, { value }) => this.setState({ caption: value })

	onChangeDescription = (e, { value }) => this.setState({ description: value })

	onChangeRelatedSearchVal = (e, { value }) => {
		this.setState({ relatedSearchVal: value })
		this.props.getRelatedTags({ q: value})
	}

	onClickEdit = () => {
		this.setState({
			description: this.props.description,
			editing: this.state.editing === false
		})
	}

	onDrop = files => {
		if (files.length > 0) {
			this.setState({ files })
			files.forEach(file => {
				this.setState({ img: URL.createObjectURL(file) })
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

	toggleModal = () => this.setState({ modalVisible: !this.state.modalVisible })

	updateTag = () => {
		this.setState({ editing: false })
		this.props.updateTag({
			bearer: this.state.bearer,
			id: this.props.id,
			description: this.state.description
		})
	}

	uploadPic = () => {
		this.props.addPic({
			bearer: this.state.bearer,
			caption: this.state.caption,
			file: this.state.files[0],
			id: this.props.id
		})
		this.toggleModal()
		this.setState({
			caption: "",
			img: false
		})
	}

	render() {
		const {
			activeItem,
			assignedTo,
			authenticated,
			bearer,
			caption,
			description,
			editing,
			id,
			img,
			modalVisible,
			relatedSearchVal,
			version
		} = this.state

		const ArticleSection = props => {
			if (editing) {
				return (
					<Form onSubmit={this.updateTag}>
						<Form.Field>
							<TextArea
								onChange={this.onChangeDescription}
								rows={15}
								value={description}
							/>
						</Form.Field>
						<Button color="blue" content="Update" fluid type="submit" />
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

		const ExamplesSection = ({ props }) => {
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
							useCards
						/>
					</div>
				)
			}
			return null
		}

		const GallerySection = props => (
			<div>
				{props.images.length > 0 && (
					<div className="galleryContent">
						<Header size="large">Talking points thru imagery</Header>
						<Segment>
							<div className="galleryWrapper">
								<Gallery images={props.images} />
								<div className="clearfix" />
							</div>
						</Segment>
						{authenticated && (
							<Button circular color="green" icon="camera" onClick={() => this.toggleModal()} />
						)}
					</div>
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

		const PicModal = props => {
			return (
				<Modal
					centered={false}
					className="tagPicModal"
					closeIcon
					onClose={() => this.toggleModal()}
					open={modalVisible}
					size="small"
				>
					<Modal.Header>Add a Photo</Modal.Header>
					<Modal.Content image>
						<Form>
							{TagPic(props)}
							<Form.TextArea
								onChange={this.onChangeCaption}
								placeholder="Caption..."
								value={caption}
							/>
							<Button
								color="blue"
								content="Upload"
								fluid
								onClick={() => this.uploadPic()}
							/>
						</Form>
					</Modal.Content>
				</Modal>
			)
		}

		const RenderTags = props => (
			props.relatedTags.map(tag => (
				<List.Item
					onClick={() => {
						window.scrollTo({ top: 0, behavior: "smooth" })
						this.setState({ id: tag.id })
						this.props.fetchTagInfo({ id: tag.id })
						this.props.fetchTaggedUsers({ id: tag.id })
					}}
				>
					<List.Content>
						<List.Header as="a">
							{tag.value}
						</List.Header>
						<List.Description as="a">{tag.count} examples</List.Description>
					</List.Content>
				</List.Item>
			))
		)

		const RenderUsers = props => (
			props.users.map(user => (
				<List.Item>
					<Image
						bordered
						circular
						className="userPic"
						onError={i => (i.target.src = ImagePic)}
						rounded
						size="tiny"
						src={user.img}
					/>
					<List.Content>
						<List.Header
							as="a"
							onClick={() => {
								this.scrollToTop()
								this.setState({ assignedTo: user.value })
							}}
						>
							{user.name}
						</List.Header>
						<List.Description>
							{user.count} time{user.count !== "1" && "s"}
						</List.Description>
					</List.Content>
				</List.Item>
			))
		)

		const TagMenu = props => (
			<Menu borderless className="tagMenu" pointing secondary>
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

		const TagPic = props => {
			if (!img) {
				return (
					<Container fluid>
						<Dropzone className="dropdown" onDrop={this.onDrop}>
							{({ getRootProps, getInputProps }) => (
								<div {...getRootProps()}>
									<input {...getInputProps()} />
									<Header color="blue">Select a pic</Header>
								</div>
							)}
						</Dropzone>
					</Container>
				)
			}

			return (
				<Image
					bordered
					centered
					className="tagModalPic"
					onError={i => (i.target.src = ImagePic)}
					rounded
					src={img}
				/>
			)
		}

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
					canEdit={false}
					id={id}
					subheader={subheader}
					textAlign="left"
					title={props.name}
					type="tag"
				/>
			)
		}

		const UsersSection = props => (
			<div className="usersContent">
				<Grid stackable>
					<Grid.Column width={8}>
						<Header size="large" textAlign="center">Mentions</Header>
						<Responsive maxWidth={1024}>
							<List divided relaxed>
								{RenderUsers(props)}
							</List>
						</Responsive>
						<Responsive minWidth={1025}>
							<List divided relaxed size="big">
								{RenderUsers(props)}
							</List>
						</Responsive>
					</Grid.Column>
					<Grid.Column width={8}>
						<Header size="large" textAlign="center">Other platitudes</Header>
						<Input
							fluid
							icon="search"
							onChange={this.onChangeRelatedSearchVal}
							placeholder="Search..."
							relatedSearchVal={relatedSearchVal}
						/>
						<Responsive maxWidth={1024}>
							<List className="tagsList" divided relaxed>
								{RenderTags(props)}
							</List>
						</Responsive>
						<Responsive minWidth={1025}>
							<List className="tagsList" divided relaxed size="big">
								{RenderTags(props)}
							</List>
						</Responsive>
					</Grid.Column>
				</Grid>
			</div>
		)

		return (
			<Provider store={store}>
				<div className="tagsPage">
					<DisplayMetaTags page="tags" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					{!this.props.error ? (
						<Container className="mainContainer" textAlign="left">
							<TagTitle props={this.props} />
							{this.props.loading ? (
								<div>
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
									{UsersSection(this.props)}
									{GallerySection(this.props)}
									<ExamplesSection props={this.props} />

									{PicModal(this.props)}
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
	relatedTags: PropTypes.array,
	updateDescription: PropTypes.func,
	updateTag: PropTypes.func,
	users: PropTypes.array
}

Tag.defaultProps = {
	addPic,
	editHistory: [],
	fetchHistory,
	fetchTaggedUsers,
	fetchTagInfo,
	getRelatedTags,
	images: [],
	loading: true,
	relatedTags: [],
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
		updateDescription,
		updateTag
	}
)(Tag)
