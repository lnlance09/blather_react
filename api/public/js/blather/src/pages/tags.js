import "pages/css/index.css"
import { adjustTimezone } from "utils/dateFunctions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { sanitizeText } from "utils/textFunctions"
import { changePic, fetchHistory, fetchTagInfo, updateDescription, updateTag } from "./actions/tag"
import Moment from "react-moment"
import Dropzone from "react-dropzone"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Container,
	Dimmer,
	Form,
	Grid,
	Header,
	Icon,
	Image,
	List,
	Menu,
	Responsive,
	Segment,
	TextArea
} from "semantic-ui-react"
import Marked from "marked"
import defaultImg from "images/trump.svg"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import ParagraphPic from "images/short-paragraph.png"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import TitleHeader from "components/titleHeader/v1/"
import TrumpImg from "images/trump.svg"

class Tags extends Component {
	constructor(props) {
		super(props)
		const id = parseInt(this.props.match.params.id, 10)
		const currentState = store.getState()
		const authenticated = currentState.user.authenticated
		const bearer = currentState.user.bearer
		const userId = parseInt(currentState.user.data.id, 10)
		this.state = {
			active: false,
			activeItem: "article",
			authenticated,
			bearer,
			description: "",
			editing: false,
			id,
			files: [],
			inverted: true,
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

		this.props.fetchTagInfo({ id })

		this.onChangeDescription = this.onChangeDescription.bind(this)
		this.onClickEdit = this.onClickEdit.bind(this)
		this.onDrop = this.onDrop.bind(this)
		this.setVersion = this.setVersion.bind(this)
		this.updateTag = this.updateTag.bind(this)
	}

	handleHide = () => this.setState({ active: false })
	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name })
		if (name === "history") {
			this.props.fetchHistory({ id: this.props.id })
		}
	}
	handleShow = () => this.setState({ active: true })
	onChangeDescription = (e, { value }) => this.setState({ description: value })
	onClickEdit = () => {
		this.setState({
			description: this.props.description,
			editing: this.state.editing === false
		})
	}

	onDrop(files) {
		this.setState({ files })
		if (files.length > 0) {
			this.props.changePic({
				bearer: this.state.bearer,
				file: files[0],
				id: this.state.id
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
			active,
			activeItem,
			authenticated,
			bearer,
			description,
			editing,
			id,
			inverted,
			version
		} = this.state
		const pic = !this.props.img && !this.props.loading ? defaultImg : this.props.img
		const content = (
			<div>
				<Dropzone className="dropzone" onDrop={this.onDrop}>
					<Header as="h2">Change pic</Header>
					<Button color="blue" icon>
						<Icon name="image" />
					</Button>
				</Dropzone>
			</div>
		)
		const ArticleSection = props => {
			if (editing) {
				return (
					<Form onSubmit={this.updateTag}>
						<Form.Field>
							<TextArea
								onChange={this.onChangeDescription}
								rows={25}
								value={description}
							/>
						</Form.Field>
						<Button color="blue" compact content="Update" fluid type="submit" />
					</Form>
				)
			}
			return (
				<div
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
						<Icon
							className={`editButton ${editing ? "editing" : ""}`}
							name={editing ? "close" : "pencil"}
							onClick={this.onClickEdit}
						/>
					)
				}
			}
			return null
		}
		const HistorySection = props => {
			return props.editHistory.map((edit, i) => {
				return (
					<List.Item
						className={`${version === edit.version ? "selected" : null}`}
						key={`editHistory${i}`}
						onClick={() => this.setVersion(edit)}
					>
						<Image size="mini" src={edit.user_img} />
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
		const ProfilePic = props => {
			if (authenticated) {
				return (
					<Dimmer.Dimmable
						as={Image}
						dimmed={active}
						dimmer={{ active, content, inverted }}
						onMouseEnter={this.handleShow}
						onMouseLeave={this.handleHide}
						size="medium"
						src={pic}
					/>
				)
			}
			return <Image src={pic} />
		}
		const TagMenu = props => (
			<Menu className="tagMenu" fluid pointing secondary stackable>
				<Menu.Item
					name="article"
					active={activeItem === "article"}
					onClick={this.handleItemClick}
				/>
				<Menu.Item
					name="history"
					active={activeItem === "history"}
					onClick={this.handleItemClick}
				/>
				<Menu.Menu position="right">
					<Menu.Item>
						<EditButton props={this.props} />
					</Menu.Item>
				</Menu.Menu>
			</Menu>
		)
		const TagTitle = ({ props }) => {
			const subheader = (
				<div className="subHeader">
					{props.createdBy && (
						<div>
							<Icon className="tag" name="tag" /> Created{" "}
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
							<Responsive maxWidth={1024}>
								<Grid>
									<Grid.Row>
										<TagTitle props={this.props} />
										{this.props.loading && (
											<Segment loading>
												<Image fluid src={ParagraphPic} />
												<Image fluid src={ParagraphPic} />
												<Image fluid src={ParagraphPic} />
												<Image fluid src={ParagraphPic} />
												<Image fluid src={ParagraphPic} />
											</Segment>
										)}
									</Grid.Row>
									<Grid.Row>
										{ProfilePic(this.props)}
										{!this.props.loading && (
											<div className="tagsWrapper">
												{TagMenu(this.props)}
												{activeItem === "article" && (
													<div>{ArticleSection(this.props)}</div>
												)}
												{activeItem === "history" && (
													<div>
														<List divided>
															{HistorySection(this.props)}
														</List>
													</div>
												)}
											</div>
										)}
									</Grid.Row>
								</Grid>
							</Responsive>
							<Responsive minWidth={1025}>
								<Grid>
									<Grid.Column className="leftSide" width={4}>
										{ProfilePic(this.props)}
									</Grid.Column>
									<Grid.Column width={12}>
										<TagTitle props={this.props} />
										{this.props.loading ? (
											<Segment loading>
												<Image fluid src={ParagraphPic} />
												<Image fluid src={ParagraphPic} />
												<Image fluid src={ParagraphPic} />
												<Image fluid src={ParagraphPic} />
												<Image fluid src={ParagraphPic} />
											</Segment>
										) : (
											<div className="tagsWrapper">
												{TagMenu(this.props)}
												{activeItem === "article" && (
													<div>{ArticleSection(this.props)}</div>
												)}
												{activeItem === "history" && (
													<div>
														<List divided>
															{HistorySection(this.props)}
														</List>
													</div>
												)}
											</div>
										)}
									</Grid.Column>
								</Grid>
							</Responsive>
						</Container>
					) : (
						<Container className="mainContainer" text textAlign="center">
							<Image centered disabled size="medium" src={TrumpImg} />
							<Header size="medium">This tag does not exist!</Header>
						</Container>
					)}
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Tags.propTypes = {
	changePic: PropTypes.func,
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
	fetchTagInfo: PropTypes.func,
	id: PropTypes.number,
	img: PropTypes.string,
	loading: PropTypes.bool,
	name: PropTypes.string,
	updateDescription: PropTypes.func,
	updateTag: PropTypes.func
}

Tags.defaultProps = {
	changePic: changePic,
	editHistory: [],
	fetchHistory: fetchHistory,
	fetchTagInfo: fetchTagInfo,
	loading: true,
	updateDescription: updateDescription,
	updateTag: updateTag
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
		changePic,
		fetchHistory,
		fetchTagInfo,
		updateDescription,
		updateTag
	}
)(Tags)
