import "./style.css"
import { removeFallacyTag, updateFallacy } from "redux/actions/fallacy"
import { removeDiscussionTag, updateDiscussion } from "redux/actions/discussion"
import { connect, Provider } from "react-redux"
import { Button, Divider, Dropdown, Form, Header, Icon, Label, Message } from "semantic-ui-react"
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
			tags: null,
			tagsLoaded: false
		}
	}

	componentDidMount() {
		this.fetchTags()
	}

	deleteTag = (id, name) => {
		if (this.props.type === "fallacy") {
			this.props.removeFallacyTag({
				bearer: this.props.bearer,
				callback: () => this.setState({ open: false }),
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

	fetchTags = () => {
		return fetch(`${window.location.origin}/api/tags/getTags`, {
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(response => {
				if (response.ok) {
					response.json().then(data => {
						this.setState({ options: data.tags }, async () => {
							const defaultTags = await this.props.tags.map(t => t.name.trim())
							this.setState({ tags: defaultTags }, () => {
								this.setState({ tagsLoaded: true })
							})
						})
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
		this.setState({ editing: false, open: false }, () => {
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
		})
	}

	render() {
		let { open, options, tags, tagsLoaded } = this.state

		const RenderTags = this.props.tags.map(tag => (
			<Label
				key={`fallacyLabel${tag.id}`}
				onClick={() => {
					if (!open) {
						this.props.history.push(`/tags/${tag.id.trim()}`)
					}
				}}
				size="large"
			>
				{tag.name.trim()}
				{this.props.canEdit && open && (
					<Icon
						inverted
						name="close"
						onClick={() => this.deleteTag(tag.id, tag.name)}
						size="large"
					/>
				)}
			</Label>
		))

		const ShowTags = props => {
			if (props.tags.length > 0) {
				return <Label.Group color="red">{RenderTags}</Label.Group>
			}
			return <Message content="No tags have been added" inverted size="big" />
		}

		return (
			<Provider store={store}>
				<div className="tagsCard">
					<Header as="h2" inverted size="large">
						Tags
						{this.props.canEdit && (
							<Icon
								className="editTagsIcon"
								color={open ? "red" : "blue"}
								inverted
								name={open ? "close" : "pencil"}
								onClick={() => this.setState({ open: !open })}
							/>
						)}
					</Header>
					{ShowTags(this.props)}
					{open && tagsLoaded && (
						<div>
							<Divider hidden />
							<Form size="large">
								<Form.Field>
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
								</Form.Field>
								<Button
									className="tagModalBtn"
									content="Add"
									fluid
									onClick={this.updateTags}
									primary
									size="large"
								/>
							</Form>
						</div>
					)}
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

export default connect(mapStateToProps, {
	removeDiscussionTag,
	removeFallacyTag,
	updateDiscussion,
	updateFallacy
})(TagsCard)
