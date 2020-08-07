import "./style.css"
import { Placeholder, Segment } from "semantic-ui-react"
import PropTypes from "prop-types"
import React, { Component, Fragment } from "react"

class LazyLoad extends Component {
	render() {
		const Sample = (
			<Placeholder fluid inverted>
				{this.props.header && (
					<Placeholder.Header image>
						<Placeholder.Line length="medium" />
						<Placeholder.Line length="very short" />
					</Placeholder.Header>
				)}
				<Placeholder.Paragraph>
					<Placeholder.Line length="full" />
					<Placeholder.Line length="very long" />
					<Placeholder.Line length="full" />
				</Placeholder.Paragraph>
			</Placeholder>
		)

		if (this.props.segment) {
			return (
				<Segment className="placeholderSegment" inverted>
					{Sample}
				</Segment>
			)
		}

		return <Fragment>{Sample}</Fragment>
	}
}

LazyLoad.propTypes = {
	header: PropTypes.bool,
	segment: PropTypes.bool
}

LazyLoad.defaultProps = {
	header: true,
	segment: true
}

export default LazyLoad
