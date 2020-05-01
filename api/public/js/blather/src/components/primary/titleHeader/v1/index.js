import "./style.css"
import { updateDiscussion } from "redux/actions/discussion"
import { updateFallacy } from "redux/actions/fallacy"
import { connect } from "react-redux"
import { Header, Icon, Input } from "semantic-ui-react"
import PropTypes from "prop-types"
import React, { Component } from "react"

class TitleHeader extends Component {
	constructor(props) {
		super(props)

		this.state = {
			editing: false,
			value: this.props.title
		}
	}

	onChangeTitle = (e, { value }) => this.setState({ value })

	updateHeader = () => {
		const { bearer, id, type } = this.props
		this.setState({ editing: false }, () => {
			if (type === "fallacy") {
				this.props.updateFallacy({
					bearer,
					id,
					title: this.state.value
				})
			}

			if (type === "discussion") {
				this.props.updateDiscussion({
					bearer,
					id,
					title: this.state.value
				})
			}
		})
	}

	render() {
		const { editing, value } = this.state

		const EditIcon = props => {
			if (props.canEdit) {
				return (
					<Icon
						className="editHeaderIcon"
						name={editing ? "close" : "pencil"}
						onClick={() => this.setState({ editing: !editing })}
						size="small"
					/>
				)
			}
			return null
		}

		return (
			<div className={`titleHeader ${editing ? "editing" : ""}`}>
				{this.props.title && (
					<Header as="h1" dividing={this.props.dividing} textAlign={this.props.textAlign}>
						{editing ? (
							<div>
								<Input
									className="titleInput"
									onChange={this.onChangeTitle}
									placeholder="Title"
									value={value}
								/>
								<Icon
									className="editHeaderIcon check"
									name="check"
									onClick={this.updateHeader}
									size="small"
								/>
								{EditIcon(this.props)}
							</div>
						) : (
							<div>
								{this.props.title}
								{EditIcon(this.props)}
								{this.props.subheader && (
									<Header.Subheader>{this.props.subheader}</Header.Subheader>
								)}
							</div>
						)}
					</Header>
				)}

				{!this.props.title && <div className="emptyTitle" />}
			</div>
		)
	}
}

TitleHeader.propTypes = {
	bearer: PropTypes.string,
	canEdit: PropTypes.bool,
	dividing: PropTypes.bool,
	id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	subheader: PropTypes.oneOfType([PropTypes.bool, PropTypes.object, PropTypes.string]),
	textAlign: PropTypes.string,
	title: PropTypes.string,
	type: PropTypes.string,
	updateFallacy: PropTypes.func
}

TitleHeader.defaultProps = {
	canEdit: false,
	dividing: false,
	textAlign: "left",
	updateFallacy
}

const mapStateToProps = (state, ownProps) => ({
	...state.discussion,
	...state.fallacy,
	...ownProps
})

export default connect(mapStateToProps, {
	updateDiscussion,
	updateFallacy
})(TitleHeader)
