import "./style.css"
import { Placeholder, Segment } from "semantic-ui-react"
import PropTypes from "prop-types"
import React, { Component } from "react"

class LazyLoad extends Component {
	render() {
		if (this.props.segment) {
			return (
				<Segment className="placeholderSegment">
					<Placeholder fluid>
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
				</Segment>
			)
		}

		return (
			<Placeholder fluid>
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
