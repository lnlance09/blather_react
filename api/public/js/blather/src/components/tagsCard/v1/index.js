import "./style.css"
import { removeFallacyTag, updateFallacy } from "pages/actions/fallacy"
import { removeDiscussionTag, updateDiscussion } from "pages/actions/discussion"
import { connect, Provider } from "react-redux"
import { Button, Dropdown, Header, Icon, Label, List, Modal } from "semantic-ui-react"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class TagsCard extends Component {
	constructor(props) {
		super(props)
		this.state = {
			edited: false,
			editing: false,
			open: false,
			options: [],
			tags: null
		}

		this.closeModal = this.closeModal.bind(this)
		this.deleteTag = this.deleteTag.bind(this)
		this.handleAddition = this.handleAddition.bind(this)
		this.updateTags = this.updateTags.bind(this)
	}

	closeModal = () => this.setState({ open: false })

	componentDidMount() {
		this.fetchTags()
	}

	deleteTag(id, name) {
		if (this.props.type === "fallacy") {
			this.props.removeFallacyTag({
				bearer: this.props.bearer,
				id: this.props.id,
				tagId: id,
				tagName: name
			})
		}
		if (this.props.type === "discussion") {
			this.props.removeDiscussionTag({
				bearer: this.props.bearer,
				id: this.props.id,
				tagId: id,
				tagName: name
			})
		}
	}

	fetchTags() {
		return fetch(`${window.location.origin}/api/tags/getTags`, {
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(response => {
				if (response.ok) {
					response.json().then(data => {
						this.setState({ options: data.tags })
					})
				}
			})
			.catch(err => console.log(err))
	}

	handleAddition = (e, { value }) =>
		this.setState({
			options: [{ text: value, value }, ...this.state.options]
		})
	handleChange = (e, { value }) => this.setState({ edited: true, tags: value })
	updateTags = () => {
		this.setState({ editing: false, open: false })
		if (this.props.type === "fallacy") {
			this.props.updateFallacy({
				bearer: this.props.bearer,
				id: this.props.id,
				tags: this.state.tags
			})
		}
		if (this.props.type === "discussion") {
			this.props.updateDiscussion({
				bearer: this.props.bearer,
				id: this.props.id,
				tags: this.state.tags
			})
		}
	}

	render() {
		let { open, options, tags } = this.state
		const TagsModal = (
			<Modal
				basic
				centered={false}
				className="tagsModal"
				onClose={this.closeModal}
				open={open}
				size="small"
			>
				<Modal.Header>Add tags</Modal.Header>
				<Modal.Content>
					<Modal.Description>
						<Dropdown
							allowAdditions
							closeOnChange
							fluid
							multiple
							onAddItem={this.handleAddition}
							onChange={this.handleChange}
							options={options}
							placeholder="Tags"
							search
							selection
							value={tags}
						/>
						<Button
							className="tagModalBtn"
							content="Update"
							onClick={this.updateTags}
							primary
						/>
						<div className="clearfix" />
					</Modal.Description>
				</Modal.Content>
			</Modal>
		)
		const RenderTags = this.props.tags.map(tag => (
			<List.Item key={`tag_${tag.name}`}>
				<Label
					color="blue"
					horizontal
					id={tag.id}
					onClick={() => this.props.history.push(`/tags/${tag.id.trim()}`)}
				>
					{tag.name.trim()}
				</Label>
				{this.props.canEdit && (
					<List.Content floated="right">
						<Icon name="close" onClick={() => this.deleteTag(tag.id, tag.name)} />
					</List.Content>
				)}
			</List.Item>
		))
		const ShowTags = props => {
			if (props.tags.length > 0) {
				return (
					<List className="tagsList" relaxed>
						{RenderTags}
					</List>
				)
			}
			return <div>No tags have been added</div>
		}

		return (
			<Provider store={store}>
				<div className="tagsCard">
					<Header size="medium">
						Tags
						{this.props.canEdit && (
							<Icon
								className="editTagsIcon"
								name="pencil"
								onClick={() => this.setState({ open: true })}
							/>
						)}
					</Header>
					{ShowTags(this.props)}
					<div>{TagsModal}</div>
				</div>
			</Provider>
		)
	}
}

TagsCard.propTypes = {
	bearer: PropTypes.string,
	canEdit: PropTypes.bool,
	id: PropTypes.number,
	removeDiscussionTag: PropTypes.func,
	removeFallacyTag: PropTypes.func,
	tags: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
	type: PropTypes.string,
	updateDiscussion: PropTypes.func,
	updateFallacy: PropTypes.func
}

TagsCard.defaultProps = {
	canEdit: false,
	type: "fallacy",
	removeDiscussionTag,
	removeFallacyTag,
	updateDiscussion,
	updateFallacy
}

const mapStateToProps = (state, ownProps) => {
	if (ownProps.type === "fallacy") {
		return {
			...state.fallacy,
			...ownProps
		}
	}
	if (ownProps.type === "discussion") {
		return {
			...state.discussion,
			...ownProps
		}
	}
}

export default connect(
	mapStateToProps,
	{
		removeDiscussionTag,
		removeFallacyTag,
		updateDiscussion,
		updateFallacy
	}
)(TagsCard)
